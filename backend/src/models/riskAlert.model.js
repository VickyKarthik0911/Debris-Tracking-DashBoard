import mongoose from "mongoose";

const riskAlertSchema = new mongoose.Schema(
  {
    objectA: { type: Number, required: true, index: true },
    objectB: { type: Number, required: true, index: true },
    distanceKm: { type: Number, required: true },
    probability: { type: Number, required: true },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

riskAlertSchema.index({ objectA: 1, objectB: 1 }, { unique: true });

export const RiskAlert = mongoose.model("RiskAlert", riskAlertSchema);
