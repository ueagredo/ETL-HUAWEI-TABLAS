// repositories/devices.repository.ts
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

interface InverterRow {
  ID_Inverter: string;     
  ID_Plant: string | null; 
  Reference: string | null;       
  Manufacturer: string | null;   
  Inverter_Status: string; 
  Protocol: string;       
  Instalation_Date: string; 
  Operation_Days: string;   
  devTypeId: string | null; 
}

function cleanString(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E]/g, '').trim();
}


export async function insertDevices(devices: any[]): Promise<number> {
  if (!Array.isArray(devices) || devices.length === 0) {
    console.log('⚠️ No hay dispositivos para insertar.');
    return 0;
  }

  const rows: InverterRow[] = devices.map(d => {
    // Usar `id` del JSON como ID_Inverter si está presente; si no, fallback a devDn o generar uno.
    const idRaw = d.id ?? d.devDn ?? null;
    const ID_Inverter = idRaw ? cleanString(idRaw) : `INV_UNKNOWN_${Date.now()}`;

    const ID_Plant = d.stationCode ? cleanString(d.stationCode) : null;

    // Reference: prefer esnCode, si no devName
    const Reference = (d.invType && String(d.invType).trim().length > 0)
      ? cleanString(d.invType)
      : (d.model ? cleanString(d.model) : null);

    // Manufacturer: prefer invType (si trae nombre del inversor), si no usar model
    const Manufacturer = "HUAWEI";

    const Inverter_Status = 'UNKNOWN';
    const Protocol = 'API_HUAWEI';
    const Instalation_Date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const Operation_Days = '0';

    // devTypeId puede ser número o texto; lo guardamos como string si existe, sino null
    const devTypeId = (d.devTypeId !== undefined && d.devTypeId !== null) ? String(d.devTypeId) : null;

    return {
      ID_Inverter,
      ID_Plant,
      Reference,
      Manufacturer,
      Inverter_Status,
      Protocol,
      Instalation_Date,
      Operation_Days,
      devTypeId,
    };
  });

  const insertSQL = `
    INSERT INTO Inverter
    (ID_Inverter, ID_Plant, Reference, Manufacturer, Inverter_Status, Protocol, Instalation_Date, Operation_Days, devTypeId)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      ID_Plant = VALUES(ID_Plant),
      Reference = VALUES(Reference),
      Manufacturer = VALUES(Manufacturer),
      Inverter_Status = VALUES(Inverter_Status),
      Protocol = VALUES(Protocol),
      Instalation_Date = VALUES(Instalation_Date),
      Operation_Days = VALUES(Operation_Days),
      devTypeId = VALUES(devTypeId)
  `;

  const values = rows.map(r => [
    r.ID_Inverter,
    r.ID_Plant,
    r.Reference,
    r.Manufacturer,
    r.Inverter_Status,
    r.Protocol,
    r.Instalation_Date,
    r.Operation_Days,
    r.devTypeId,
  ]);

  try {
    console.log('🟡 Ejecutando inserción masiva de dispositivos (Inverter)...');
    const [result] = await pool.query<RowDataPacket[]>(insertSQL, [values]);
    const affected = (result as any)?.affectedRows ?? 0;
    console.log(`✅ Insertados/actualizados ${affected} registros en Inverter`);
    return affected ?? 0;
  } catch (err) {
    console.error('❌ Error al insertar dispositivos en DB:', (err as Error).message ?? err);
    throw err;
  }
}
