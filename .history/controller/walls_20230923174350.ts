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
      await queryPromise("INSERT INTO confession-walls SET ?", {
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

  // 绑定某用户至某墙 n对n关系
  bindUser = async (req: Request, res: Response) => {
    const { wall_id, user_id } = req.body
    try {
      await queryPromise("INSERT INTO wall-users (wall_id, user_id, times) VALUES (?, 1) ON DUPLICATE KEY UPDATE times = times + 1;", {
        wall_id, user_id
      })
      unifiedResponseBody(
        {
          result_code: 0,
          result_msg: "绑定消费关系成功",
          result: {},
          res,
        }
      )
    } catch (error) {
      errorHandler({
        error,
        result_msg: "绑定消费关系失败",
        result: { error },
        res,
      });
    }
  }

  // 获取表白墙列表
  getWallList = async (req: Request, res: Response) => {
    const { university_id } = req.body
    try {
      const result = await queryPromise("SELECT * FROM confession-walls WHERE university_id = ?", {
        university_id
      })
      unifiedResponseBody(
        {
          result_code: 0,
          result_msg: "获取表白墙列表成功",
          result,
          res,
        }
      )
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取表白墙列表失败",
        result: { error },
        res,
      });
    }
  }

  // 获取某表白墙信息
  getWallInfo = async (req: Request, res: Response) => {
    const { wall_id } = req.body
    try {
      const result = await queryPromise("SELECT * FROM confession-walls WHERE wall_id = ?", {
        wall_id
      })
      unifiedResponseBody(
        {
          result_code: 0,
          result_msg: "获取表白墙信息成功",
          result,
          res,
        }
      )
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取表白墙信息失败",
        result: { error },
        res,
      });
    }
  }
}

export const wallsController = new WallsController();
