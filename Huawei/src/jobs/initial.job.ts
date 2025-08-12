// jobs/kpi.job.ts
import { Devices } from '../services/devices.services';
import { Stations } from '../services/stations.service'


export async function runSynchronizationJob() {


  try {

    const StationsCode = await Stations ();
    const stationCodes = StationsCode.map(u => u.plantCode)
    console.log(stationCodes)
    const DevicesCodes = await Devices(stationCodes);

  } catch (err) {
    console.error('[KPI job] Error:', err);
    // aquí podrías mandar alertas o reintentar
  }
}
