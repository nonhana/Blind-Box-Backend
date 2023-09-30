import express from "express";
import { othersController } from "../controller/others";
import { auth } from "../middleware/user.middleware";
import { apiRecord } from "../middleware/api.middleware";

const router = express.Router();

router.post("/add-university", auth, apiRecord, othersController.addUniversity);
router.get(
  "/get-university-list",
  apiRecord,
  auth,
  othersController.getUniversityList
);
router.get(
  "/get-university-name-by-id",
  apiRecord,
  auth,
  othersController.getUniversityNameById
);
router.post(
  "/delete-university",
  apiRecord,
  auth,
  othersController.deleteUniversity
);

export default router;
