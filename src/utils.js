import joi from 'joi';
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
