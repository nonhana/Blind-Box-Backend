import express from "express";
import multer from "multer";
import path from "path";
import { usersController } from "../controller/users";
import { auth } from "../middleware/user.middleware";
import { apiRecord } from "../middleware/api.middleware";

// 上传头像
const AvatarUpload = multer({
  storage: multer.diskStorage({
    destination(_, __, cb) {
      cb(null, "public/images/avatar");
    },
    filename(_, file, cb) {
      cb(
        null,
        `${Date.now()}_${Math.floor(Math.random() * 1e9)}${path.extname(
          file.originalname
        )}`
      );
    },
  }),
  fileFilter: (_, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // 定义允许的文件类型
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("仅支持 jpeg 和 png 格式的图片"));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 3,
  },
});
// 上传背景
const BackgroundUpload = multer({
  storage: multer.diskStorage({
    destination(_, __, cb) {
      cb(null, "public/images/background");
    },
    filename(_, file, cb) {
      cb(
        null,
        `${Date.now()}_${Math.floor(Math.random() * 1e9)}${path.extname(
          file.originalname
        )}`
      );
    },
  }),
  fileFilter: (_, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // 定义允许的文件类型
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("仅支持 jpeg 和 png 格式的图片"));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const router = express.Router();

router.post("/send-code", apiRecord, usersController.sendCode);
router.post("/login", apiRecord, usersController.userLogin);
router.post("/register", apiRecord, usersController.userRegister);
router.post(
  "/update-user-info",
  apiRecord,
  auth,
  usersController.updateUserInfo
);
router.get("/get-user-info", apiRecord, auth, usersController.getUserInfo);
router.get("/get-user-list", apiRecord, auth, usersController.getUserList);
router.post(
  "/upload-avatar",
  apiRecord,
  auth,
  AvatarUpload.single("avatar"),
  usersController.uploadAvatar
);
router.post(
  "/upload-background",
  apiRecord,
  auth,
  BackgroundUpload.single("background"),
  usersController.uploadBackground
);

export default router;
