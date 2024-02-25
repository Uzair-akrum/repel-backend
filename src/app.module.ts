import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileModule } from './file/file.module';
import { ConfigModule } from '@nestjs/config';
import { ValdiationMiddleware } from './middleware/validateType';

@Module({
  imports: [FileModule, ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ValdiationMiddleware).forRoutes({ path: '/file', method: RequestMethod.POST });
  }
}

