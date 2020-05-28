module.exports = function clusterDataByTime(originalData, dateKey, numberOfClusters = 7) {
  const clusters = new Array(numberOfClusters);

  // sort the data in a new array
  const data = originalData.slice(0);
  data.sort((a, b) => new Date(a[dateKey]).getTime() - new Date(b[dateKey]).getTime());

  // calculate the incremental differences between each item in the sorted array
  const incrementalDifferences = new Array(data.length - 1);
  for (let i = 1; i < data.length; i++) {
    incrementalDifferences[i - 1] = {
      index: i,
      difference: (new Date(data[i][dateKey]).getTime() - new Date(data[i - 1][dateKey]).getTime()) / new Date(data[i - 1][dateKey]).getTime(),
    };
  }
  incrementalDifferences.sort((a, b) => b.difference - a.difference);

  // get the top n differences to use as the natural breaks
  const breaks = incrementalDifferences.slice(0, numberOfClusters);
  breaks.sort((a, b) => b.index - a.index);

  // create the clusters
  let previousClusterIndex = undefined;
  for (let i = 1; i < numberOfClusters; i++) {
    const startIndex = breaks[i].index;
    const endIndex = previousClusterIndex || data.length;
    const cluster = createCluster(data, startIndex, endIndex, dateKey);
    clusters[i-1] = cluster;
    previousClusterIndex = startIndex;
  }

  // use whatever is left as the first cluster
  const firstCluster = createCluster(data, 0, previousClusterIndex, dateKey);
  clusters[clusters.length - 1] = firstCluster;

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
