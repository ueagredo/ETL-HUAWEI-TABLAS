// jobs/kpi.job.ts
import { ServiceKpiRealtime } from '../services/realtimekpi.service';
import { returnVariable } from '../utils/returnVariable';

export async function runKpiJob() {


  try {
    // devIds podría venir desde params o desde config
    const devIds = "1000000033663109,1000000033662647";

    const apiRes = await ServiceKpiRealtime (devIds);
    console.log('[KPI job] OK', apiRes);

    // ejemplo de uso de returnVariable (si lo necesitas)
    returnVariable('lastKpiRun', new Date().toISOString());
  } catch (err) {
    console.error('[KPI job] Error:', err);
    // aquí podrías mandar alertas o reintentar
  }
}
