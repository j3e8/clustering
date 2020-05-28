const clusterDataByTime = require('./clusterDataByTime');

// typically clustering is useless if there are fewer than 3 or more than 21 categories, right?
const MIN_CLUSTERS = 3;
const MAX_CLUSTERS = 100;

module.exports = function naturalBreaksByTime(records, dateKey) {
  const results = new Array(MAX_CLUSTERS - MIN_CLUSTERS);

  for (let i = MIN_CLUSTERS; i <= MAX_CLUSTERS; i++) {
    const clustered = clusterDataByTime(records, dateKey, i);

    let varianceSum = 0;
    clustered.forEach((cluster, i) => {
      const avgVariance = variance(cluster, dateKey);
      varianceSum += avgVariance;
    });
    console.log(varianceSum / clustered.length);
    const averageVariance = varianceSum / clustered.length;



    // let hourlySum = 0;
    // const hourly = clustered.map((cluster) => {
    //   const elapsedMs = new Date(cluster.end).getTime() - new Date(cluster.start).getTime();
    //   const perHour = cluster.count / (elapsedMs / 3600000);
    //   hourlySum += perHour;
    //   return perHour;
    // });
    // const avgHourly = hourlySum / clustered.length;
    // console.log(perHourSum / clustered.length);
    // console.log(`${i} clusters\n----------\n`);
    // console.log(hourly);


    // let varianceSum = 0;
    // hourly.forEach((perHour) => {
    //   varianceSum += (perHour - avgHourly) * (perHour - avgHourly);
    // });
    // const averageVariance = Math.sqrt(varianceSum / hourly.length);


    console.log(averageVariance);


    results[i - MIN_CLUSTERS] = {
      averageVariance,
      numberOfClusters: i,
      // clusters: clustered,
    };
  }

  console.log(results);
  process.exit();

  let max, bestResult;
  for (let i = 1; i < results.length; i++) {
    const d = (results[i - 1].averageVariance - results[i].averageVariance) / results[i - 1].averageVariance;
    if (max === undefined || d > max) {
      max = d;
      bestResult = results[i];
    }
  }

  // console.log(bestResult);

  return bestResult.clusters;
}

function average(cluster, dateKey) {
  const sum = cluster.values.reduce((total, item) => {
    return total + new Date(item[dateKey]).getTime();
  }, 0);
  return sum / cluster.count;
}

function variance(cluster, dateKey) {
  const avg = average(cluster, dateKey);
  const sum = cluster.values.reduce((total, item) => {
    const v = avg - new Date(item[dateKey]).getTime();
    return total + v * v;
  }, 0);
  return Math.sqrt(sum / cluster.count);
}
