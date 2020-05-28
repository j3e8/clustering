const csv = require('csv-parser');
const fs = require('fs');
const naturalBreaksByTime = require('./lib/v2/naturalBreaksByTime');

const infile = process.argv[2];
if (!infile) {
  console.error(`Usage: node main.js <filename.csv> <time_column_name>`);
  process.exit(1);
}

const dateKey = process.argv[3];
if (!dateKey) {
  console.error(`Usage: node main.js <filename.csv> <time_column_name>`);
  process.exit(1);
}

const records = [];
fs.createReadStream(infile)
  .pipe(csv())
  .on('data', (data) => {
    records.push(data);
  })
  .on('end', async () => {
    const clustered = naturalBreaksByTime(records, dateKey);
    clustered.forEach(c => delete c.values);
    console.log(clustered);
    console.log(`${clustered.length} clusters`);
  });
