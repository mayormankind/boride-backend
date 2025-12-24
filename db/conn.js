//db/conn.js
// import mongoose from "mongoose";

// export async function connectDB() {
//     try {
//         const conn = await mongoose.connect(`${process.env.MONGODB_URI}`);
        
//         console.log(`MongoDB Connected to Host: ${conn.connection.host}`);
//         console.log(`Using Database: ${conn.connection.name}`);
//     } 
//     catch (error) {
//         console.error(`Error connecting to DB: ${error.message}`);
//         process.exit(1); 
//     }
// }

// for deployment in vercel(stateless server could produce multiple mongo instance)
import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI);
  }

  cached.conn = await cached.promise;

  console.log(`MongoDB Connected: ${cached.conn.connection.name}`);
  return cached.conn;
}
