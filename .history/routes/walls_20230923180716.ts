import express from "express";
import { wallsController } from "../controller/walls";
import { auth } from "../middleware/user.middleware";
import { apiRecord } from "../middleware/api.middleware";

const router = express.Router();

router.post("/add-wall", apiRecord, wallsController.addWall);

export default router;
