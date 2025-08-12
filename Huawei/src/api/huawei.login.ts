// api/huawei.client.ts
import superagent from 'superagent';
import { CookieJar } from 'tough-cookie';

const BASE_URL = 'https://la5.fusionsolar.huawei.com';

export class HuaweiClient {
  private jar = new CookieJar();
  private xsrfToken: string | null = null;
  private loggedAt: number | null = null;

  // login: guarda cookies en jar y extrae token
  public async login(userName: string, systemCode: string) {

    
    const body = { userName, systemCode };

    const res = await superagent
      .post(`${BASE_URL}/thirdData/login`)
      .set('Content-Type', 'application/json')
      .set('User-Agent', 'Mozilla/5.0')
      .set('Referer', BASE_URL)
      .send(body);

    // guardar cookies en jar
    const setCookieHeaders: string[] = res.headers['set-cookie'] || [];
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
  private async loadXsrfFromJar() {
    const cookies = await this.jar.getCookies(BASE_URL);
    const xs = cookies.find((c: any) => (c.key ?? c.name) === 'XSRF-TOKEN');
    this.xsrfToken = xs ? (xs.value ?? xs.value) : null;
  }

  // construye header Cookie (todas las cookies válidas)
  private async cookieHeader(): Promise<string> {
    const cookies = await this.jar.getCookies(BASE_URL);
    return cookies.map((c: any) => `${c.key ?? c.name}=${c.value}`).join('; ');
  }

  // Asegura estar logueado, re-loguea si pasó más de 30 min (ejemplo)
  public async ensureAuth(userName: string, systemCode: string) {
    const ttl = 30 * 60 * 1000;
    if (!this.loggedAt || (Date.now() - this.loggedAt) > ttl || !this.xsrfToken) {
      await this.login(userName, systemCode);
    }
  }

  // POST con manejo automático de cookie header y XSRF header
  public async post(path: string, payload: any) {
    const url = `${BASE_URL}${path}`;
    const cookieHeader = await this.cookieHeader();
    if (!this.xsrfToken) {
      await this.loadXsrfFromJar();
    }

    const res = await superagent
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
