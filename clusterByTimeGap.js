const csv = require('csv-parser');
const fs = require('fs');
const clusterDataByTimeGap = require('./lib/clusterDataByTimeGap');

const infile = process.argv[2];
if (!infile) {
  console.error(`Usage: node main.js <filename.csv> <time_column_name> <seconds>`);
  process.exit(1);
}

const dateKey = process.argv[3];
if (!dateKey) {
  console.error(`Usage: node main.js <filename.csv> <time_column_name> <seconds>`);
  process.exit(1);
}

const seconds = process.argv[4];
if (!seconds) {
  console.error(`Usage: node main.js <filename.csv> <time_column_name> <seconds>`);
  process.exit(1);
}

const records = [];
fs.createReadStream(infile)
  .pipe(csv())
  .on('data', (data) => {
    records.push(data);
  })
  .on('end', async () => {
    const clustered = clusterDataByTimeGap(records, dateKey, seconds);
    console.log(`${clustered.length} clusters`);

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
