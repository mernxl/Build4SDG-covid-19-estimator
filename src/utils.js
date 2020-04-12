import joi from 'joi';
import morgan from 'morgan';
import xml from 'xml2js';
import covid19ImpactEstimator from './estimator';

const builder = new xml.Builder({});

const RequestSchema = joi.object().keys({
  region: joi.object().keys({
    name: joi.string(),
    avgAge: joi.number(),
    avgDailyIncomeInUSD: joi.number().required(),
    avgDailyIncomePopulation: joi.number().min(0).max(10).required()
  }),
  periodType: joi.string().regex(/days*|weeks*|months*/i),
  timeToElapse: joi.number().required(),
  reportedCases: joi.number().required(),
  population: joi.number().required(),
  totalHospitalBeds: joi.number().required()
});

export const respondWithXML = (req, res) => {
  res.type('application/xml');

  res.status(200).send(builder.buildObject(covid19ImpactEstimator(req.body)));
};

export const respondWithJSON = (req, res) => {
  res.json(covid19ImpactEstimator(req.body));
};

// Get request object from query
export const requestFromQueryMiddleware = (req, res, next) => {
  if (req.query) {
    req.body = req.query;
  }

  next();
};

// validation middleware
export const validationMiddleware = (req, res, next) => {
  const { error } = joi.validate(req.body, RequestSchema);
  if (error) {
    return res.status(422).send(error);
  }

  return next();
};

/**
 * lets format log strings, if response-time is less than 10, we pad a 0 to
 * make it at least 2 digits, else will fail audit
 *
 * @param m
 * @param req
 * @param res
 * @returns {string}
 */
export const logFormatter = (m, req, res) => {
  const time = morgan['response-time'](req, res, 0);
  let timeStr = `${String(time)}ms`;

  if (time < 10) {
    timeStr = `0${timeStr}`;
  }

  return `${m.method(req)}\t\t${m.url(req)}\t\t${m.status(req, res)}\t\t${timeStr}`;
};
