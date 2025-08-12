"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceKpiRealtime = ServiceKpiRealtime;
// services/kpi.service.ts
const huawei_client_1 = require("../api/huawei.client");
const kpi_repository_1 = require("../repositories/kpi.repository");
const client = new huawei_client_1.HuaweiClient();
const USER = 'uveimarapi';
const SYS_CODE = 'a1234567';
async function ServiceKpiRealtime(devIds, collectTsMs) {
    await client.ensureAuth(USER, SYS_CODE);
    const payload = { devIds, devTypeId: 1 };
    const result = await client.post('/thirdData/getDevRealKpi', payload);
    console.log('🔍 Raw API result:', JSON.stringify(result, null, 2));
    const rowsToInsert = transformKpiResponse(result, collectTsMs);
    if (rowsToInsert.length > 0) {
        await (0, kpi_repository_1.insertKpi)(rowsToInsert, collectTsMs ?? Date.now());
        console.log(`✅ ${rowsToInsert.length} registros de KPI insertados.`);
    }
    else {
        console.warn('⚠ No se encontraron KPIs para insertar.');
    }
    return result;
}
/**
 * transformKpiResponse:
 * - acepta varias formas de respuesta de la API:
 *   1) apiRes.data = [{ devId, dataItemMap: { temperature, active_power, ... } }, ...]
 *   2) apiRes.data = [{ devId, kpiCode, kpiValue }, ...] (lista plana de KPIs por dispositivo)
 * - devuelve [{ devId, dataItemMap }, ...]
 */
function transformKpiResponse(apiRes, collectTsMs) {
    // Si la API ya devuelve la estructura esperada, simplemente la normalizamos y devolvemos.
    if (Array.isArray(apiRes?.data) && apiRes.data.length > 0 && apiRes.data[0]?.dataItemMap) {
        return apiRes.data.map((d) => ({
            devId: d.devId ?? d.deviceId,
            dataItemMap: d.dataItemMap ?? {}
        }));
    }
    // Si la API devuelve devices dentro de data.devices
    if (Array.isArray(apiRes?.data?.devices) && apiRes.data.devices.length > 0 && apiRes.data.devices[0]?.dataItemMap) {
        return apiRes.data.devices.map((d) => ({
            devId: d.devId ?? d.deviceId,
            dataItemMap: d.dataItemMap ?? {}
        }));
    }
    // Si la API devuelve una lista plana de KPIs: [{ devId, kpiCode, kpiValue }, ...]
    if (Array.isArray(apiRes?.data) && apiRes.data.length > 0 && (apiRes.data[0].kpiCode || apiRes.data[0].kpiValue)) {
        const grouped = {};
        // Normalizador de nombres comunes (por si vienen con camelCase o snake_case)
        const KPI_NAME_MAP = {
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
            if (!devId)
                continue;
            if (!grouped[devId])
                grouped[devId] = {};
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
