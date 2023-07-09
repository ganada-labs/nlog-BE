import 'dotenv/config';
import { app } from './dist/app.js';

const { PORT } = process.env;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listen on ${PORT}`);
});
