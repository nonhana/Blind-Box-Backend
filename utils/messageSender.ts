// 发短信功能模块的封装：
var SMSClient = require("@alicloud/sms-sdk"); //用户调用阿里短信平台的框架
import dotenv from "dotenv";
dotenv.config();

//实例一个发送短信的实例
const smsClient = new SMSClient({
  accessKeyId: process.env.ACCESSKEY_ID!,
  secretAccessKey: process.env.ACCESSKEY_SECRET!,
});

// 发送短信验证码的函数
export const sendLoginCroeCode = async (phone: string, verCode: string) => {
  //发送短信功能封装为函数供其它需要发送短信的地方调用
  try {
    //参数校验
    if (!phone) throw "缺少号码";
    if (!verCode) throw "缺少验证码";
    //构造请求参数：
    var dataToSend = {
      PhoneNumbers: phone,
      SignName: process.env.SIGN_NAME!,
      TemplateCode: process.env.TEMPLATE_CODE!,
      TemplateParam: JSON.stringify({ code: verCode }),
    };

    //调用smsClient实例的方法：sendSMS，发送验证码
    const res = await smsClient.sendSMS(dataToSend);

    const { Code } = res;
    // 处理状态：
    if (Code === "OK") {
      //处理返回参数
      return res;
    }
    throw "短信发送失败!";
  } catch (error) {
    throw "发送短信验证码失败,您的操作可能过于频繁,请稍微再试!";
  }
};
