import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/user.middleware";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
  randomCode,
  sendCode,
} from "../utils/index";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

let sendCodeP: { phonenumber: any; code: any }[] = [];
//倒计时
function setTime(phonenumber: any, code: any) {
  sendCodeP.push({
    phonenumber: phonenumber,
    code: code,
  });
  let i = 0;
  let timer = setInterval(() => {
    i += 1;
    console.log(i);
    if (i == 120) {
      const index = sendCodeP.findIndex((e) => {
        return e.phonenumber == phonenumber;
      });
      sendCodeP.splice(index, 1);
      clearInterval(timer);
    }
  }, 1000);
}

class UsersController {
  // 发送手机验证码函数
  sendMobileCode = (req: Request, res: Response) => {
    const { phonenumber } = req.query;
    console.log(phonenumber);
    try {
      if (phonenumber !== undefined) {
        const index = sendCodeP.findIndex((e) => {
          return e.phonenumber === phonenumber;
        });
        if (index !== -1) {
          unifiedResponseBody({
            result_code: 1,
            result_msg: "已经发送过",
            res,
          });
        } else {
          let code = randomCode(4);
          sendCode(<string>phonenumber, Number(code), function () {
            setTime(phonenumber, code);
            unifiedResponseBody({
              result_code: 0,
              result_msg: "短信验证码发送成功",
              res,
            });
          });
        }
      } else {
        unifiedResponseBody({
          result_code: 1,
          result_msg: "手机号码不能为空",
          res,
        });
      }
    } catch (error) {
      errorHandler({
        error,
        result_msg: "短信验证码发送失败",
        res,
      });
    }
  };

  // 登录函数
  userLogin = (req: Request, res: Response) => { };

  // 注册函数
  userRegister = (req: Request, res: Response) => { };

  // 更新用户信息
  updateUserInfo = async (req: AuthenticatedRequest, res: Response) => {
    const userInfo = req.body;
    const { user_id } = req.state!.userInfo;
    try {
      await queryPromise("UPDATE users SET ? WHERE user_id = ?", [
        { ...userInfo },
        user_id,
      ]);
      unifiedResponseBody({
        result_code: 0,
        result_msg: "更新用户信息成功",
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "更新用户信息失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 获取用户信息
  getUserInfo = async (req: AuthenticatedRequest, res: Response) => {
    // 如果有传来 user_id，就获取该用户的信息
    // 否则，就获取当前登录用户的信息
    let user_id = 0;
    if (req.query.user_id) {
      user_id = Number(req.query.user_id);
    } else {
      user_id = req.state!.userInfo.user_id;
    }
    try {
      // 去掉无关信息
      const {
        password,
        createdAt,
        updatedAt,
        university_id,
        gender,
        ...userInfo
      } = (
        await queryPromise("SELECT * FROM users WHERE user_id = ?", user_id)
      )[0];
      // 将university_id转换为university_name
      userInfo.university = (
        await queryPromise(
          "SELECT university_name FROM universities WHERE university_id = ?",
          university_id
        )
      )[0].university_name;
      // gender转为中文
      userInfo.gender = gender === 1 ? "男" : "女";

      unifiedResponseBody({
        result_code: 0,
        result_msg: "获取用户信息成功",
        result: userInfo,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取用户信息失败",
        result: {
          error
        },
        res,
      });
    }
  };

  // 获取用户列表
  getUserList = async (req: Request, res: Response) => {
    try {
      const result = await queryPromise(
        "SELECT * FROM users ORDER BY user_id DESC"
      );
      unifiedResponseBody({
        result_code: 0,
        result_msg: "获取用户列表成功",
        result,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取用户列表失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 上传头像
  uploadAvatar = async (req: Request, res: Response) => {
    if (!req.file) {
      unifiedResponseBody({
        httpStatus: 400,
        result_code: 1,
        result_msg: "未检测到图片文件，请重新上传",
        res,
      });
      return;
    }
    const imgURL = `${process.env.AVATAR_PATH}/${req.file.filename}`;
    unifiedResponseBody({
      result_code: 0,
      result_msg: "上传图片成功",
      result: imgURL,
      res,
    });
  };

  // 上传背景
  uploadBackground = async (req: Request, res: Response) => {
    if (!req.file) {
      unifiedResponseBody({
        httpStatus: 400,
        result_code: 1,
        result_msg: "未检测到图片文件，请重新上传",
        res,
      });
      return;
    }
    const imgURL = `${process.env.BACKGROUND_PATH}/${req.file.filename}`;
    unifiedResponseBody({
      result_code: 0,
      result_msg: "上传图片成功",
      result: imgURL,
      res,
    });
  };
}

export const usersController = new UsersController();
