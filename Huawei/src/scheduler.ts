import cron from 'node-cron';
import { runKpiJob } from './jobs/kpi.job';
import { getInvertersByType } from './controller/getInverter.controller';

// scheduler.ts
export function initScheduler(token: string) {
  console.log('Scheduler iniciado: ejecutando cada 5 minutos');
  getInvertersByType(token);

  // Programar tarea cada 5 minutos
  cron.schedule('*/5 * * * *', () => {
    console.log('Ejecutando tarea programada: getInvertersByType');
    getInvertersByType(token);
  });
}
