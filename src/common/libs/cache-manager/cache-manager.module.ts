import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ICacheManager } from './cache-manager.interface';
import { NestCacheManagerImpl } from './cache-manager.impl';

@Global()
@Module({
    imports: [
        CacheModule.register({
            ttl: 60 * 1000,
        }),
    ],
    providers: [
        {
            provide: ICacheManager,
            useClass: NestCacheManagerImpl,
        },
    ],
    exports: [ICacheManager],
})
export class CacheManagerGlobalModule {}
