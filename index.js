import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from 'mongoose'
import { connectDB } from './config/dbConn.js';
import { contactRouter } from './routes/contactRoutes.js';

const app = express();
connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/contacts', contactRouter);

app.all('*', (req, res) => {

  res.status(404)

  if (req.accepts('json')) {
    res.json({ message: 'Route not found'});
  } else {
    res.type('text').send('Route not found');
  }
  
});

const PORT = process.env.PORT || 3001;

mongoose.connection.on("open", () => {
  console.log("MongoDB connected");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.log(error);
});

