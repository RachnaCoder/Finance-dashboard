import { z } from "zod";

export enum Role {
  VIEWER = "VIEWER",
  ANALYST = "ANALYST",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export interface FinancialRecord {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  description?: string;
  userId: string; // Who created it
  createdAt: string;
}

export const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(Role),
  status: z.nativeEnum(UserStatus),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role).default(Role.VIEWER),
});

export const RecordSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  type: z.nativeEnum(TransactionType),
  category: z.string()
    .min(2, "Category must be at least 2 characters")
    .regex(/^[^0-9]*$/, "Category should not contain numbers"),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  description: z.string().optional(),
});
