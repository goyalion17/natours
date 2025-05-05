const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'));

// READ JSON FOLE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    console.log('Data successesfully loaded!');
    await Tour.create(tours);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successesfully deleted!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
