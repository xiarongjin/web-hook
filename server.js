const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// 使用 bodyParser 中间件解析请求体
app.use(bodyParser.json());

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
    // 在这里编写处理 push 事件的代码
    console.log(req.body);
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
