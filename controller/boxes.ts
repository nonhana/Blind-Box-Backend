import { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../utils/index";
import { AuthenticatedRequest } from "../middleware/user.middleware";

import dotenv from "dotenv";
dotenv.config();

// 辅助函数：随机抽取盲盒的id
async function randomBoxId(): Promise<number> {
  // 1. 获取盲盒列表
  const boxes = await queryPromise("SELECT box_id FROM `blind-boxes`");
  // 2. 随机抽取盲盒的id
  const randomIndex = Math.floor(Math.random() * boxes.length);
  return boxes[randomIndex].box_id;
}

class BoxesController {
  // 发布盲盒
  postBox = async (req: AuthenticatedRequest, res: Response) => {
    const { box_info, picture_list, university_list } = req.body;
    const { user_id, gender } = req.state?.userInfo;
    try {
      // 添加盲盒
      const box = await queryPromise("INSERT INTO `blind-boxes` SET ?", {
        ...box_info,
        user_id,
        user_gender: gender,
      });
      if (picture_list) {
        // 添加盲盒图片
        picture_list.forEach(async (picture: string) => {
          await queryPromise("INSERT INTO `blind-box-pictures` SET ?", {
            box_id: box.insertId,
            picture_url: picture,
          });
        });
      }
      // 添加盲盒大学
      university_list.forEach(async (university_id: number) => {
        await queryPromise("INSERT INTO `universities-boxes` SET ?", {
          box_id: box.insertId,
          university_id,
        });
      });
      unifiedResponseBody({
        result_msg: "发布盲盒成功",
        result: box.insertId,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "发布盲盒失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 上传盲盒图片
  uploadPicture = async (req: Request, res: Response) => {
    console.log(req.file);
    if (!req.file) {
      unifiedResponseBody({
        httpStatus: 400,
        result_code: 1,
        result_msg: "未检测到图片文件，请重新上传",
        res,
      });
      return;
    }
    const imgURL = `${process.env.BOX_PICTURE_PATH}/${req.file.filename}`;
    unifiedResponseBody({
      result_code: 0,
      result_msg: "上传图片成功",
      result: imgURL,
      res,
    });
  };

  // 随机获取盲盒的信息
  getRandomBox = async (_: Request, res: Response) => {
    const box_id = await randomBoxId();
    try {
      // 获取盲盒信息
      const box = await queryPromise(
        "SELECT * FROM `blind-boxes` WHERE box_id = ?",
        box_id
      );
      // 获取盲盒图片
      const pictures = await queryPromise(
        "SELECT picture_url FROM `blind-box-pictures` WHERE box_id = ?",
        box_id
      );
      // 获取盲盒大学
      const universities = await queryPromise(
        "SELECT university_id FROM `universities-boxes` WHERE box_id = ?",
        box_id
      );
      unifiedResponseBody({
        result_code: 0,
        result_msg: "获取盲盒信息成功",
        result: {
          ...box[0],
          picture_list: pictures,
          university_list: universities,
        },
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取盲盒信息失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 获取所有盲盒列表
  getBoxesList = async (_: Request, res: Response) => {
    try {
      // 获取盲盒列表
      const boxes = await queryPromise(
        "SELECT * FROM `blind-boxes` ORDER BY box_id DESC"
      );
      // 获取盲盒图片
      const pictures = await Promise.all(
        boxes.map(async (box: any) => {
          const pictures = await queryPromise(
            "SELECT picture_url FROM `blind-box-pictures` WHERE box_id = ?",
            box.box_id
          );
          return pictures;
        })
      );
      // 获取盲盒大学
      const universities = await Promise.all(
        boxes.map(async (box: any) => {
          const universities = await queryPromise(
            "SELECT university_id FROM `universities-boxes` WHERE box_id = ?",
            box.box_id
          );
          return universities;
        })
      );
      unifiedResponseBody({
        result_code: 0,
        result_msg: "获取盲盒列表成功",
        result: boxes.map((box: any, index: number) => {
          return {
            ...box,
            picture_list: pictures[index],
            university_list: universities[index],
          };
        }),
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取盲盒列表失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 添加盲盒浏览记录
  addBoxRecord = async (req: AuthenticatedRequest, res: Response) => {
    const { box_id } = req.body;
    const { user_id } = req.state?.userInfo;
    try {
      // 先检查是否已经添加过盲盒浏览记录
      const boxRecord = await queryPromise(
        "SELECT * FROM `boxes-history` WHERE box_id = ? AND user_id = ?",
        [box_id, user_id]
      );
      if (boxRecord.length) {
        // 如果已经添加过盲盒浏览记录，就更新盲盒浏览记录的时间
        await queryPromise(
          "UPDATE `boxes-history` SET createdAt = CURRENT_TIMESTAMP WHERE box_id = ? AND user_id = ?",
          [box_id, user_id]
        );
      } else {
        await queryPromise("INSERT INTO `boxes-history` SET ?", {
          box_id,
          user_id,
        });
      }
      unifiedResponseBody({
        result_msg: "添加盲盒浏览记录成功",
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "添加盲盒浏览记录失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 获取盲盒浏览记录
  getBoxRecord = async (req: AuthenticatedRequest, res: Response) => {
    const { user_id } = req.state?.userInfo;
    try {
      // 获取盲盒浏览记录
      const boxRecord = await queryPromise(
        "SELECT * FROM `boxes-history` WHERE user_id = ? ORDER BY createdAt DESC",
        user_id
      );
      // 获取盲盒信息
      const boxInfo = await Promise.all(
        boxRecord.map(async (record: any) => {
          const box = await queryPromise(
            "SELECT * FROM `blind-boxes` WHERE box_id = ?",
            record.box_id
          );
          return box[0];
        })
      );
      unifiedResponseBody({
        result_code: 0,
        result_msg: "获取盲盒浏览记录成功",
        result: boxInfo,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取盲盒浏览记录失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 获取自己发布的盲盒列表
  getOwnBoxes = async (req: AuthenticatedRequest, res: Response) => {
    const { user_id } = req.state?.userInfo;
    try {
      // 获取盲盒列表
      const boxes = await queryPromise(
        "SELECT * FROM `blind-boxes` WHERE user_id = ? ORDER BY box_id DESC",
        user_id
      );
      // 获取盲盒图片
      const pictures = await Promise.all(
        boxes.map(async (box: any) => {
          const pictures = await queryPromise(
            "SELECT picture_url FROM `blind-box-pictures` WHERE box_id = ?",
            box.box_id
          );
          return pictures;
        })
      );
      // 获取盲盒大学
      const universities = await Promise.all(
        boxes.map(async (box: any) => {
          const universities = await queryPromise(
            "SELECT university_id FROM `universities-boxes` WHERE box_id = ?",
            box.box_id
          );
          return universities;
        })
      );
      unifiedResponseBody({
        result_code: 0,
        result_msg: "获取盲盒列表成功",
        result: boxes.map((box: any, index: number) => {
          return {
            ...box,
            picture_list: pictures[index],
            university_list: universities[index],
          };
        }),
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取盲盒列表失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 编辑盲盒
  editBox = async (req: AuthenticatedRequest, res: Response) => {
    const { box_id, box_info, picture_list, university_list } = req.body;
    try {
      // 更新盲盒信息
      await queryPromise("UPDATE `blind-boxes` SET ? WHERE box_id = ?", [
        box_info,
        box_id,
      ]);
      // 更新盲盒图片
      if (picture_list) {
        await queryPromise(
          "DELETE FROM `blind-box-pictures` WHERE box_id = ?",
          [box_id]
        );
        picture_list.forEach(async (picture: string) => {
          await queryPromise("INSERT INTO `blind-box-pictures` SET ?", {
            box_id,
            picture_url: picture,
          });
        });
      }
      // 更新盲盒大学
      await queryPromise(
        "DELETE FROM `universities-boxes` WHERE box_id = ?",
        box_id
      );
      university_list.forEach(async (university_id: number) => {
        await queryPromise("INSERT INTO `universities-boxes` SET ?", {
          box_id,
          university_id,
        });
      });
      unifiedResponseBody({
        result_msg: "编辑盲盒成功",
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "编辑盲盒失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 删除盲盒
  deleteBox = async (req: AuthenticatedRequest, res: Response) => {
    const { box_id } = req.body;
    try {
      // 删除盲盒
      await queryPromise("DELETE FROM `blind-boxes` WHERE box_id = ?", box_id);
      // 删除盲盒图片
      await queryPromise(
        "DELETE FROM `blind-box-pictures` WHERE box_id = ?",
        box_id
      );
      // 删除盲盒大学
      await queryPromise(
        "DELETE FROM `universities-boxes` WHERE box_id = ?",
        box_id
      );
      unifiedResponseBody({
        result_msg: "删除盲盒成功",
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "删除盲盒失败",
        result: {
          error,
        },
        res,
      });
    }
  };
}

export const boxesController = new BoxesController();
