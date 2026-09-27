import { Router } from "express";
import {
  getActive,
  getDebris,
  getObjects,
  getRiskAnalysis,
} from "../controllers/object.controller.js";

const router = Router();

router.get("/objects", getObjects);
router.get("/debris", getDebris);
router.get("/active", getActive);
router.get("/risk-analysis", getRiskAnalysis);

export default router;
