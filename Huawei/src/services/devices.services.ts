import { HuaweiClient } from '../api/huawei.login';
import { insertDevices } from '../repositories/devices.repository';

export async function Devices(stationCodes) {
  const client = new HuaweiClient();
  
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

  await insertDevices(result.data)
}
