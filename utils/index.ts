import db from "../database/index";
import { QueryOptions } from "mysql";
import { Response } from "express";
// 注册手机号验证
import md5 from "blueimp-md5";
import moment from "moment";
import { Base64 } from "js-base64";
import request from "request";

import dotenv from "dotenv";
dotenv.config();

interface UnifiedResponseBodyParams {
  httpStatus?: number;
  result_code?: 0 | 1; // 0-成功, 1-失败
  result_msg: string;
  result?: any;
  res: Response;
}

interface ErrorHandlerParams {
  error: any;
  httpStatus?: number;
  result_msg: string;
  result?: object;
  res: Response;
}

// 判断客户端传递的参数是否包含必须的参数
export const getMissingParam = (
  requireParams: string[],
  paramsFromClient: object
) => {
  const paramsFromClientKeys = Object.keys(paramsFromClient);

  for (const param of requireParams) {
    if (!paramsFromClientKeys.includes(param)) return param;
  }
};

// 使用Promise封装数据库查询，方便使用async/await来取出查询结果
export const queryPromise = (
  options: string | QueryOptions,
  values?: any
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (values) {
      db.query(options, values, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    } else {
      db.query(options, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    }
  });
};

// 成功返回响应体
export const unifiedResponseBody = ({
  httpStatus = 200,
  result_code = 0,
  result_msg,
  result = {},
  res,
}: UnifiedResponseBodyParams): void => {
  res.status(httpStatus).json({
    result_code,
    result_msg,
    result,
  });
};

export const errorHandler = ({
  error,
  httpStatus = 500,
  result_msg,
  result = {},
  res,
}: ErrorHandlerParams): void => {
  unifiedResponseBody({
    httpStatus,
    result_code: 1,
    result_msg,
    result,
    res,
  });
};

export const paramsErrorHandler = (result: object, res: Response) => {
  unifiedResponseBody({
    httpStatus: 400,
    result_code: 1,
    result_msg: "参数错误",
    result,
    res,
  });
};

// 获取当前时间
export const getPresentTime = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

// 生成指定长度的随机数
export const randomCode = (length: number) => {
  const chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let result = ""; //统一改名: alt + shift + R
  for (let i = 0; i < length; i++) {
    const index = Math.ceil(Math.random() * 9);
    result += chars[index];
  }
  return result;
};
