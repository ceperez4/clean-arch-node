import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from '@nestjs/cache-manager';
import { ICacheManager } from './cache-manager.interface';

@Injectable()
export class NestCacheManagerImpl implements ICacheManager {
    constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

    async get<T>(key: string): Promise<T | null> {
        const result = await this.cache.get<T>(key);
        return result ?? null;
    }

    async set<T>(key: string, value: T, ttlMilliseconds?: number): Promise<void> {
        await this.cache.set(key, value, ttlMilliseconds);
    }

    async del(key: string): Promise<void> {
        await this.cache.del(key);
    }

    async reset(): Promise<void> {
        await this.cache.clear();
    }
}
