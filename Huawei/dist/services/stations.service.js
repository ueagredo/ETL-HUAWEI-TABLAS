"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stations = Stations;
const huawei_login_1 = require("../api/huawei.login");
const stations_repository_1 = require("../repositories/stations.repository");
async function Stations() {
    const client = new huawei_login_1.HuaweiClient();
    const USER = 'uveimarapi';
    const SYS_CODE = 'a1234567';
    // 1️⃣ Verificar login
    await client.ensureAuth(USER, SYS_CODE);
    // 2️⃣ Llamar al nuevo endpoint
    const result = await client.post('/thirdData/stations', {
        pageNo: 1
    });
    if (!result.data?.list || !Array.isArray(result.data.list)) {
        console.error('Respuesta inesperada de Huawei:', result);
        return;
    }
    await (0, stations_repository_1.insertStations)(result.data.list);
    console.log(`✅ Se guardaron ${result.data.list.length} estaciones en la BD`);
    return result.data.list;
}
