"use strict";

const pMap = require("p-map");
const pMapSeries = require("p-map-series");

module.exports = runParallelBatches;

function runParallelBatches(batches, concurrency, mapper, perBatch) {
  return pMapSeries(batches, batch => {
    let chain = Promise.resolve();

    if (typeof perBatch === 'function') {
      chain = chain.then(perBatch(batch));
    }

    return chain.then(() => pMap(batch, mapper, { concurrency }));
  });
}
