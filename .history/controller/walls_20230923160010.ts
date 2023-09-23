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

  // 绑定某用户至某墙 n对n关系
  bindUser = async (req: Request, res: Response) => {

  }

  // 生成表白墙二维码
  createQRCode = async (req: Request, res: Response) => {
    const { wall_id } = req.body
    try {
      await queryPromise("", {
        wall_id
      })
    } catch (error) {

    }
  }

  // 获取表白墙列表
  getWallList = async (req: Request, res: Response) => {
    try {
      
    } catch (error) {
      
    }
  }

  // 获取某表白墙信息
  getWallInfo = async (req: Request, res: Response) => {

  }
}

export const wallsController = new WallsController();
