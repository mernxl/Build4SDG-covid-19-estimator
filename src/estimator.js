/**
 * Scan and remove all values after decimal point
 * @param num
 * @returns {number}
 */
const numberFormatter = (num = 0) => Math.trunc(num);

const estimatedICUPercentile = 0.05;
const severePositivePercentile = 0.15; // severePositivePercentile
const estimatedBedAvailability = 0.35;
const estimatedSeverePositivePercentile = 0.02;

const getInfectionsMultiplyFactor = (periodType = '', timeToElapse = 0) => {
  let days = timeToElapse;

  // regex takes care of months and month
  if (/week/i.test(periodType)) {
    days = 7 * timeToElapse;
  } else if (/month/i.test(periodType)) {
    days = 30 * timeToElapse;
  }

  return { days, multiplyFactor: 2 ** numberFormatter(days / 3) };
};

const covid19ImpactEstimator = (data) => {
  const response = {
    data,
    impact: {
      currentlyInfected: data.reportedCases * 10
    },
    severeImpact: {
      currentlyInfected: data.reportedCases * 50
    }
  };

  const { days, multiplyFactor } = getInfectionsMultiplyFactor(
    data.periodType,
    data.timeToElapse
  );
  response.impact.infectionsByRequestedTime = numberFormatter(
    response.impact.currentlyInfected * multiplyFactor
  );
  response.severeImpact.infectionsByRequestedTime = numberFormatter(
    response.severeImpact.currentlyInfected * multiplyFactor
  );

  response.impact.severeCasesByRequestedTime = numberFormatter(
    response.impact.infectionsByRequestedTime * severePositivePercentile
  );
  response.severeImpact.severeCasesByRequestedTime = numberFormatter(
    response.severeImpact.infectionsByRequestedTime * severePositivePercentile
  );

  // hospitalBedsByRequestedTime
  const bedEstimates = data.totalHospitalBeds * estimatedBedAvailability;
  response.impact.hospitalBedsByRequestedTime = numberFormatter(
    bedEstimates - response.impact.severeCasesByRequestedTime
  );
  response.severeImpact.hospitalBedsByRequestedTime = numberFormatter(
    bedEstimates - response.severeImpact.severeCasesByRequestedTime
  );

  // casesForICUByRequestedTime
  response.impact.casesForICUByRequestedTime = numberFormatter(
    response.impact.infectionsByRequestedTime * estimatedICUPercentile
  );
  response.severeImpact.casesForICUByRequestedTime = numberFormatter(
    response.severeImpact.infectionsByRequestedTime * estimatedICUPercentile
  );

  response.impact.casesForVentilatorsByRequestedTime = numberFormatter(
    response.impact.infectionsByRequestedTime
      * estimatedSeverePositivePercentile
  );
  response.severeImpact.casesForVentilatorsByRequestedTime = numberFormatter(
    response.severeImpact.infectionsByRequestedTime
      * estimatedSeverePositivePercentile
  );

  const avgDollars = (data.region.avgDailyIncomeInUSD
    * data.region.avgDailyIncomePopulation) / days;

  response.impact.dollarsInFlight = numberFormatter(
    response.impact.infectionsByRequestedTime * avgDollars
  );
  response.severeImpact.dollarsInFlight = numberFormatter(
    response.severeImpact.infectionsByRequestedTime * avgDollars
  );

  return response;
};

export default covid19ImpactEstimator;
