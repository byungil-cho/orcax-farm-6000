import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors()); // ❗️이거 없으면 끝장임

import app from './server.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
