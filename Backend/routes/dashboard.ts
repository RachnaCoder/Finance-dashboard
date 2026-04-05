import { Router } from "express";
import { records } from "../db";
import { TransactionType } from "../types";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", (req, res) => {
  const user = (req as any).user;
  
  const income = records
    .filter((r) => r.type === TransactionType.INCOME)
    .reduce((acc, r) => acc + r.amount, 0);
  
  const expenses = records
    .filter((r) => r.type === TransactionType.EXPENSE)
    .reduce((acc, r) => acc + r.amount, 0);

  const categoryTotals: Record<string, number> = {};
  records.forEach((r) => {
    if (r.type === TransactionType.EXPENSE) {
      categoryTotals[r.category] = (categoryTotals[r.category] || 0) + r.amount;
    }
  });

  res.json({
    totalIncome: income,
    totalExpenses: expenses,
    balance: income - expenses,
    categoryTotals,
    recentActivity: records.slice(-5).reverse(),
  });
});
