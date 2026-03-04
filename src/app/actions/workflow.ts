import { sleep } from "workflow";
import { insforge } from "@/lib/insforge";
import { v4 as uuidv4 } from "uuid";

/**
 * Helper to create a user and profile if they don't exist.
 * This is used by the workflow to demonstrate durable execution.
 */
async function createUser(email: string) {
  const { data: existing } = await insforge.database
    .from('profiles')
    .select()
    .eq('email', email)
    .maybeSingle();

  if (existing) return existing;

  const userId = uuidv4();

  await insforge.database.from('profiles').insert({
    id: userId,
    full_name: "Workflow Demo User",
    role: "customer"
  });

  return { id: userId, email };
}

/**
 * Mock function to simulate sending a welcome email.
 */
async function sendWelcomeEmail(user: any) {
  console.log(`[Workflow] Sending welcome email to: ${user.email}`);
}

/**
 * Mock function to simulate sending an onboarding email after a delay.
 */
async function sendOnboardingEmail(user: any) {
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
