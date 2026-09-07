import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function registerUser(name: string, email: string, password: string) {
  // 1. Cek apakah email sudah terdaftar
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { data: "EMAIL SUDAH TERDAFTAR" };
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Insert user baru
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // 4. Return success
  return { data: "OK" };
}

export async function loginUser(email: string, password: string) {
  // 1. Cari user berdasarkan email
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (userResult.length === 0) {
    return { data: "EMAIL ATAU PASSWORD SALAH" };
  }

  const user = userResult[0];

  // 2. Bandingkan password dengan hash
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return { data: "EMAIL ATAU PASSWORD SALAH" };
  }

  // 3. Generate token UUID
  const token = crypto.randomUUID();

  // 4. Simpan session ke database
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  // 5. Return token
  return { data: token };
}
