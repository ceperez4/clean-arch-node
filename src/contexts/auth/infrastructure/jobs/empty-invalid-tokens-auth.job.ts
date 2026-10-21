import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmptyInvalidTokensAuthUseCase } from '../../application/empty-invalid-tokens-auth-use-cases/empty-invalid-tokens-auth.use-case';

@Injectable()
export class EmptyInvalidTokenAuthJob {
    private readonly logger = new Logger(EmptyInvalidTokenAuthJob.name);

    constructor(private moduleRef: ModuleRef) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        this.logger.log('Iniciando limpieza de tokens expirados...');
        try {
            const useCase = await this.moduleRef.resolve(EmptyInvalidTokensAuthUseCase);
            await useCase.execute();
            this.logger.log('Limpieza de tokens expirados completada con éxito.');
        } catch (error) {
            this.logger.error('Error al limpiar los tokens expirados', error);
        }
    }
}
