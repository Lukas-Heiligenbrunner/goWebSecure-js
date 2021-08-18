export interface Token {
    accessToken: string;
    expireTime: number; // second time when token will be invalidated
    scope: string;
    tokenType: string;
}

export abstract class TokenStore {
    abstract loadToken(): Token | null;
    abstract setToken(token: Token): void;
}
