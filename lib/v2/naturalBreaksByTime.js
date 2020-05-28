const clusterDataByTime = require('../clusterDataByTime');

// typically clustering is useless if there are fewer than 3 or more than 21 categories, right?
const MIN_CLUSTERS = 3;

module.exports = function naturalBreaksByTime(records, dateKey) {
  const minimumGoodnessOfVariance = calculateMinimumGoodnessOfVariance(records.length);

  const maxClusters = records.length - 1;
  if (maxClusters <= MIN_CLUSTERS) {
    console.warn("Not enough records to cluster");
    return records;
  }

  // Get the mean for the entire data set
  const mean = records.reduce((sum, item) => {
    return sum + new Date(item[dateKey]).getTime();
  }, 0) / records.length;

  // Iterate through several cluster sizes to determine the best fit
  for (let i = MIN_CLUSTERS; i <= maxClusters; i++) {
    const clustered = clusterDataByTime(records, dateKey, i);

    let classVarianceSum = 0, arrayVarianceSum = 0;
    clustered.forEach((cluster, i) => {
      classVarianceSum += varianceFromMean(cluster, dateKey, average(cluster, dateKey));
      arrayVarianceSum += varianceFromMean(cluster, dateKey, mean);
    });
    const goodnessOfVariance = (arrayVarianceSum - classVarianceSum) / arrayVarianceSum;
    console.log(goodnessOfVariance);

    if (goodnessOfVariance >= minimumGoodnessOfVariance) {
      return clustered;
    }
  }
}

function average(cluster, dateKey) {
  const sum = cluster.values.reduce((total, item) => {
    return total + new Date(item[dateKey]).getTime();
  }, 0);
  return sum / cluster.count;
}

function varianceFromMean(cluster, dateKey, mean) {
  const sum = cluster.values.reduce((total, item) => {
    const v = mean - new Date(item[dateKey]).getTime();
    return total + v * v;
  }, 0);
  return sum;
}

function calculateMinimumGoodnessOfVariance(length) {
  const specificity = Math.ceil(Math.log10(length));
  let minimumGoodnessOfVariance = 0;
  for (let i = 1; i <= specificity; i++) {
    minimumGoodnessOfVariance += 9 / (10 ** i);
  }
  return minimumGoodnessOfVariance;
}
