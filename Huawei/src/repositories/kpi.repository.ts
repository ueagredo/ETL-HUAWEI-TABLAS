// repositories/kpi.repository.ts
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

interface KpiRow {
  ID_Inverter: string;
  ts: string;
  temperature: number | null;
  active_power: number | null;
  reactive_power: number | null;
  efficiency: number | null;
  power_factor: number | null;
  day_cap: number | null;
  total_cap: number | null;
  extra_data: string;
}

/**
 * devices: array de { devId, dataItemMap }
 * collectTsMs: timestamp numérico (ms)
 */
export async function insertKpi(devices: Array<{ devId: string, dataItemMap: Record<string, any> }>, collectTsMs: number) {
  // 1) Formatea timestamp (igual a tu ETL original)
  const ts = new Date(collectTsMs)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

  // 2) Prepara los datos (mapeo seguro de campos)
  const rows: KpiRow[] = devices.map(device => {
    const k = device.dataItemMap ?? {};

    const temperature    = k.temperature ?? null;
    const active_power   = k.active_power ?? k.activePower ?? null;
    const reactive_power = k.reactive_power ?? k.reactivePower ?? null;
    const efficiency     = k.efficiency ?? null;
    const power_factor   = k.power_factor ?? k.powerFactor ?? null;
    const day_cap        = k.day_cap ?? k.dayCap ?? null;
    const total_cap      = k.total_cap ?? k.totalCap ?? null;

    const extra = { ...k };
    [
      'temperature',
      'active_power',
      'reactive_power',
      'efficiency',
      'power_factor',
      'day_cap',
      'total_cap',
      'activePower',
      'reactivePower',
      'powerFactor',
      'dayCap',
      'totalCap'
    ].forEach(key => delete extra[key]);

    return {
      ID_Inverter: device.devId,
      ts,
      temperature,
      active_power,
      reactive_power,
      efficiency,
      power_factor,
      day_cap,
      total_cap,
      extra_data: JSON.stringify(extra ?? {})
    };
  });

  if (rows.length === 0) {
    console.log('⚠️ No hay lecturas de inversores para insertar.');
    return;
  }

  // 3) Inserción masiva con ON DUPLICATE KEY UPDATE
  const insertSQL = `
    INSERT INTO Inverter_readings (
      ID_Inverter, ts,
      temperature, active_power, reactive_power, efficiency, power_factor, day_cap, total_cap,
      extra_data
    ) VALUES ?
    ON DUPLICATE KEY UPDATE
      temperature    = VALUES(temperature),
      active_power   = VALUES(active_power),
      reactive_power = VALUES(reactive_power),
      efficiency     = VALUES(efficiency),
      power_factor   = VALUES(power_factor),
      day_cap        = VALUES(day_cap),
      total_cap      = VALUES(total_cap),
      extra_data     = VALUES(extra_data)
  `;

  // Convertir rows a array de arrays para VALUES ?
  const values = rows.map(r => [
    r.ID_Inverter,
    r.ts,
    r.temperature,
    r.active_power,
    r.reactive_power,
    r.efficiency,
    r.power_factor,
    r.day_cap,
    r.total_cap,
    r.extra_data
  ]);

  try {
    console.log('🟡 Ejecutando inserción masiva de lecturas...');
    const [result] = await pool.query<RowDataPacket[]>(insertSQL, [values]);
    const affected = (result as any)?.affectedRows ?? (Array.isArray(result) ? (result as any)[0]?.affectedRows : undefined) ?? 0;
    console.log(`✅ Insertados/actualizados ${affected} registros en inverter_readings`);
  } catch (err) {
    console.error('❌ Error al insertar lecturas en DB:', (err as Error).message ?? err);
    throw err;
  }
}
