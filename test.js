const fs = require("fs");
//读数据库
const usersString = fs.readFileSync("./db/users.json").toString();
const usersArray = JSON.parse(usersString);

//写数据库
const user3 = { id: 1, name: "tom", password: "zzz" };
usersArray.push(user3);
const string = JSON.stringify(usersArray);
fs.writeFileSync("./db/users.json", string);
