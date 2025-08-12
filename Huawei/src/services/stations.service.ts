import { HuaweiClient } from '../api/huawei.login';
import { insertStations } from '../repositories/stations.repository';

export async function Stations() {
  const client = new HuaweiClient();
  
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

  await insertStations(result.data.list)
  console.log(`✅ Se guardaron ${result.data.list.length} estaciones en la BD`);
  return result.data.list
}
