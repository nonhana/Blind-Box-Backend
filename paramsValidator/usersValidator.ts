import { body, Meta } from "express-validator";

// 给req.body专用判断的
const atLeastOneParamExists = (input: any, { req }: Meta) => {
  if (Object.keys(req.body ?? {}).length === 0) {
    throw new Error("至少包含一个参数");
  }
  return true;
};

export const usersValidator = {
  ["send-mobile-code"]: [body("mobile").isMobilePhone("zh-CN")],
  // 输入电话号码+密码
  ["register"]: [
    body("phonenumber").isMobilePhone("zh-CN"),
    body("password").isString().isLength({ min: 6, max: 20 }),
  ],
};
