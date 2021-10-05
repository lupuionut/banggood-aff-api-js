const process = require('process');
const https = require('https');

class BanggoodAPI {
	constructor() {
		this.apiKey = process.env.BANGGOOD_API_KEY;
		this.apiSecret = process.env.BANGGOOD_API_SECRET;
		this.accessToken = process.env.BANGGOOD_API_TOKEN;
		this.domain = 'https://579d00af-7b6e-492a-aed2-0586cc0d5e80.mock.pstmn.io';
		this.task = '';
		this.options = {
            headers: {
                'access-token' : '',
			},
            method: 'GET',
            params: {},
		};
	}

	accessTokenValid() {
		if (this.accessToken === undefined) {
            return false;
		} else {
            let now = new Date().getTime();
            let token = JSON.parse(this.accessToken);
            if (token.valid < now) {
                return false;
            }
		}
		return true;
	}

	storeAccessToken(token) {
        console.log('storing access token');
        let accessToken = JSON.parse(token);
        this.options.headers['access-token'] = accessToken.value;
        process.env.BANGGOOD_API_TOKEN = token;
	}

	async getAccessToken() {
        console.log('get access token');
        this.task = 'getAccessToken';
		let response = await this.fetch();
		response = JSON.parse(response);
		if (response.code == 200) {
            let token = {};
            token.value = response.result.access_token;
            token.valid = response.result.expires_in + new Date().getTime();
            return JSON.stringify(token);
		}
	}

	async getCouponList(params) {
        this.task = 'coupon/list';
        this.method = 'GET';
        this.options.params = params;
        this.fetch();
	}

    async fetch () {
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

        if (this.accessTokenValid() == false && this.task !== 'getAccessToken') {
            console.log('get new token');
            let token = await this.getAccessToken();
            this.storeAccessToken(token);
        }

        return new Promise((resolve) => {
            const req = https.request(url, this.options, (res) => {
                let data = '';
                res.on('data', (d) => {
                    data += d;
                });

                res.on('end', () => {
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
}

const api = new BanggoodAPI();
let x = api.getCouponList();
