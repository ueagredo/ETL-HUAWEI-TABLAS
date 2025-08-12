"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runKpiJob = runKpiJob;
// jobs/kpi.job.ts
const realtimekpi_service_1 = require("../services/realtimekpi.service");
const returnVariable_1 = require("../utils/returnVariable");
async function runKpiJob() {
    try {
        // devIds podría venir desde params o desde config
        const devIds = "1000000033663109,1000000033662647";
        const apiRes = await (0, realtimekpi_service_1.ServiceKpiRealtime)(devIds);
        console.log('[KPI job] OK', apiRes);
        // ejemplo de uso de returnVariable (si lo necesitas)
        (0, returnVariable_1.returnVariable)('lastKpiRun', new Date().toISOString());
    }
    catch (err) {
        console.error('[KPI job] Error:', err);
        // aquí podrías mandar alertas o reintentar
    }
}
