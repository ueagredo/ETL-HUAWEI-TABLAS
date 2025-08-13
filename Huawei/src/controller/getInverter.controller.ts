import { runKpiJob } from '../jobs/kpi.job';
import superagent from 'superagent';

const tablesUrl = 'https://tablas.ibisagroup.com';
const endpoint = `${tablesUrl}/api/v1/rows/query/Inverter`;

// Cache en memoria
let cache: { timestamp: number; devIds: string } | null = null;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function getInvertersByType(token: string) {
  try {
    // Si la caché está vigente, usarla
    if (cache && Date.now() - cache.timestamp < ONE_DAY_MS) {
      console.log('Usando caché de inverters:', cache.devIds);
      await runKpiJob(cache.devIds);
      return;
    }

    const body = {
      limit: 100,
      offset: 0,
      orders: [{ orderBy: 'id', sortOrder: 'DESC' }],
      conditions: [
        {
          column: 'devTypeId',
          comparator: '=',
          value: '1',
          next: 'AND',
        },
      ],
    };

    const res = await superagent
      .post(endpoint)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

    const devIds = res.body.data.map((u: { ID_Inverter: string }) => u.ID_Inverter).join(',');
    console.log('Inverters obtenidos:', devIds);

    // Guardar en caché
    cache = { timestamp: Date.now(), devIds };

    await runKpiJob(devIds);
  } catch (err) {
    console.error('Error al consultar Inverters:', err);
  }
}
