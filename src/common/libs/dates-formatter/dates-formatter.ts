import { isDate } from 'node:util/types';
import { IDatesFormatter } from './dates-formatter.interface';

export class DatesFormatter extends IDatesFormatter {
    toString(date: Date): string {
        if (!isDate(date) || Number.isNaN(date.getTime())) {
            return '0000-00-00 00:00:00';
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    currentDateStr(): string {
        return this.toString(new Date());
    }

    currentDatePlusMinutes(minute: number): string {
        const date = new Date();
        date.setMinutes(date.getMinutes() + minute);
        return this.toString(date);
    }
}
