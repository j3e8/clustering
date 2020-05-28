module.exports = function clusterDataByTime(originalData, dateKey, gap = 60) {
  const clusters = [];

  // sort the data in a new array
  const data = originalData.slice(0);
  data.sort((a, b) => new Date(a[dateKey]).getTime() - new Date(b[dateKey]).getTime());

  // calculate the incremental differences between each item in the sorted array
  let previousIndex = 0;
  for (let i = 1; i < data.length; i++) {
    const elapsedMs = new Date(data[i][dateKey]).getTime() - new Date(data[i - 1][dateKey]).getTime();
    if (elapsedMs / 1000 >= gap) {
      const cluster = createCluster(data, previousIndex, i, dateKey);
      clusters.push(cluster);
      previousIndex = i;
    }
  }

  return clusters;
}


function createCluster(data, startIndex, endIndex, dateKey) {
  try {
    const values = data.slice(startIndex, endIndex || data.length);
    const start = data[startIndex][dateKey];
    const end = data[(endIndex || data.length) - 1][dateKey];
    return {
      start,
      end,
      elapsed: (new Date(end).getTime() - new Date(start).getTime()) / 3600000,
      startIndex,
      endIndex: endIndex || data.length,
      count: values.length,
      values,
    }
  } catch(ex) {
    console.error("FATAL ERROR", ex);
    console.log(startIndex, endIndex, dateKey);
    process.exit(1);
  }
}
