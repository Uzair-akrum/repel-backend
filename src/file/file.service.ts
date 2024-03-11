import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand, ListObjectsV2Command, _Object, CommonPrefix } from "@aws-sdk/client-s3";
import multer, { Multer, memoryStorage } from 'multer';
const fs = require('fs')
const path = require('path');
const fsPromise = require('fs/promises')
import { diff_match_patch } from 'diff-match-patch';

@Injectable()
export class FileService {
    private bucketName;
    private dmp;

    constructor(private readonly configService: ConfigService) {
        this.bucketName = this.configService.get('BUCKET')
        this.dmp = new diff_match_patch();
    }


    isValidFileName(fileName) {
        return /\.(js|json)$/.test(fileName);
    }
    async getCachedFiles(body) {
        const { path, project, type } = body;
        if (type == FileType.FILE) {
            const filePath = path.join(process.cwd(), `/${project}/${path}`)
            const file = fs.readFileSync(filePath).toString('utf8')
            return file
        }
        else if (type == FileType.DIRECTORY) {
            const files = await fsPromise.readdir(path)
            return files
        }
    }
    streamToString = (stream) =>
        new Promise((resolve, reject) => {
            const chunks = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        });


    uploadToFileStorage = async (project, file) => {
        const { fileName, content } = file;
        if (this.isValidFileName(fileName)) {
            const filePath = path.join(process.cwd(), `/${fileName}`)
            fs.writeFileSync(filePath, content)
        } else {
            const folderPath = path.join(process.cwd(), `/${fileName}`);
            const dirCreation = await fsPromise.mkdir(folderPath);
        }

    }

    createNewProject = async (body) => {


        const { name, project } = body;

        const client = new S3Client({
            region: this.configService.get('REGION'),
            credentials: {
                accessKeyId: this.configService.get('ACCESS_KEY'),
                secretAccessKey: this.configService.get('SECRET_ACCESS_KEY')
            }
        });
        const input = {
            Bucket: this.bucketName,
            Prefix: `base/${project}/`,
            Key: `base/${project}/`,
            ContinuationToken: null

        }
        const command = new ListObjectsV2Command(input);
        const response = await client.send(command);
        const objects = response.Contents;
        const fileReponse = [];

        await Promise.all(objects.map(async (object: { Key: string }) => {
            const getObjectParams = {
                Bucket: this.bucketName,
                Key: object.Key,
            };
            const getCommand = new GetObjectCommand(getObjectParams);
            const { Body } = await client.send(getCommand);
            const bodyContents = await this.streamToString(Body)
            const file = { fileName: object.Key.replace('base/', ''), content: bodyContents }
            await this.uploadToFileStorage(project, file)
            fileReponse.push(file)
        }))

        return fileReponse;

    }
    modifyFile = async (body) => {
        const { fileName, content, project } = body;
        const filePath = path.join(process.cwd(), `/${project}/${fileName}`)
        const fileInDirectory = fs.readFileSync(filePath).toString('utf8');
        const diff = this.dmp.diff_main(fileInDirectory, content);
        return diff


    }
}
