import { User, Role, UserStatus, FinancialRecord, TransactionType } from "./types";

// Mock Database
export const users: User[] = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: new Date().toISOString(),
  },
  {
    id: "analyst-1",
    name: "Analyst User",
    email: "analyst@example.com",
    password: "password123",
    role: Role.ANALYST,
    status: UserStatus.ACTIVE,
    createdAt: new Date().toISOString(),
  },
  {
    id: "viewer-1",
    name: "Viewer User",
    email: "viewer@example.com",
    password: "password123",
    role: Role.VIEWER,
    status: UserStatus.ACTIVE,
    createdAt: new Date().toISOString(),
  },
];

export const records: FinancialRecord[] = [
  {
    id: "rec-1",
    amount: 1500,
    type: TransactionType.INCOME,
    category: "Salary",
    date: "2024-03-01",
    description: "Monthly salary",
    userId: "admin-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rec-2",
    amount: 50,
    type: TransactionType.EXPENSE,
    category: "Food",
    date: "2024-03-02",
    description: "Lunch",
    userId: "admin-1",
    createdAt: new Date().toISOString(),
  },
];
