import {TokenStore} from './TokenStore/TokenStore';

export namespace token {
    // store api token - empty if not set
    let apiToken = '';

    // a callback que to be called after api token refresh
    let callQue: ((error: string) => void)[] = [];
    // flag to check wheter a api refresh is currently pending
    let refreshInProcess = false;
    // store the expire seconds of token
    let expireSeconds = -1;

    let tokenStore: TokenStore;
    let APiHost: string = '/';

    export function init(ts: TokenStore, apiHost?: string): void {
        tokenStore = ts;
        if (apiHost) {
            APiHost = apiHost;
        }
    }

    /**
     * refresh the api token or use that one in cookie if still valid
     * @param callback to be called after successful refresh
     * @param password
     * @param force
     * @param user
     */
    export function refreshAPIToken(callback: (error: string) => void, force?: boolean, password?: string, user?: string): void {
        callQue.push(callback);

        // check if already is a token refresh is in process
        if (refreshInProcess) {
            // if yes return
            return;
        } else {
            // if not set flat
            refreshInProcess = true;
        }

        if (apiTokenValid() && !force) {
            console.log('token still valid...');
            callFuncQue('');
            return;
        }

        const formData = new FormData();
        formData.append('grant_type', 'client_credentials');
        formData.append('client_id', user ? user : 'default');
        formData.append('client_secret', password ? password : 'default');
        formData.append('scope', 'all');

        interface APIToken {
            error?: string;
            // eslint-disable-next-line camelcase
            access_token: string; // no camel case allowed because of backendlib
            // eslint-disable-next-line camelcase
            expires_in: number; // no camel case allowed because of backendlib
            scope: string;
            // eslint-disable-next-line camelcase
            token_type: string; // no camel case allowed because of backendlib
        }

        fetch(APiHost + 'token', {method: 'POST', body: formData})
            .then((response) =>
                response.json().then((result: APIToken) => {
                    if (result.error) {
                        callFuncQue(result.error);
                        return;
                    }
                    // set api token
                    apiToken = result.access_token;
                    // set expire time
                    expireSeconds = new Date().getTime() / 1000 + result.expires_in;
                    // setTokenCookie(apiToken, expireSeconds);
                    tokenStore.setToken({accessToken: apiToken, expireTime: expireSeconds, tokenType: '', scope: ''});
                    // call all handlers and release flag
                    callFuncQue('');
                })
            )
            .catch((e) => {
                callback(e);
            });
    }

    export function apiTokenValid(): boolean {
        // check if a cookie with token is available
        const tmpToken = tokenStore.loadToken();
        if (tmpToken !== null) {
            // check if token is at least valid for the next minute
            if (tmpToken.expireTime > new Date().getTime() / 1000 + 60) {
                apiToken = tmpToken.accessToken;
                expireSeconds = tmpToken.expireTime;

                return true;
            }
        }
        return false;
    }

    /**
     * call all qued callbacks
     */
    function callFuncQue(error: string): void {
        // call all pending handlers
        callQue.map((func) => {
            return func(error);
        });
        // reset pending que
        callQue = [];
        // release flag to be able to start new refresh
        refreshInProcess = false;
    }

    /**
     * check if api token is valid -- if not request new one
     * when finished call callback
     * @param callback function to be called afterwards
     */
    export function checkAPITokenValid(callback: (mytoken: string) => void): void {
        // check if token is valid and set
        if (apiToken === '' || expireSeconds <= new Date().getTime() / 1000) {
            console.log('token not valid...');
            refreshAPIToken(() => {
                callback(apiToken);
            });
        } else {
            callback(apiToken);
        }
    }
}
