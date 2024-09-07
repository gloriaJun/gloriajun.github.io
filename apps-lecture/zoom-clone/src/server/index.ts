import http from 'node:http';
import path from 'node:path';

import express from 'express';

import { createSocket } from '~/server/socket';

const resolve = (file: string) => path.join(process.cwd(), 'dist', file);

const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'pug');
app.set('views', resolve('views'));
app.use('/public', express.static(resolve('public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/*', (req, res) => {
  res.redirect('/');
});

const server = http.createServer(app);
createSocket(server);

app.listen(PORT, () => {
  console.log(`\n🚀 Listening on 'http://localhost:${PORT}'`);
});
