import { runTrendingAgentWithLog } from "../src/lib/agent/trendingAgent";

runTrendingAgentWithLog({ trigger: "script" })
  .then(({ run, results }) => {
    console.log(JSON.stringify({ ok: true, run, results }, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
