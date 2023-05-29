# tiktoken-bench

A small Node.js benchmark suite for the [tiktoken](https://github.com/dqbd/tiktoken) WASM port.

It compares the performance of tiktoken on the main thread verus worker threads using [threads.js](https://github.com/andywer/threads.js).

[Benchmark.js](https://github.com/bestiejs/benchmark.js) is used for benchmarking.

## Benchmarks

These benchmarks are based on tiktoken `1.0.7`, and were run on a Linux desktop with an AMD Ryzen Threadripper 1950x and 64GB RAM:

```
Encoding (main thread)
  id:             enc-main
  workers:        N/a
  iterations:     N/a
  elapsed:        12.23sec
  samples:        181
  ops/sec:        293.3 ±0.64%
  tks/sec:        276,242.6 ±1,770.0
  tks/sec/worker: 276,242.6 ±1,770.0

Decoding (main thread)
  id:             dec-main
  workers:        N/a
  iterations:     N/a
  elapsed:        12.22sec
  samples:        188
  ops/sec:        30,992.5 ±0.76%
  tks/sec:        29,194,890.2 ±220,612.6
  tks/sec/worker: 29,194,890.2 ±220,612.6

Encoding (iterations) (worker threads)
  id:             enc-worker-iter
  workers:        32
  iterations:     32,768
    inner:        512
    outer:        64
  elapsed:        119.37sec
  samples:        20
  ops/sec:        5,503.1 ±1.50%
  tks/sec:        5,183,936.2 ±77,661.8
  tks/sec/worker: 161,998.0 ±2,426.9

Decoding (iterations) (worker threads)
  id:             dec-worker-iter
  workers:        32
  iterations:     32,768
    inner:        512
    outer:        64
  elapsed:        7.25sec
  samples:        80
  ops/sec:        418,890.0 ±3.07%
  tks/sec:        394,594,407.5 ±12,094,860.3
  tks/sec/worker: 12,331,075.2 ±377,964.4
```

## Usage

```bash
$ npm install
$ npm run bench [mode ..]
```

Mode is either `main`, `main-iter`, or `worker-iter`. If unspecified, all modes are enabled.

## License

Copyright 2023 Maddison Hellstrom

MIT License
