"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScheduler = initScheduler;
// scheduler.ts
const node_cron_1 = __importDefault(require("node-cron"));
const kpi_job_1 = require("./jobs/kpi.job");
// cada 5 minutos
function initScheduler() {
    console.log('Scheduler: schedule KPIs every 5 minutes');
    (0, kpi_job_1.runKpiJob)();
    node_cron_1.default.schedule('*/5 * * * *', async () => {
        await (0, kpi_job_1.runKpiJob)();
    });
    // ejemplo: tareas diarias a las 00:05
    // cron.schedule('5 0 * * *', async () => { await runDailyJob(); });
}
