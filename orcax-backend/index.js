import app from './server.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
