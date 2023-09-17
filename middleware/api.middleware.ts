import { Request, Response, NextFunction } from "express";
import { queryPromise, errorHandler } from "../utils/index";

// 记录调用某个api的次数
export const apiRecord: any = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 获取请求的api的url
  const { url } = req;
  try {
    // 检查有无重复
    const check = await queryPromise(
      "SELECT * FROM api-records WHERE api_url = ?",
      url
    );
    if (check.length === 0) {
      // 如果没有，就添加
      await queryPromise("INSERT INTO api-records SET api_url = ?", url);
    } else {
      // 如果有，就更新
      await queryPromise(
        "UPDATE api-records SET count = count + 1 WHERE api_url = ?",
        url
      );
    }
  } catch (error) {
    errorHandler({
      error,
      result_msg: "记录api调用次数失败",
      result: { error },
      res,
    });
  }
  next();
};
