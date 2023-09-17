import { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../utils/index";

class OthersController {
  // 添加大学
  addUniversity = async (req: Request, res: Response) => {
    const { university_name } = req.body;
    try {
      // 检查有无重复
      const check = await queryPromise(
        "SELECT * FROM universities WHERE university_name = ?",
        university_name
      );
      if (check.length !== 0) {
        unifiedResponseBody({
          result_code: 1,
          result_msg: "学校已存在",
          res,
        });
        return;
      }
      await queryPromise(
        "INSERT INTO universities SET university_name = ?",
        university_name
      );
      unifiedResponseBody({
        result_code: 0,
        result_msg: "添加学校成功",
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "添加学校失败",
        result: { error },
        res,
      });
    }
  };

  // 获取大学列表
  getUniversityList = async (req: Request, res: Response) => {
    try {
      const result = await queryPromise(
        "SELECT * FROM universities ORDER BY university_id DESC"
      );
      unifiedResponseBody({
        httpStatus: 200,
        result_code: 0,
        result_msg: "获取大学列表成功",
        result,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取大学列表失败",
        res,
      });
    }
  };

  // 删除某个大学
  deleteUniversity = async (req: Request, res: Response) => {
    const { university_id } = req.body;
    try {
      await queryPromise(
        "DELETE FROM universities WHERE university_id = ?",
        university_id
      );
      unifiedResponseBody({
        result_code: 0,
        result_msg: "删除大学成功",
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "删除大学失败",
        res,
      });
    }
  };
}

export const othersController = new OthersController();
