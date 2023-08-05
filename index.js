import { app } from './dist/app.js';

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Listen on ${PORT}`);
});
