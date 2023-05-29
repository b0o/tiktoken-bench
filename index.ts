import Benchmark, { Suite, type Event } from "benchmark";
import { spawn, Pool, Worker } from "threads";
import os from "os";

console.log(`Preparing work...`);

import {
  totalTokens,
  encodeWithIterations,
  decodeWithIterations,
  iterations,
  encode,
  decode,
} from "./work";

const nw = os.cpus().length;

let pool: any | undefined;

const spawnPool = () => {
  if (pool) return;
  console.log(`Spawning ${nw} worker threads...`);
  pool = Pool(() => spawn(new Worker("./worker")), nw);
};

Benchmark.options.minSamples = 20;
Benchmark.options.async = true;

const suite = new Benchmark.Suite({ name: "tiktoken main vs worker threads" });

const args = process.argv.slice(2);

const groups = {
  main: args.length === 0 || args.includes("main"),
  "main-iter": args.length === 0 || args.includes("main-iter"),
  "worker-iter": args.length === 0 || args.includes("worker-iter"),
};

if (groups.main) {
  suite
    .add(
      "Encoding (main thread)",
      () => {
        encode();
      },
      { id: "enc-main", minSamples: 100 }
    )
    .add(
      "Decoding (main thread)",
      () => {
        decode();
      },
      { id: "dec-main", minSamples: 100 }
    );
}

if (groups["main-iter"]) {
  suite
    .add(
      "Encoding (iterations) (main thread)",
      () => {
        for (let i = 0; i < iterations.outer; i++) {
          encodeWithIterations();
        }
      },
      { id: "enc-main-iter" }
    )
    .add(
      "Decoding (iterations) (main thread)",
      () => {
        for (let i = 0; i < iterations.outer; i++) {
          decodeWithIterations();
        }
      },
      { id: "dec-main-iter" }
    );
}

if (groups["worker-iter"]) {
  suite
    .add("Encoding (iterations) (worker threads)", {
      id: "enc-worker-iter",
      defer: true,
      setup() {
        spawnPool();
      },
      fn(deferred: { resolve: () => void }) {
        Promise.all(
          Array.from({ length: iterations.outer }).map(async () =>
            pool.queue(async (worker: { encode: () => Promise<void> }) => {
              await worker.encode();
            })
          )
        ).then(() => deferred.resolve());
      },
    })
    .add("Decoding (iterations) (worker threads)", {
      id: "dec-worker-iter",
      defer: true,
      setup() {
        spawnPool();
      },
      fn(deferred: { resolve: () => void }) {
        Promise.all(
          Array.from({ length: iterations.outer }).map(async () =>
            pool.queue(async (worker: { decode: () => Promise<void> }) => {
              await worker.decode();
            })
          )
        ).then(() => deferred.resolve());
      },
    });
}

suite.on("cycle", function (this: Suite, event: Event) {
  const id = (event.target.id as any as string | undefined) ?? "";
  const isWorker = id.includes("worker");
  const isIter = id.includes("iter");

  const { hz, times, stats } = event.target;
  const nt = isWorker ? nw : 1;
  const ti = isIter ? iterations.inner * iterations.outer : 1;
  const tt = totalTokens * ti;
  const tps = hz ? hz * tt : 0;
  const tpsv = tps * ((stats?.rme ?? 0) / 100);

  const fmt = (x: number | undefined, decimals = 2) =>
    x !== undefined
      ? x.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : "?";

  console.log(
    [
      event.target.name,
      `  id:             ${id}`,
      `  workers:        ${isWorker ? nw : "N/a"}`,
      `  iterations:     ${
        isIter ? fmt(iterations.inner * iterations.outer, 0) : "N/a"
      }`,
      isIter ? `    inner:        ${fmt(iterations.inner, 0)}` : "",
      isIter ? `    outer:        ${fmt(iterations.outer, 0)}` : "",
      `  elapsed:        ${fmt(times?.elapsed)}sec`,
      `  samples:        ${fmt(stats?.sample?.length, 0)}`,
      `  ops/sec:        ${fmt((hz ?? 0) * ti, 1)} ±${fmt(stats?.rme)}%`,
      `  tks/sec:        ${times ? fmt((hz ?? 0) * tt, 1) : "?"} ±${fmt(
        tpsv,
        1
      )}`,
      `  tks/sec/worker: ${times ? fmt(((hz ?? 0) * tt) / nt, 1) : "?"} ±${fmt(
        tpsv / nt,
        1
      )}`,
    ]
      .filter(Boolean)
      .join("\n") + "\n"
  );
});

console.log(`Running '${suite.name}'...`);

const complete = new Promise<void>((resolve) => {
  suite.on("complete", () => {
    resolve();
  });
});

suite.run();

await complete;

console.log(`Benchmark complete.`);

if (pool) {
  console.log(`Terminating worker threads...`);
  await pool.terminate();
}
