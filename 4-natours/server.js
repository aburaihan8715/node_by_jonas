const mongoose = require('mongoose');
const dotenv = require('dotenv');

// UNCAUGHT EXCEPTION
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

mongoose
  .connect(process.env.DATABASE, {})
  .then(() => console.log(`DB connection successful!`));

const port = process.env.PORT || 5001;
const server = app.listen(port, () => {
  console.log(`Server is running at http://127.0.0.1:${port}`);
});

// UNHANDLED REJECTIONS
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
