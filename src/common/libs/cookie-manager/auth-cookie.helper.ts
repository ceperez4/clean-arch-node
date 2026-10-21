import { CookieSerializeOptions, IAuthCookieHelper, REFRESH_TOKEN_COOKIE_NAME } from './auth-cookie.interface';

export class AuthCookieHelper extends IAuthCookieHelper {
    constructor(private readonly cookieOptions: CookieSerializeOptions) {
        super();
    }

    createRefreshTokenCookie(token: string): string {
        return this.serialize(REFRESH_TOKEN_COOKIE_NAME, token, this.cookieOptions);
    }

    createClearRefreshTokenCookie(): string {
        return this.serialize(REFRESH_TOKEN_COOKIE_NAME, '', {
            ...this.cookieOptions,
            maxAge: 0,
        });
    }

    extractRefreshToken(cookieHeader?: string): string | undefined {
        if (!cookieHeader) return undefined;
        const cookies = this.parse(cookieHeader);
        return cookies[REFRESH_TOKEN_COOKIE_NAME];
    }

    private serialize(name: string, value: string, options: CookieSerializeOptions): string {
        const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

        if (options.maxAge !== undefined) {
            parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
            const expires = new Date(Date.now() + options.maxAge);
            parts.push(`Expires=${expires.toUTCString()}`);
        }
        if (options.domain) {
            parts.push(`Domain=${options.domain}`);
        }
        if (options.path) {
            parts.push(`Path=${options.path}`);
        }
        if (options.httpOnly) {
            parts.push('HttpOnly');
        }
        if (options.secure) {
            parts.push('Secure');
        }
        if (options.sameSite) {
            const sameSiteMap: Record<NonNullable<CookieSerializeOptions['sameSite']>, string> = {
                lax: 'Lax',
                strict: 'Strict',
                none: 'None',
            };
            parts.push(`SameSite=${sameSiteMap[options.sameSite]}`);
        }

        return parts.join('; ');
    }

    private parse(cookieHeader: string): Record<string, string> {
        const list: Record<string, string> = {};
        cookieHeader.split(';').forEach((cookie) => {
            const [name, ...rest] = cookie.split('=');
            if (name) {
                const trimmedName = decodeURIComponent(name.trim());
                list[trimmedName] = decodeURIComponent(rest.join('=').trim());
            }
        });
        return list;
    }
}
