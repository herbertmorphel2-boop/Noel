import { clockIn, clockOut } from './controllers/pointController.js';

const routes = [
  {
    path: '/clock-in',
    method: 'POST',
    handler: clockIn,
  },
  {
    path: '/clock-out',
    method: 'POST',
    handler: clockOut,
  },
];

export default routes;
