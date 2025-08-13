// jobs/kpi.job.ts
import { ServiceKpiRealtime } from '../services/realtimekpi.service';
import { returnVariable } from '../utils/returnVariable';

export async function runKpiJob(devIds) {


  try {;

    const apiRes = await ServiceKpiRealtime (devIds);
    console.log('[KPI job] OK', apiRes);

    // ejemplo de uso de returnVariable (si lo necesitas)
    returnVariable('lastKpiRun', new Date().toISOString());
  } catch (err) {
    console.error('[KPI job] Error:', err);
    // aquí podrías mandar alertas o reintentar
  }
}
