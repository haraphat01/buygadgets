import "dotenv/config";

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set in .env to seed the Owner admin.`);
  }
  return value;
}

const email = requireEnv("ADMIN_SEED_EMAIL");
const password = requireEnv("ADMIN_SEED_PASSWORD");
const name = process.env.ADMIN_SEED_NAME ?? "Store Owner";

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function findExistingAuthUser(targetEmail: string) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;
  return data.users.find(
    (u) => u.email?.toLowerCase() === targetEmail.toLowerCase(),
  );
}

async function main() {
  let authUserId: string;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    const existing = await findExistingAuthUser(email);
    if (!existing) throw error;
    authUserId = existing.id;
    console.log(`Auth user already exists for ${email}, reusing it.`);
  } else {
    authUserId = data.user.id;
    console.log(`Created auth user for ${email}.`);
  }

  await prisma.profile.upsert({
    where: { id: authUserId },
    update: { fullName: name },
    create: { id: authUserId, fullName: name },
  });

  await prisma.adminUser.upsert({
    where: { profileId: authUserId },
    update: { role: "OWNER" },
    create: { profileId: authUserId, role: "OWNER" },
  });

  console.log(`Owner admin ready: ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
