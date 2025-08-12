"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getParams_1 = require("./utils/getParams");
const initial_job_1 = require("./jobs/initial.job");
const app = async () => {
    const params = (0, getParams_1.getParams)();
    console.log(params);
    try {
        const result = await (0, initial_job_1.runSynchronizationJob)();
        console.log('Respuesta API Huawei:', result);
    }
    catch (error) {
        console.error('Error al ejecutar ServiceKpiRealtime:', error);
    }
};
app();
