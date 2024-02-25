import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand, ListObjectsV2Command, _Object, CommonPrefix } from "@aws-sdk/client-s3";

@Injectable()
export class FileService {
    private bucketName;
    constructor(private readonly configService: ConfigService) {
        this.bucketName = this.configService.get('BUCKET')
    }


    streamToString = (stream) =>
        new Promise((resolve, reject) => {
            const chunks = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        });


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
            fileReponse.push(file)


        }))
        return fileReponse;

    }
}
