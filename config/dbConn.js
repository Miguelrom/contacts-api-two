import mongoose from 'mongoose';

export async function connectDB() {

  try {
    
    await mongoose.connect(process.env.DB_URI);

  } catch (error) {
    console.log(error);
  }

}
