var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.argv[2];

if (!port) {
  console.log("请指定端口号好不啦？\nnode server.js 8888 这样不会吗？");
  process.exit(1);
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true);
  var pathWithQuery = request.url;
  var queryString = "";
  if (pathWithQuery.indexOf("?") >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf("?"));
  }
  var path = parsedUrl.pathname;
  var query = parsedUrl.query;
  var method = request.method;

  /******** 从这里开始看，上面不要看 ************/
  const session = JSON.parse(fs.readFileSync("./session.json").toString()); //读取的文件内容一定要toString()一下
  console.log("有个傻子发请求过来啦！路径（带查询参数）为：" + pathWithQuery);
  if (path === "/sign_in" && method === "POST") {
    // response.setHeader("Content-Type", "text/html;charset=utf-8");
    const userArray = JSON.parse(fs.readFileSync("./db/users.json"));
    const array = []; //把上传的内容输入到该数组
    request.on("data", (chunk) => {
      //监听请求request的数据
      array.push(chunk);
    });
    request.on("end", () => {
      const string = Buffer.concat(array).toString();
      console.log(string);
      const obj = JSON.parse(string); //name password
      const user = userArray.find(
        (user) => user.name === obj.name && user.password === obj.password
      );
      if (user === undefined) {
        response.statusCode = 400;
        response.setHeader("Content-Type", "text/json;charset=utf-8");

        response.end(`{"errorCode":4001}`);
      } else {
        response.statusCode = 200;
        const random = Math.random();

        session[random] = { user_id: user.id };
        fs.writeFileSync("./session.json", JSON.stringify(session));
        response.setHeader("Set-Cookie", `user_id=${random};HttpOnly`);
      }
      response.end();
    });
  } else if (path === "/home.html") {
    const cookie = request.headers["cookie"];
    let sessionId;
    try {
      sessionId = cookie
        .split(";")
        .filter((s) => s.indexOf("session_id" >= 0)[0].split("="[1]));
    } catch (error) {}

    if (sessionId) {
      //如果有userId
      const userId = session[sessionId].user_id;
      const userArray = JSON.parse(fs.readFileSync("./db/users.json"));
      const user = userArray.find((user) => user.id === userId);
      const homeHtml = fs.readFileSync("./public/home.html").toString();
      let string = "";
      if (user) {
        string = homeHtml
          .replace("{{loginStatus}}", "已登录")
          .replace("{{user.name}}", user.name);
      }
      // else {
      //   string = homeHtml
      //     .replace("{{loginStatus}}", "未登录")
      //     .replace("{{user.name}}", "");
      // }
      response.write(string);
    } else {
      const homeHtml = fs.readFileSync("./public/home.html").toString();
      const string = homeHtml
        .replace("{{loginStatus}}", "未登录")
        .replace("{{user.name}}", "");
      response.write(string);
    }
    response.end();
  } else if (path === "/register" && method === "POST") {
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    const userArray = JSON.parse(fs.readFileSync("./db/users.json"));
    const array = []; //把上传的内容输入到该数组
    request.on("data", (chunk) => {
      //监听请求request的数据
      array.push(chunk);
    });
    request.on("end", () => {
      const string = Buffer.concat(array).toString(); //把不同的内容合成字符串
      console.log(string);
      const obj = JSON.parse(string);
      console.log(obj.name);
      console.log(obj.password);
      const lastUser = userArray[userArray.length - 1];
      const newUser = {
        //id 为最后一个用户的id+1
        id: lastUser ? lastUser.id + 1 : 1,
        name: obj.name,
        password: obj.password,
      };
      userArray.push(newUser);

      fs.writeFileSync("./db/users.json", JSON.stringify(userArray));
      response.end();
    });
  } else {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    //m默认首页，如果是path==='/'则给path赋值'/index.html'
    const filePath = path === "/" ? "/index.html" : path;
    const index = filePath.lastIndexOf(".");

    const suffix = filePath.substring(index);
    const suffix1 = filePath.substring(index + 1);
    const fileTypes = { suffix: `text/` + suffix1 };
    //上面是简化版
    // const suffix = filePath.substring(index);
    // const fileTypes = {
    //   ".html": "text/html",
    //   ".css": "text/css",
    //   ".js": "text/js",
    //   ".png": "text/png",
    //   ".jpg": "text/jpg",
    // };

    response.setHeader("Content-Type", `${fileTypes};charset=utf-8`);
    let content;
    //错误捕获
    try {
      content = fs.readFileSync(`${filePath}`);
    } catch (error) {
      content = "文件不存在";
      response.statusCode = 404;
    }
    response.write(content);
    response.end();
  }
  /******** 代码结束，下面不要看 ************/
});
server.listen(port);
console.log(
  "监听 " +
    port +
    " 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:" +
    port
);
