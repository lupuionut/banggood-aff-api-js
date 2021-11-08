import process from 'process';
import https from 'https';
import md5 from 'nodejs-md5';
import crypto from 'crypto';
import fs from 'fs';

export class BanggoodAPI {
    constructor() {
        this.apiKey = process.env.BANGGOOD_API_KEY;
        this.apiSecret = process.env.BANGGOOD_API_SECRET;
        this.accessToken = '';
        //this.domain = 'https://res.cloudinary.com/ionutlupu/raw/upload/api';
        this.domain = 'https://affapi.banggood.com';
        this.task = '';
        this.options = {
            headers: {
                'access-token': '',
            },
            method: 'GET',
            params: {},
        };
        this.tokenJson = './token.json';
    }

    async accessTokenValid() {
        if (this.accessToken === '') {
            console.log('no access token');
            let token = await this.getAccessToken();
            if (token === false) {
                return false;
            } else {
                this.setAccessToken(token);
                return true;
            }
        } else {
            let now = new Date().getTime();
            let token = JSON.parse(this.accessToken);
            if (token.valid < now) {
                console.log('token expired');
                return false;
            }
        }
        return true;
    }

    setAccessToken(token) {
        let accessToken = JSON.parse(token);
        this.accessToken = token;
        this.options.headers['access-token'] = accessToken.value;
        this.storeAccessToken(token, this.tokenJson);
    }

    setAccessTokenFile(file) {
        this.tokenJson = file;
    }

    storeAccessToken(token, location) {
        fs.writeFile(location, JSON.stringify(token), () => { });
    }

    async loadAccessToken() {
        return new Promise((resolve) => {
            fs.readFile(this.tokenJson, (err, data) => {
                if (!err) {
                    console.log('loaded access token from file');
                    let decoded = JSON.parse(data.toString());
                    this.setAccessToken(decoded);
                }
                resolve(this);
            });
        });
    }

    async getAccessToken() {
        if (!this.apiKey || !this.apiSecret) {
            console.log('BANGGOOD_API_KEY and/or BANGGOOD_API_SECRET env variables are not set');
            return false;
        };
        console.log('getting new access token');
        this.task = 'getAccessToken';
        let params = {};
        params['api_key'] = this.apiKey;
        params['noncestr'] = await this.generateRandomString();
        params['timestamp'] = new Date().getTime();
        params['signature'] = await this.generateMD5(
            'api_key=' + params['api_key'] + '&' +
            'api_secret=' + this.apiSecret + '&' +
            'noncestr=' + params['noncestr'] + '&' +
            'timestamp=' + params['timestamp']
        );
        this.options.params = params;

        let response = await this.fetch();
        response = JSON.parse(response);
        if (response.code == 200) {
            let token = {};
            token.value = response.result.access_token;
            token.valid = (response.result.expires_in * 1000) + new Date().getTime();
            return JSON.stringify(token);
        } else {
            console.log('Error getting an access token: ', response.msg);
            return false;
        }
    }

    /*
        remove the file that stores the access token
    */
    async removeAccessToken() {
        return new Promise((resolve) => {
            fs.rm(this.tokenJson, (err) => {
                if (err) {
                    console.log(err.message);
                }
                resolve();
            });
        });
    }

    async getCouponList(params) {
        this.task = 'coupon/list';
        this.method = 'GET';
        this.options.params = params;
        return this.fetch();
    }

    async getCouponDetails(params) {
        this.task = 'coupon/detail';
        this.method = 'GET';
        this.options.params = params;
        return this.fetch();
    }

    async getProductList(params) {
        this.task = 'product/list';
        this.method = 'GET';
        this.options.params = params;
        return this.fetch();
    }

    async getProductCategory(params) {
        this.task = 'product/category';
        this.method = 'GET';
        this.options.params = params;
        return this.fetch();
    }

    async getProductDetail(params) {
        this.task = 'product/detail';
        this.method = 'GET';
        this.options.params = params;
        return this.fetch();
    }

    async getCountriesList(params) {
        this.task = 'countries/list';
        this.method = 'GET';
        this.options.params = params;
        return this.fetch();
    }

    async fetch() {
        let url = this.domain + '/' + this.task;
        if (this.method == 'POST') {
            this.options.headers['Content-type'] = 'application/json';
        } else {
            if (this.options.params) {
                url += '?' + Object.entries(this.options.params)
                    .flatMap(e => { return e[0] + '=' + e[1]; })
                    .join('&');
            }
        }

        return new Promise((resolve) => {
            const req = https.request(url, this.options, (res) => {
                let data = '';
                res.on('data', (d) => {
                    data += d;
                });

                res.on('end', () => {
                    this.options.params = {};
                    resolve(data);
                });
            });

            req.on('error', (e) => {
                console.error(e.code);
            });
            if (this.options.params) {
                req.write(JSON.stringify(this.options.params));
            }
            req.end();
        });
    }

    async generateRandomString() {
        return new Promise((resolve) => {
            crypto.generateKey('hmac', { length: 128 }, (err, key) => {
                resolve(key.export().toString('hex'));
            })
        });
    }

    async generateMD5(string) {
        return new Promise((resolve) => {
            md5.string.quiet(string, (err, val) => {
                resolve(val);
            });
        })
    }
}
