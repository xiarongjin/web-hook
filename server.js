const express = require("express");
const bodyParser = require("body-parser");
const spawn = require("child_process").spawn;
// 脚本地址
const script = "deploy.sh";
// 执行指令的地址
const currentPath = "../myself/ppfg";
const app = express();

// 使用 bodyParser 中间件解析请求体
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.all("*", function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", "*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers", "content-type");
  //跨域允许的请求方式
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == "options") res.sendStatus(200);
  //让options尝试请求快速结束
  else next();
});

function rumCommand(cmd, currentPath, args, callback) {
  var child = spawn(cmd, args, {
    cwd: currentPath,
  });
  var response = "";
  child.stdout.on("data", function (buffer) {
    response += buffer.toString();
  });
  child.stdout.on("end", function () {
    callback(response);
  });
}

// 配置 GitHub Webhook 的路由和处理函数
app.post("/webhook", (req, res) => {
  const eventType = req.headers["x-github-event"];

  if (eventType === "ping") {
    console.log("Received ping event");
    return res.send("OK");
  }

  if (eventType === "push") {
    console.log("Received push event");
    console.log("Pushed branch:", req.body.ref);
    console.log("Commit message:", req.body.head_commit.message);
    if (req.body.head_commit.message.includes("deploy")) {
      // 前端重新部署
      // 在这里编写处理 push 事件的代码
      rumCommand("sh", currentPath, [script], function (txt) {
        console.log(`在${currentPath}目录下执行了脚本${script}`);
        console.log(txt);
      });
    }
    if (req.body.head_commit.message.includes("back")) {
      // 前端重新部署
      // 在这里编写处理 push 事件的代码
      rumCommand("sh", "../myself/back-end", [script], function (txt) {
        console.log(`在${"../myself/back-end"}目录下执行了脚本${script}`);
        console.log(txt);
      });
    }

    return res.send("OK");
  }

  console.log(`Received unsupported event type: ${eventType}`);
  return res.send("Unsupported event type");
});

// 启动服务器监听 Webhook 请求
const port = process.env.PORT || 3840;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
