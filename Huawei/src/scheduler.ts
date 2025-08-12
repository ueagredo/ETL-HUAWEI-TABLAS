// scheduler.ts
import cron from 'node-cron';
import { runKpiJob } from './jobs/kpi.job';

// cada 5 minutos
export function initScheduler() {
  console.log('Scheduler: schedule KPIs every 5 minutes');
  runKpiJob();
  cron.schedule('*/5 * * * *', async () => {
    await runKpiJob();
  });

  // ejemplo: tareas diarias a las 00:05
  // cron.schedule('5 0 * * *', async () => { await runDailyJob(); });
}
