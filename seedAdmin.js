import bcrypt from "bcryptjs";
import Admin from "./models/admin.js";
import { connectDB } from "./db/conn.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Script to create an admin user
 * Usage: node seedAdmin.js
 */

async function seedAdmin() {
  try {
    await connectDB();

    const adminData = {
      fullName: "Admin User",
      email: "admin@boride.com",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
      isActive: true,
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("❌ Admin user already exists with email:", adminData.email);
      process.exit(0);
    }

    // Create admin user
    const admin = await Admin.create(adminData);

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password: admin123");
    console.log("\n⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
