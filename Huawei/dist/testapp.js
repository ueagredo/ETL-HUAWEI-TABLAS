"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const initial_job_1 = require("./jobs/initial.job");
(async () => {
    try {
        const result = await (0, initial_job_1.runSynchronizationJob)();
        console.log('Respuesta API Huawei:', result);
    }
    catch (error) {
        console.error('Error al ejecutar ServiceKpiRealtime:', error);
    }
})();
