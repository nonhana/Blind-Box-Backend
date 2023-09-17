import { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../utils/index";

class WallsController {
  // 新建表白墙
  addWall = async (req: Request, res: Response) => {
    const { wall_name, university_id } = req.body;
    try {
      await queryPromise("INSERT INTO walls SET ?", {
        wall_name,
        university_id,
      });
      unifiedResponseBody({
        result_code: 0,
        result_msg: "新建表白墙成功",
        result: {},
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "新建表白墙失败",
        result: { error },
        res,
      });
    }
  };
}

export const wallsController = new WallsController();
