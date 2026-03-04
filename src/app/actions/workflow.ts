import { sleep } from "workflow";
import { db } from "@/lib/db";
import { users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * Helper to create a user and profile if they don't exist.
 * This is used by the workflow to demonstrate durable execution.
 */
async function createUser(email: string) {
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) return existing;

  const userId = uuidv4();
  const [newUser] = await db.insert(users).values({
    id: userId,
    email,
    passwordHash: "workflow-demo-hash", // Mock password hash for demo
  }).returning();

  await db.insert(profiles).values({
    id: userId,
    fullName: "Workflow Demo User",
    role: "customer"
  });
  
  return newUser;
}

/**
 * Mock function to simulate sending a welcome email.
 */
async function sendWelcomeEmail(user: typeof users.$inferSelect) {
  console.log(`[Workflow] Sending welcome email to: ${user.email}`);
}

/**
 * Mock function to simulate sending an onboarding email after a delay.
 */
async function sendOnboardingEmail(user: typeof users.$inferSelect) {
  console.log(`[Workflow] Sending onboarding email to: ${user.email}`);
}

/**
 * Vercel Workflow for user signup.
 * Demonstrates the "use workflow" directive and durable sleep.
 */
export async function handleUserSignup(email: string) {
  "use workflow";

  const user = await createUser(email);
  await sendWelcomeEmail(user);

  // Durable sleep: the workflow will pause here and resume after 5 seconds
  // without keeping a server instance running.
  await sleep("5s");

  await sendOnboardingEmail(user);
  
  return { userId: user.id, status: "onboarded" };
}
