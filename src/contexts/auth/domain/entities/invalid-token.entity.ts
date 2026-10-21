export interface PrimitiveInvalidToken {
    payload: string;
    expiration: Date;
}

export class InvalidToken {
    public attributes: PrimitiveInvalidToken;

    constructor(attributes: { payload: string; expiration: Date | string }) {
        this.attributes = {
            payload: attributes.payload,
            expiration: attributes.expiration instanceof Date ? attributes.expiration : new Date(attributes.expiration),
        };
    }

    static create(entity: { payload: string; expiration: Date | string }): InvalidToken {
        return new InvalidToken({
            payload: entity.payload,
            expiration: entity.expiration,
        });
    }
}
