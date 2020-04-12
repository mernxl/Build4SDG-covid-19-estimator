import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import onCovid19Routes from './routes';

const app = express();

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// parse body params and attache them to req.body
app.use(bodyParser.json());

// mount covid19 routes
app.use('/api/v1/on-covid-19', onCovid19Routes);

// catch 404 and forward to error handler
app.use((req, res) => {
  res.status(404).send('Resource Not Found');
});

// error handler
app.use((err, req, res) => {
  if (res.headersSent) {
    return;
  }

  res.status(err.status || 500);
  res.send(err.message || 'Internal Server Error');
});

app.listen(4000);
