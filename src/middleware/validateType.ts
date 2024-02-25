import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";
import { project } from "./projects.enum";



@Injectable()
export class ValdiationMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const { body } = req as any

        if (body && Object.values(project).includes(body.project)) {
            next();
        } else {
            throw new HttpException('Invalid project', HttpStatus.BAD_REQUEST);
        }



    }
}