import exprsess from "express";
import multer from "multer";
import path from "path";
import { boxesController } from "../controller/boxes";
import { auth } from "../middleware/user.middleware";
import { apiRecord } from "../middleware/api.middleware";

// 上传盲盒图片
const PictureUpload = multer({
  storage: multer.diskStorage({
    destination(_, __, cb) {
      cb(null, "public/images/box-picture");
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

const router = exprsess.Router();

router.post("/post-box", apiRecord, auth, boxesController.postBox);
router.post(
  "/upload-picture",
  apiRecord,
  auth,
  PictureUpload.single("picture"),
  boxesController.uploadPicture
);
router.get("/get-random-box", apiRecord, auth, boxesController.getRandomBox);
router.post("/add-box-record", apiRecord, auth, boxesController.addBoxRecord);
router.get("/get-box-record", apiRecord, auth, boxesController.getBoxRecord);
router.get("/get-boxes-list", apiRecord, auth, boxesController.getBoxesList);

export default router;
