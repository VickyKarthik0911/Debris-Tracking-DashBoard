import mongoose from "mongoose";

const objectSchema = new mongoose.Schema(
  {
    noradId: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    objectType: {
      type: String,
      enum: ["PAYLOAD", "DEBRIS", "ROCKET BODY", "UNKNOWN"],
      default: "UNKNOWN",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DEBRIS"],
      default: "INACTIVE",
      index: true,
    },
    orbitClass: {
      type: String,
      enum: ["LEO", "MEO", "GEO", "HEO", "UNKNOWN"],
      default: "UNKNOWN",
      index: true,
    },
    tle: {
      line1: { type: String, required: true },
      line2: { type: String, required: true },
      epoch: { type: Date },
    },
    position: {
      lat: Number,
      lon: Number,
      altKm: Number,
    },
    velocityKms: Number,
    riskScore: { type: Number, default: 0 },
    metadata: {
      launchDate: Date,
      decayDate: Date,
      owner: String,
      source: String,
    },
    lastSyncedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

objectSchema.index({ name: "text" });

export const SpaceObject = mongoose.model("SpaceObject", objectSchema);
