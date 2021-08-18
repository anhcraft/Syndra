import Cookies from 'js-cookie'
import axios from "axios";
import {JwtPayload} from "jsonwebtoken";

const jwt = require('jsonwebtoken');

const JWT_COOKIE_NAME = "minehot-jwt"
const JWT_COOKIE_DURABILITY = 24 * 60 * 60 * 1000
const API_SERVER = "https://taikhoan.minehot.com/api/index.php"
const JWT_PUBLIC_KEY = `
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCWwqoUKduJajTA8HJnOiFei5Ox
/RFNVdt2zQgqO9OJFRQlUAQbiFk3O8J5wQeXqMyAMB9fPZTu2igCJXY4F9EFFVhE
raV1P97oEPEIt4zBuj+TjJeo9qPz66chiaUUxd/PSxsVEO0lGsERHlD4G96YZzP6
GzFbTJ5L/vNxSrW5OQIDAQAB
-----END PUBLIC KEY-----
`;

export default {
    // get the stored JWT from cookie
    getToken: function (): string | undefined {
        return Cookies.get(JWT_COOKIE_NAME)
    },

    // set JWT to cookies
    setToken: function (token: string | null) {
        if(token == null) {
            Cookies.remove(JWT_COOKIE_NAME);
        } else {
            Cookies.set(JWT_COOKIE_NAME, token, {
                expires: new Date(new Date().getTime() + JWT_COOKIE_DURABILITY)
            })
        }
    },

    getOnlinePlayers(callback: any) {
        axios.get("https://mcapi.us/server/status?ip=minehot.com").then((res) => {
            callback.call(null, res.data.players.now);
        });
    },

    getInfo: function(callback: any) {
        jwt.verify(this.getToken(), JWT_PUBLIC_KEY, { algorithms: ['RS256'] }, function(err: any, decoded: JwtPayload) {
            if(err == null){
                callback.call(null, {
                    user: decoded["user_id"],
                    email: decoded["user_email"]
                });
            } else {
                callback.call(null, null);
            }
        });
    },

    // send login request with given username and password
    // returned code: 0 (success), 1 (unknown account), 2 (wrong password), 3 (other errors)
    logIn(user: string, pass: string, callback: any) {
        const params = new URLSearchParams();
        params.append("endpoint", "login");
        params.append("user", user);
        params.append("pass", pass);
        axios.post(API_SERVER, params, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((res) => {
            callback.call(null, res.data);
        }).catch((err) => {
            callback.call(null, null);
        })
    },

    signUp(param: { user: string; pass: string; email: string, captcha: string }, callback: any) {
        const params = new URLSearchParams();
        params.append("endpoint", "signup");
        params.append("user", param.user);
        params.append("pass", param.pass);
        params.append("email", param.email);
        params.append("captcha", param.captcha);
        axios.post(API_SERVER, params, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((res) => {
            callback.call(null, res.data);
        }).catch((err) => {
            callback.call(null, null);
        })
    },

    getCardStatus(callback: any) {
        const params = new URLSearchParams();
        params.append("endpoint", "get-card-providers");
        axios.post(API_SERVER, params, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((res) => {
            if(res.data.code == 0) {
                callback.call(null, res.data.result);
            } else {
                callback.call(null, null);
            }
        }).catch((err) => {
            callback.call(null, null);
        })
    },

    getCollections(callback: any) {
        const params = new URLSearchParams();
        params.append("endpoint", "get-collections");
        params.append("token", this.getToken() as string);
        axios.post(API_SERVER, params, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((res) => {
            if(res.data.code == 0) {
                callback.call(null, res.data.result);
            } else {
                callback.call(null, null);
            }
        }).catch((err) => {
            callback.call(null, null);
        })
    },

    sendCard(param: { server: string; amount: number; code: string; provider: string; serial: string }, callback: any) {
        const params = new URLSearchParams();
        params.append("endpoint", "send-card");
        params.append("token", this.getToken() as string);
        params.append("server", param.server);
        params.append("amount", String(param.amount));
        params.append("code", param.code);
        params.append("provider", param.provider);
        params.append("serial", param.serial);
        axios.post(API_SERVER, params, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((res) => {
            callback.call(null, res.data);
        }).catch((err) => {
            callback.call(null, null);
        })
    },

    getServerList(callback: any) {
        const params = new URLSearchParams();
        params.append("endpoint", "get-server-lists");
        axios.post(API_SERVER, params, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((res) => {
            if(res.data.code == 0) {
                callback.call(null, res.data.result);
            } else {
                callback.call(null, null);
            }
        }).catch((err) => {
            callback.call(null, null);
        })
    },

    getTransactions(callback: any) {
        const params = new URLSearchParams();
        params.append("endpoint", "get-transactions");
        axios.post(API_SERVER, params, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((res) => {
            if(res.data.code == 0) {
                callback.call(null, res.data.result);
            } else {
                callback.call(null, null);
            }
        }).catch((err) => {
            callback.call(null, null);
        })
    },

    getPlayerInfo(callback: any) {
        const params = new URLSearchParams();
        params.append("endpoint", "get-info");
        params.append("token", this.getToken() as string);
        axios.post(API_SERVER, params, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((res) => {
            if(res.data.code == 0) {
                callback.call(null, res.data.result);
            } else {
                callback.call(null, null);
            }
        }).catch((err) => {
            callback.call(null, null);
        })
    },

    getDonationTop(callback: any) {
        const params = new URLSearchParams();
        params.append("endpoint", "get-donation-top");
        params.append("token", this.getToken() as string);
        axios.post(API_SERVER, params, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((res) => {
            if(res.data.code == 0) {
                callback.call(null, res.data.result);
            } else {
                callback.call(null, null);
            }
        }).catch((err) => {
            callback.call(null, null);
        })
    },

    changePassword(pass1: string, pass2: string, callback: any) {
        const params = new URLSearchParams();
        params.append("endpoint", "change-password");
        params.append("token", this.getToken() as string);
        params.append("pass1", pass1);
        params.append("pass2", pass2);
        axios.post(API_SERVER, params, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((res) => {
            callback.call(null, res.data);
        }).catch((err) => {
            callback.call(null, null);
        })
    },

    recoverPassword(user: string, captcha: string, callback: any) {
        const params = new URLSearchParams();
        params.append("endpoint", "recover-password");
        params.append("user", user);
        params.append("captcha", captcha);
        axios.post(API_SERVER, params, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((res) => {
            callback.call(null, res.data);
        }).catch((err) => {
            callback.call(null, null);
        })
    },

    changeEmail(email: string, callback: any) {
        const params = new URLSearchParams();
        params.append("endpoint", "change-email");
        params.append("token", this.getToken() as string);
        params.append("email", email);
        axios.post(API_SERVER, params, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((res) => {
            callback.call(null, res.data);
        }).catch((err) => {
            callback.call(null, null);
        })
    }
};
