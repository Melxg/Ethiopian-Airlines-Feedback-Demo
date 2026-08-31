import { db, usersTable } from "./index";
import bcrypt from "bcryptjs";

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seed() {
  console.log("Seeding demo users...");

  const passengerPassword = await hashPassword("password123");
  const agentPassword = await hashPassword("password123");

  await db.insert(usersTable).values([
    {
      email: "passenger@demo.com",
      passwordHash: passengerPassword,
      name: "Aster Mekonnen",
      role: "passenger",
    },
    {
      email: "agent@demo.com",
      passwordHash: agentPassword,
      name: "Mekdes Abebe",
      role: "agent",
    },
  ]);

  console.log("Demo users seeded successfully!");
  console.log("Passenger: passenger@demo.com / password123");
  console.log("Agent: agent@demo.com / password123");
}

seed().catch(console.error);
