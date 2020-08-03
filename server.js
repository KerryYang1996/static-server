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

  console.log("有个傻子发请求过来啦！路径（带查询参数）为：" + pathWithQuery);

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
    content = fs.readFileSync(`./public${filePath}`);
  } catch (error) {
    content = "文件不存在";
    response.statusCode = 404;
  }
  response.write(content);
  response.end();

  //   else {
  //     response.statusCode = 404;
  //     response.setHeader("Content-Type", "text/html;charset=utf-8");
  //     response.write(`你输入的路径不存在对应的内容`);
  //     response.end();
  //   }

  /******** 代码结束，下面不要看 ************/
});

server.listen(port);
console.log(
  "监听 " +
    port +
    " 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:" +
    port
);