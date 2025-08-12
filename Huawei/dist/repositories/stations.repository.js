"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertStations = insertStations;
// repositories/stations.repository.ts
const db_1 = require("../config/db");
function cleanString(str) {
    if (!str)
        return '';
    return str.replace(/[\u200B-\u200F\u202A-\u202E]/g, '').trim();
}
async function insertStations(stations) {
    if (stations.length === 0) {
        console.log('⚠️ No hay estaciones para insertar.');
        return;
    }
    const formatDate = (dateStr) => {
        if (!dateStr)
            return '1970-01-01 00:00:00';
        const d = new Date(dateStr);
        if (isNaN(d.getTime()))
            return '1970-01-01 00:00:00';
        return d.toISOString().slice(0, 19).replace('T', ' ');
    };
    const rows = stations.map(s => ({
        ID_Plant: s.plantCode ?? 'UNKNOWN_PLANT_CODE',
        ID_Client: 'CLIENT_001', // No tienes este dato, puede quedar null
        Name: cleanString(s.plantName) || 'Sin nombre',
        Longitude: s.longitude ?? '0',
        Latitude: s.latitude ?? '0',
        Total_Power: s.capacity != null ? s.capacity.toString() : '0',
        Date_Creation: formatDate(s.gridConnectionDate),
        Address: cleanString(s.plantAddress) || 'Sin dirección',
        City: cleanString(s.plantAddress) || 'Sin ciudad', // Valor por defecto fijo
        Status: 'Activo', // Valor por defecto fijo
        Protocol: 'API_HUAWEI',
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
        const [result] = await db_1.pool.query(insertSQL, [values]);
        const affected = result?.affectedRows ?? 0;
        console.log(`✅ Insertados/actualizados ${affected} registros en Plants`);
    }
    catch (err) {
        console.error('❌ Error al insertar estaciones en DB:', err.message ?? err);
        throw err;
    }
}
