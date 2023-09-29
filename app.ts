import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
// 引入路由模块
import usersRouter from "./routes/users";
import boxesRouter from "./routes/boxes";
import wallsRouter from "./routes/walls";
import othersRouter from "./routes/others";

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// 配置中间件
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 配置静态资源路径
app.use("/images", express.static(path.join(__dirname, "./public/images")));

// 注册路由模块
app.use("/users", usersRouter);
app.use("/boxes", boxesRouter);
app.use("/walls", wallsRouter);
app.use("/others", othersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
} as express.ErrorRequestHandler);

export default app;
