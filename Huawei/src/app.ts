import { getParams } from "./utils/getParams";
import { runSynchronizationJob } from './jobs/initial.job';
// index.ts
import { initScheduler } from './scheduler';



const app = async () => {
  const params = getParams();
  console.log(params)
    try {
        const result = await runSynchronizationJob();
        console.log('Respuesta API Huawei:', result);
      } catch (error) {
        console.error('Error al ejecutar ServiceKpiRealtime:', error);
      }
};

app();