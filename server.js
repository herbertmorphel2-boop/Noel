import express from 'express';
import cors from 'cors';
import routes from './src/routes.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

routes.forEach(route => {
  app[route.method.toLowerCase()](route.path, route.handler);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
