const csv = require('csv-parser');
const fs = require('fs');
const clusterDataByTime = require('./lib/clusterDataByTime');

const infile = process.argv[2];
if (!infile) {
  console.error(`Usage: node main.js <filename.csv> <time_column_name> <number_of_clusters>`);
  process.exit(1);
}

const dateKey = process.argv[3];
if (!dateKey) {
  console.error(`Usage: node main.js <filename.csv> <time_column_name> <number_of_clusters>`);
  process.exit(1);
}

const numberOfClusters = process.argv[4];
if (!numberOfClusters) {
  console.error(`Usage: node main.js <filename.csv> <time_column_name> <number_of_clusters>`);
  process.exit(1);
}

const records = [];
fs.createReadStream(infile)
  .pipe(csv())
  .on('data', (data) => {
    records.push(data);
  })
  .on('end', async () => {
    const clustered = clusterDataByTime(records, dateKey, numberOfClusters);
    console.log(clustered);

    // tmp
    const tmp = clustered.map((c) => {
      return {
        start: c.start,
        end: c.end,
        elapsed: c.elapsed,
        count: c.count,
        perHour: c.count / c.elapsed,
        rate: 0.015 * (c.count / c.elapsed),
      }
    });
    console.log(tmp);

    const avg = tmp.reduce((sum, item) => {
      return sum + item.rate;
    }, 0) / tmp.length;
    console.log(avg);
  });
