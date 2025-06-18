const mongoose = require('mongoose');
const dotenv = require('dotenv');

mongoose.set('strictQuery', true); // або false, якщо хочете змінити поведінку

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXEPTION!💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

const app = require('./app');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.name, err.message);
    process.exit(1);
  });

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
