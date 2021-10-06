# banggood-aff-api-js
Banggood affiliate API in Nodejs

### Description
This implementation follows the docs from this link: https://imgs3.banggood.com/affiliate/banggood-affiliate-apidoc-v1.2.2.pdf

### Usage
```js
const api = require('./api');
let BanggoodAPI = new api();

// get a list of coupons
BanggoodAPI.getCouponList().then(coupons => console.log(coupons));
```
