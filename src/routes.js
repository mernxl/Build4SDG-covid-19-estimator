import express from 'express';
import fs from 'fs';
import morgan from 'morgan';
import path from 'path';
import {
  logFormatter,
  requestFromQueryMiddleware,
  respondWithJSON,
  respondWithXML,
  validationMiddleware
} from './utils';

const LOG_PATH = path.join(__dirname, 'requests.log');
const router = express.Router();

/**
 * Log all request that goes in and actually come out with a 200 response
 * on this endpoint
 */
router.use(
  morgan(logFormatter, {
    skip(req, res) {
      // only log valid req/res cycles
      return res.statusCode > 200;
    },
    stream: fs.createWriteStream(LOG_PATH, {
      flags: 'a'
    })
  })
);

// xml Results
router.post('/xml', validationMiddleware, respondWithXML);
router.get(
  '/xml',
  requestFromQueryMiddleware,
  validationMiddleware,
  respondWithXML
);

// json results
router.post(['/', '/json'], validationMiddleware, respondWithJSON);
router.get(
  ['/', '/json'],
  requestFromQueryMiddleware,
  validationMiddleware,
  respondWithJSON
);

// respond with the logs file
router.get('/logs', async (req, res) => {
  res.sendFile(LOG_PATH);
});

export default router;
