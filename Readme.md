# banggood-aff-api-js
Banggood affiliate API in Nodejs

### Description
This implementation follows the docs from this link: https://imgs3.banggood.com/affiliate/banggood-affiliate-apidoc-v1.2.2.pdf

### Usage
```js
const api = require('./api');
let BanggoodAPI = new api();

// load the stored token
BanggoodAPI.loadAccessToken().then((api) => {

    // validate the token
    api.accessTokenValid().then(async (valid) => {

        // if token is invalid/is not stored, try to get a new one
                if (valid == false) {
                        valid = await api.getAccessToken();
                }

                // if we succeed, perform the rest operations
                if (valid) {
                        console.log(api);
                }
    });
});
```
