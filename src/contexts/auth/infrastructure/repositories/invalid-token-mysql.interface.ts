import { RowDataPacket } from 'mysql2/promise';

export interface IInvalidTokenRow extends RowDataPacket {
    '1': number;
}
