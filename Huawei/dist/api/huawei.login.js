"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuaweiClient = void 0;
// api/huawei.client.ts
const superagent_1 = __importDefault(require("superagent"));
const tough_cookie_1 = require("tough-cookie");
const BASE_URL = 'https://la5.fusionsolar.huawei.com';
class HuaweiClient {
    jar = new tough_cookie_1.CookieJar();
    xsrfToken = null;
    loggedAt = null;
    // login: guarda cookies en jar y extrae token
    async login(userName, systemCode) {
        const body = { userName, systemCode };
        const res = await superagent_1.default
            .post(`${BASE_URL}/thirdData/login`)
            .set('Content-Type', 'application/json')
            .set('User-Agent', 'Mozilla/5.0')
            .set('Referer', BASE_URL)
            .send(body);
        // guardar cookies en jar
        const setCookieHeaders = res.headers['set-cookie'] || [];
        for (const cookie of setCookieHeaders) {
            // tough-cookie (v4) soporta promesas en setCookie
            await this.jar.setCookie(cookie, BASE_URL);
        }
        // actualizar token en memoria
        await this.loadXsrfFromJar();
        this.loggedAt = Date.now();
        return res.body;
    }
    // lee token desde el jar
    async loadXsrfFromJar() {
        const cookies = await this.jar.getCookies(BASE_URL);
        const xs = cookies.find((c) => (c.key ?? c.name) === 'XSRF-TOKEN');
        this.xsrfToken = xs ? (xs.value ?? xs.value) : null;
    }
    // construye header Cookie (todas las cookies válidas)
    async cookieHeader() {
        const cookies = await this.jar.getCookies(BASE_URL);
        return cookies.map((c) => `${c.key ?? c.name}=${c.value}`).join('; ');
    }
    // Asegura estar logueado, re-loguea si pasó más de 30 min (ejemplo)
    async ensureAuth(userName, systemCode) {
        const ttl = 30 * 60 * 1000;
        if (!this.loggedAt || (Date.now() - this.loggedAt) > ttl || !this.xsrfToken) {
            await this.login(userName, systemCode);
        }
    }
    // POST con manejo automático de cookie header y XSRF header
    async post(path, payload) {
        const url = `${BASE_URL}${path}`;
        const cookieHeader = await this.cookieHeader();
        if (!this.xsrfToken) {
            await this.loadXsrfFromJar();
        }
        const res = await superagent_1.default
            .post(url)
            .set('Content-Type', 'application/json')
            .set('User-Agent', 'Mozilla/5.0')
            .set('Referer', BASE_URL)
            .set('Cookie', cookieHeader)
            .set('XSRF-TOKEN', this.xsrfToken || '')
            .send(payload);
        return res.body;
    }
}
exports.HuaweiClient = HuaweiClient;
