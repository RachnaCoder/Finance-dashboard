import { Router } from "express";
import { records } from "../db";
import { FinancialRecord, TransactionType } from "../types";

export const recordRouter = Router();

recordRouter.get("/", (req, res) => {
  const user = (req as any).user;
  // In a real app, we'd filter by user or role
  res.json(records);
});

recordRouter.post("/", (req, res) => {
  const user = (req as any).user;
  const newRecord: FinancialRecord = {
    id: `rec-${records.length + 1}`,
    ...req.body,
    userId: user.id,
    createdAt: new Date().toISOString(),
  };
  records.push(newRecord);
  res.status(201).json(newRecord);
});

recordRouter.put("/:id", (req, res) => {
  const index = records.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Record not found" });
  
  records[index] = {
    ...records[index],
    ...req.body,
    id: req.params.id, // Ensure ID doesn't change
  };
  res.json(records[index]);
});

recordRouter.patch("/:id", (req, res) => {
  const index = records.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Record not found" });
  
  records[index] = {
    ...records[index],
    ...req.body,
  };
  res.json(records[index]);
});

recordRouter.delete("/:id", (req, res) => {
  const index = records.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Record not found" });
  records.splice(index, 1);
  res.status(204).send();
});
