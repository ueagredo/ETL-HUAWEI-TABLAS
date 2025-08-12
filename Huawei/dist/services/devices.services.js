"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Devices = Devices;
const huawei_login_1 = require("../api/huawei.login");
const devices_repository_1 = require("../repositories/devices.repository");
async function Devices(stationCodes) {
    const client = new huawei_login_1.HuaweiClient();
    const USER = 'uveimarapi';
    const SYS_CODE = 'a1234567';
    // 1️⃣ Verificar login
    await client.ensureAuth(USER, SYS_CODE);
    // 2️⃣ Llamar al nuevo endpoint
    const result = await client.post('/thirdData/getDevList', {
        stationCodes: stationCodes.join(',')
    });
    console.log('devices:', result.data);
    if (!result?.data || !Array.isArray(result?.data)) {
        console.error('Respuesta inesperada de Huawei:', result);
        return;
    }
    await (0, devices_repository_1.insertDevices)(result.data);
}
