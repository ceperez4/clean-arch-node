import { Global, Module } from '@nestjs/common';
import { DatesFormatter } from './dates-formatter';
import { IDatesFormatter } from './dates-formatter.interface';

@Global()
@Module({
    providers: [
        {
            provide: IDatesFormatter,
            useClass: DatesFormatter,
        },
    ],
    exports: [IDatesFormatter],
})
export class DatesFormatterGlobalModule {}
