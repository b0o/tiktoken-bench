import { encoding_for_model } from "tiktoken";

export const enc = encoding_for_model("gpt-3.5-turbo");

export const iterations = {
  inner: 512,
  outer: 64,
};

// Random snippets of text
export const tests = [
  `
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  `,
  `
    In this example, bench.add() adds a function to the benchmark suite.
    bench.run() runs the benchmarks, and bench.table provides a table of the results.
    The fastest task is determined by comparing the hz (operations per second) of each task.
  `,
  `
    interface ExecTimeData {
      mean: number;
      stddev: number;
      user: number;
      system: number;
      min: number;
      max: number;
    }

    interface BenchmarkData {
      created_at: string;
      sha1: string;
      benchmark: {
        [key: string]: ExecTimeData;
      };
      binarySizeData: {
        [key: string]: number;
      };
      threadCountData: {
        [key: string]: number;
      };
      syscallCountData: {
        [key: string]: number;
      };
    }
  `,
  `
    "use strict";
    var benchmark_1 = require("benchmark");

    var add_1 = function (a, b) {
        return a + b;
    };

    var add_2 = function (a, b) {
        return Number(a) + Number(b);
    };

    new benchmark_1.Suite()
        .add("a", function () {
            var total = add_1(2, 5);
        })
        .add("b", function () {
            var total = add_2(2, 5);
        })
        .on("cycle", function (event) {
            console.log(String(event.target));
        })
        .on("complete", function () {
            console.log("Fastest is " + this.filter("fastest").map("name"));
        })
        .run({
            async: true,
            minSamples: 500
        });
  `,
  `
    A robust benchmarking library that supports high-resolution timers & returns statistically significant results. As seen on jsPerf.
    Benchmark.js is part of the BestieJS “Best in Class” module collection.
    This means we promote solid browser/environment support, ES5+ precedents, unit testing, & plenty of documentation.
  `,
  `
    µWebSockets.js is a web server bypass for Node.js that reimplements eventing, networking, encryption, web protocols, routing and pub/sub in highly optimized C++.
    As such, µWebSockets.js delivers web serving for Node.js, 8.5x that of Fastify and at least 10x that of Socket.IO.
    It is also the built-in web server of Bun.
    We recommend, for simplicity installing with bun install uNetworking/uWebSockets.js#v20.27.0 or any such release.
    Use official builds of Node.js LTS.
  `,
  `
    /* Non-SSL is simply App() */
    require('uWebSockets.js').SSLApp({

      /* There are more SSL options, cut for brevity */
      key_file_name: 'misc/key.pem',
      cert_file_name: 'misc/cert.pem',

    }).ws('/*', {

      /* There are many common helper features */
      idleTimeout: 32,
      maxBackpressure: 1024,
      maxPayloadLength: 512,
      compression: DEDICATED_COMPRESSOR_3KB,

      /* For brevity we skip the other events (upgrade, open, ping, pong, close) */
      message: (ws, message, isBinary) => {
        /* You can do app.publish('sensors/home/temperature', '22C') kind of pub/sub as well */

        /* Here we echo the message back, using compression if available */
        let ok = ws.send(message, isBinary, true);
      }

    }).get('/*', (res, req) => {

      /* It does Http as well */
      res.writeStatus('200 OK').writeHeader('IsExample', 'Yes').end('Hello there!');

    }).listen(9001, (listenSocket) => {

      if (listenSocket) {
        console.log('Listening to port 9001');
      }

    });
  `,
].map((t) => ({ text: t, tokens: enc.encode(t) }));

export const totalTokens = tests.reduce((acc, t) => acc + t.tokens.length, 0);

export const encode = () => {
  for (const t of tests) {
    enc.encode(t.text);
  }
};

export const decode = () => {
  for (const t of tests) {
    enc.decode(t.tokens);
  }
};

export const encodeWithIterations = () => {
  for (let i = 0; i < iterations.inner; i++) {
    for (const t of tests) {
      enc.encode(t.text);
    }
  }
};

export const decodeWithIterations = () => {
  for (let i = 0; i < iterations.inner; i++) {
    for (const t of tests) {
      enc.decode(t.tokens);
    }
  }
};
