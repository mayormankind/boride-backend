import mongoose from "mongoose";

export async function connectDB() {
    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URI}`);
        
        console.log(`MongoDB Connected to Host: ${conn.connection.host}`);
        console.log(`Using Database: ${conn.connection.name}`);
    } 
    catch (error) {
        console.error(`Error connecting to DB: ${error.message}`);
        process.exit(1); 
    }
}
