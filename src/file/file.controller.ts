import { Body, Controller, Get, Post } from '@nestjs/common';
import { FileService } from './file.service';
@Controller('file')
export class FileController {
    constructor(private readonly fileService: FileService) { }

    @Post('/')
    async createNewProject(@Body() body) {

        const response = await this.fileService.createNewProject(body);
        return response
    }

    @Post('/cachedfile')
    async getCachedFile(@Body() body) {
        const response = await this.fileService.getCachedFiles(body);
        return response
    }

    @Post('/modifyFile')
    async modifyFile(@Body() body) {

        const response = await this.fileService.modifyFile(body);
        return response
    }
}   
