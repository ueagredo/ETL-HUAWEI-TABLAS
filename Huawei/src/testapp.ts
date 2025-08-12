import { runSynchronizationJob } from './jobs/initial.job';

(async () => {
  try {
    const result = await runSynchronizationJob();
    console.log('Respuesta API Huawei:', result);
  } catch (error) {
    console.error('Error al ejecutar ServiceKpiRealtime:', error);
  }
})();