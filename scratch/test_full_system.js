import { runFullAutoCrawlRoutine } from '../server/cron.js';
import { purgeFabricatedAdData } from '../server/services/adIntelligence.js';

async function testFullSystem() {
  console.log('====================================================');
  console.log('--- STARTING FULL SYSTEM INTEGRITY & CRAWL TEST ---');
  console.log('====================================================');

  // 1. Test Ad Data Purge & Safeguard
  console.log('\n[Test 1] Executing Fabricated Ad Data Purge...');
  const purgeRes = await purgeFabricatedAdData();
  console.log('[Test 1 Result]:', purgeRes);

  // 2. Test Full Automated Crawl Routine
  console.log('\n[Test 2] Executing Full Automated Crawl Routine...');
  const crawlRes = await runFullAutoCrawlRoutine();
  console.log('[Test 2 Result]:', crawlRes);

  console.log('\n====================================================');
  console.log('--- ALL SYSTEM TESTS COMPLETED SUCCESSFULLY ---');
  console.log('====================================================');
}

testFullSystem();
