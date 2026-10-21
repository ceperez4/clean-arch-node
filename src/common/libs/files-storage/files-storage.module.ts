import { Global, Module } from '@nestjs/common';
import { LocalFileStorage } from './local-file-storage';
import { ConfigService } from '@nestjs/config';
import { IFileStorage } from './file-storage.interface';

@Global()
@Module({
    providers: [
        {
            provide: IFileStorage,
            useFactory: (config: ConfigService) => {
                return new LocalFileStorage({
                    appUrl: config.get<string>('envs.appUrl')!,
                });
            },
            inject: [ConfigService],
        },
    ],
    exports: [IFileStorage],
})
export class FilesStorageGlobalModule {}
