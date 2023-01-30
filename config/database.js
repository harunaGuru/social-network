const mongoose = require('mongoose');
require('dotenv').config();

const DB_STRING = process.env.DB_STRING
const MONGO_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
};
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_STRING, MONGO_OPTIONS)
        console.log(`mongoDB connected: ${conn.connection.host}`)
        
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
        
};

module.exports = connectDB;