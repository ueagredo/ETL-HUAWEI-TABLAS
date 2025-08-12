// services/kpi.service.ts
import { HuaweiClient } from '../api/huawei.login';
import { insertKpi } from '../repositories/kpi.repository';

const client = new HuaweiClient();
const USER = 'uveimarapi';
const SYS_CODE = 'a1234567';

export async function ServiceKpiRealtime(devIds: string, collectTsMs?: number) {
  await client.ensureAuth(USER, SYS_CODE);

  const payload = { devIds, devTypeId: 1 };
  const result = await client.post('/thirdData/getDevRealKpi', payload);

  console.log('🔍 Raw API result:', JSON.stringify(result, null, 2));

  const rowsToInsert = transformKpiResponse(result, collectTsMs);

  if (rowsToInsert.length > 0) {
    await insertKpi(rowsToInsert, collectTsMs ?? Date.now());
    console.log(`✅ ${rowsToInsert.length} registros de KPI insertados.`);
  } else {
    console.warn('⚠ No se encontraron KPIs para insertar.');
  }

  return result;
}

function transformKpiResponse(apiRes: any, collectTsMs?: number) {
  // Si la API ya devuelve la estructura esperada, simplemente la normalizamos y devolvemos.
  if (Array.isArray(apiRes?.data) && apiRes.data.length > 0 && apiRes.data[0]?.dataItemMap) {
    return apiRes.data.map((d: any) => ({
      devId: d.devId ?? d.deviceId,
      dataItemMap: d.dataItemMap ?? {}
    }));
  }

  // Si la API devuelve devices dentro de data.devices
  if (Array.isArray(apiRes?.data?.devices) && apiRes.data.devices.length > 0 && apiRes.data.devices[0]?.dataItemMap) {
    return apiRes.data.devices.map((d: any) => ({
      devId: d.devId ?? d.deviceId,
      dataItemMap: d.dataItemMap ?? {}
    }));
  }

  // Si la API devuelve una lista plana de KPIs: [{ devId, kpiCode, kpiValue }, ...]
  if (Array.isArray(apiRes?.data) && apiRes.data.length > 0 && (apiRes.data[0].kpiCode || apiRes.data[0].kpiValue)) {
    const grouped: Record<string, any> = {};

    // Normalizador de nombres comunes (por si vienen con camelCase o snake_case)
    const KPI_NAME_MAP: Record<string, string> = {
      activePower: 'active_power',
      active_power: 'active_power',
      activepower: 'active_power',
      temperature: 'temperature',
      reactivePower: 'reactive_power',
      reactive_power: 'reactive_power',
      efficiency: 'efficiency',
      powerFactor: 'power_factor',
      power_factor: 'power_factor',
      dayCap: 'day_cap',
      day_cap: 'day_cap',
      totalCap: 'total_cap',
      total_cap: 'total_cap',
      // agrega más mapeos si los necesitas
    };

    for (const rec of apiRes.data) {
      const devId = rec.devId ?? rec.deviceId ?? rec.device_id;
      if (!devId) continue;

      if (!grouped[devId]) grouped[devId] = {};
      const rawCode = rec.kpiCode ?? rec.code ?? rec.kpi ?? rec.kpi_name;
      const rawValue = rec.kpiValue ?? rec.value ?? rec.kpiValue ?? rec.v;

      // normalizamos la clave
      const normalizedKey = KPI_NAME_MAP[rawCode] ?? (typeof rawCode === 'string' ? rawCode.replace(/([A-Z])/g, '_$1').toLowerCase() : rawCode);
      grouped[devId][normalizedKey] = rawValue;
    }

    return Object.keys(grouped).map(devId => ({
      devId,
      dataItemMap: grouped[devId]
    }));
  }

  // Si no reconocemos la estructura, devolvemos vacío y dejamos que el caller lo loguee
  console.warn('⚠ Estructura de respuesta inesperada al transformar KPIs:', apiRes);
  return [];
}
