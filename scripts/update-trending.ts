import { runTrendingAgent } from "../src/lib/agent/trendingAgent";

runTrendingAgent()
  .then((results) => {
    console.log(JSON.stringify({ ok: true, results }, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
