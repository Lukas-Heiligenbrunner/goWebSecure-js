# GoWebSecure-js 
A go/js framework to simplify the creation of a restuful api service application.

## Example Code
### Initialization
```js
// initialize TokenStore and APIUrl
token.init(new MMKVTokenStore(), APIURL);

let pwdneeded: boolean | null = null;

// check if token is already valid
if (token.apiTokenValid()) {
  pwdneeded = false;
} else {
  // refresh api token if not valid
  token.refreshAPIToken((err) => {
    // check if err is because of invalid client or another errror (maybe no internet)
    if (err === 'invalid_client') {
      // handle a login page or sth
    } else if (err === '') {
      // everything is fine
    } else {
      console.log('unimplemented token error: ' + err);
      // todo handle no internet/wrong server path errors correctly
    }
  });
}
```

### Perform API request

```javascript
callAPI("testnode", {action: "testAction", SomeArg: true}, (resp) => {
    // here we received the response
    console.log(resp)
})
```