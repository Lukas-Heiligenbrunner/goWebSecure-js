import {Token, TokenStore} from './TokenStore';

export class CookieTokenStore extends TokenStore {
    loadToken(): Token | null {
        const token = this.decodeCookie('token');
        const expireInString = this.decodeCookie('token_expire');
        const expireIn = parseInt(expireInString, 10);

        if (expireIn !== 0 && token !== '') {
            return {accessToken: token, expireTime: expireIn, scope: '', tokenType: ''};
        } else {
            return null;
        }
    }

    /**
     * set the cookie for the currently gotten token
     * @param token the token to set
     */
    setToken(token: Token): void {
        let d = new Date();
        d.setTime(token.expireTime * 1000);
        console.log('token set' + d.toUTCString());
        let expires = 'expires=' + d.toUTCString();
        document.cookie = 'token=' + token.accessToken + ';' + expires + ';path=/';
        document.cookie = 'token_expire=' + token.expireTime + ';' + expires + ';path=/';
    }

    /**
     * decode a simple cookie with key specified
     * @param key cookie key
     */
    decodeCookie(key: string): string {
        let name = key + '=';
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }
}
