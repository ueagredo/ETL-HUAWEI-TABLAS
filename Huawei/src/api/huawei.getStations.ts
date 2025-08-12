// api/huawei.example.ts
import { HuaweiClient } from './huawei.login';

async function getStationList() {
  const huawei = new HuaweiClient();
  
  const userName = process.env.HUAWEI_USER!;
  const systemCode = process.env.HUAWEI_PASS!;

  // 1️⃣ Verificar login
  await huawei.ensureAuth(userName, systemCode);

  // 2️⃣ Llamar al nuevo endpoint
  const result = await huawei.post('/thirdData/getStationList', {
    pageNo: 1,
    pageSize: 50
  });

  console.log('Stations:', result);
}

getStationList().catch(console.error);
