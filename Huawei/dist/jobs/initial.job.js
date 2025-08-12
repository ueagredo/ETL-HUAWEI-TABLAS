"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSynchronizationJob = runSynchronizationJob;
// jobs/kpi.job.ts
const devices_services_1 = require("../services/devices.services");
const stations_service_1 = require("../services/stations.service");
async function runSynchronizationJob() {
    try {
        const StationsCode = await (0, stations_service_1.Stations)();
        const stationCodes = StationsCode.map(u => u.plantCode);
        console.log(stationCodes);
        const DevicesCodes = await (0, devices_services_1.Devices)(stationCodes);
    }
    catch (err) {
        console.error('[KPI job] Error:', err);
        // aquí podrías mandar alertas o reintentar
    }
}
