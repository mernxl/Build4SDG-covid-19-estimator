import express from 'express';
import fs from 'fs';
import morgan from 'morgan';
import path from 'path';
import {
  requestFromQueryMiddleware,
  respondWithJSON,
  respondWithXML,
  validationMiddleware
} from './utils';

const LOG_PATH = path.join(__dirname, 'requests.log');
const router = express.Router();

// only log valid req/res cycles
router.use(
  morgan(':method\t\t:url\t\t:status\t\t:response-time ms', {
    skip(req, res) {
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
