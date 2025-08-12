// repositories/stations.repository.ts
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

interface StationRow {
  ID_Plant: string;
  ID_Client: string | null;
  Name: string;
  Longitude: string;
  Latitude: string;
  Total_Power: string;
  Date_Creation: string;
  Address: string;
  City: string;
  Status: string;
  Protocol: string | null;
  Manufacturer: string | null;
}

function cleanString(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/[\u200B-\u200F\u202A-\u202E]/g, '').trim();
}

export async function insertStations(stations: any[]) {
  if (stations.length === 0) {
    console.log('⚠️ No hay estaciones para insertar.');
    return;
  }

  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '1970-01-01 00:00:00';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '1970-01-01 00:00:00';
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };

  const rows: StationRow[] = stations.map(s => ({
    ID_Plant: s.plantCode ?? 'UNKNOWN_PLANT_CODE',
    ID_Client: 'CLIENT_001', // No tienes este dato, puede quedar null
    Name: cleanString(s.plantName) || 'Sin nombre',
    Longitude: s.longitude ?? '0',
    Latitude: s.latitude ?? '0',
    Total_Power: s.capacity != null ? s.capacity.toString() : '0',
    Date_Creation: formatDate(s.gridConnectionDate),
    Address: cleanString(s.plantAddress) || 'Sin dirección',
    City: cleanString(s.plantAddress) ||'Sin ciudad',  // Valor por defecto fijo
    Status: 'Activo',    // Valor por defecto fijo
    Protocol:'API_HUAWEI',
    Manufacturer: 'HUAWEI',
  }));

  const insertSQL = `
    INSERT INTO Plants
    (ID_Plant, ID_Client, Name, Longitude, Latitude, Total_Power, Date_Creation, Address, City, Status, Protocol, Manufacturer)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      ID_Client = VALUES(ID_Client),
      Name = VALUES(Name),
      Longitude = VALUES(Longitude),
      Latitude = VALUES(Latitude),
      Total_Power = VALUES(Total_Power),
      Date_Creation = VALUES(Date_Creation),
      Address = VALUES(Address),
      City = VALUES(City),
      Status = VALUES(Status),
      Protocol = VALUES(Protocol),
      Manufacturer = VALUES(Manufacturer)
  `;

  const values = rows.map(r => [
    r.ID_Plant,
    r.ID_Client,
    r.Name,
    r.Longitude,
    r.Latitude,
    r.Total_Power,
    r.Date_Creation,
    r.Address,
    r.City,
    r.Status,
    r.Protocol,
    r.Manufacturer,
  ]);

  try {
    console.log('🟡 Ejecutando inserción masiva de estaciones...');
    const [result] = await pool.query<RowDataPacket[]>(insertSQL, [values]);
    const affected = (result as any)?.affectedRows ?? 0;
    console.log(`✅ Insertados/actualizados ${affected} registros en Plants`);
  } catch (err) {
    console.error('❌ Error al insertar estaciones en DB:', (err as Error).message ?? err);
    throw err;
  }
}
