import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IEnvs } from './config/envs';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { createCorsOptions } from './config/cors.config';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableShutdownHooks();

    const configService = app.get(ConfigService);
    const config = configService.get<IEnvs>('envs');
    const appPort = config ? config.appPort : 3000;
    const isProd = config?.isProd ?? false;
    const corsOrigins = config?.corsOrigins ?? ['http://localhost:3000'];

    app.use(helmet());
    app.enableCors(createCorsOptions(corsOrigins, isProd));

    app.useStaticAssets(join(process.cwd(), 'uploads'), {
        prefix: '/public/',
        maxAge: '7d',
        immutable: true,
        setHeaders: (res: { setHeader: (name: string, value: string) => void }) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
        },
    });
    app.setGlobalPrefix('api');

    const configSwagger = new DocumentBuilder()
        .setTitle('APP API')
        .setDescription('Backend Clean Arch')
        .setVersion('1.0')
        .addGlobalResponse({
            status: 500,
            description: 'Internal server error',
        })
        .addBearerAuth()
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, configSwagger);

    SwaggerModule.setup('docs', app, documentFactory);

    await app.listen(appPort);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
