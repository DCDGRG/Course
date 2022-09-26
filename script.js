const oop = "面向对象程序设计.json";
const rg = "软件工程概论.json";
const db = "数据库系统.json";
const jz = "计算机组成与结构.json";
const dm = "数据管理技术.json";
const cm = "通信技术基础.json";
const bg = "海量数据管理.json";
const colors = require("colors");

// main
if (process.argv.length !== 5 && process.argv.length !== 6) {
  showUsage();
  process.exit(1);
}
// get args
const args = process.argv.slice(2);
let file, courseID, json;
if (args[0] === "show" || args[0] === "rm") {
  file = args[1];
  courseID = args[2];
} else {
  file = args[0];
  courseID = args[1];
  json = args[2];
}
switch (file) {
  case "oop":
    file = oop;
    break;
  case "rg":
    file = rg;
    break;
  case "db":
    file = db;
    break;
  case "jz":
    file = jz;
    break;
  case "dm":
    file = dm;
    break;
  case "cm":
    file = cm;
    break;
  case "bg":
    file = bg;
    break;
  default:
    showUsage();
    process.exit(1);
}
// process
switch (args[0]) {
  case "show":
    show(file, courseID);
    break;
  case "rm":
    remove(file, courseID);
    break;
  default:
    if (args.length === 4) {
      add(file, courseID, json, args[3]);
    } else {
      add(file, courseID, json);
    }
    break;
}

// functions

function show(file, courseID) {
  let data = readData(file);
  if (data === undefined) {
    process.exit(1);
  }
  if (courseID === "ls") {
    for (let key in data) {
      console.log(key);
    }
    return;
  }
  const courseClass = getCourseClass(courseID);
  if (!data.hasOwnProperty(courseClass)) {
    console.log("No data");
    process.exit(1);
  }
  console.log("--------------------------------------------------------------------------------");
  if (courseClass !== courseID) {
    // 如果指定了课程序号，则只显示该序号对应的 URL 。
    const num = parseInt(courseID.split("-")[2]);
    console.log(data[courseClass][num - 1]);
    console.log("--------------------------------------------------------------------------------");
    return;
  }
  for (let url of data[courseClass]) {
    console.log(url);
    console.log("--------------------------------------------------------------------------------");
  }
}

function remove(file, courseID) {
  let data = readData(file);
  if (data === undefined) {
    process.exit(1);
  }
  const courseClass = getCourseClass(courseID);
  let num;
  if (courseClass !== courseID) {
    num = parseInt(courseID.split("-")[2]);
  }
  if (data.hasOwnProperty(courseClass)) {
    if (num) {
      if (num === data[courseClass].length) {
        data[courseClass].pop();
      } else {
        delete data[courseClass][num - 1];
      }
    } else {
      delete data[courseClass];
    }
    const fs = require("fs");
    fs.writeFileSync(file, JSON.stringify(data, null, "  "));
    console.log("success");
  } else {
    console.log("No data");
    process.exit(1);
  }
}

function readData(file) {
  let data, content;
  const fs = require("fs");
  try {
    content = fs.readFileSync(file, "utf8");
    data = JSON.parse(content);
  } catch (e) {
    if (e.code === "ENOENT") {  // file not exist
      console.log("==> " + "Warning: \n".yellow + "\tFile not found: " + file);
    } else if (e instanceof SyntaxError) {  // file is empty
      console.log("==> " + "Warning: \n".yellow + "\tFile is not a valid JSON file: " + file);
    }
    return undefined;
  }
  return data;
}

function sortObjByKey(obj) {
  let keys = Object.keys(obj)
    .sort((str1, str2) => {
      let res = str1.split("-")[0] - str2.split("-")[0];
      if (res) {
        return res;
      }
      return str1.split("-")[1] - str2.split("-")[1];
    })
    .reverse();
  let ret = {};
  for (let key of keys) {
    ret[key] = obj[key];
  }
  return ret;
}

function add(file, courseID, s, option = "--adapt") {
  switch (option) {
    case "--mobile":
      option = "mobile";
      break;
    case "--teacherTrack":
      option = "teacherTrack";
      break;
    case "--pptVideo":
      option = "pptVideo";
      break;
    case "--adapt":
      option = adaptOption(file);
      break;
    default:
      showUsage();
      process.exit(1);
  }
  let obj, url;
  try {
    obj = JSON.parse(s);
    if (!obj.hasOwnProperty("videoPath")) {
      console.log("==> " + "Error:\n".red + "\tNo video path not found.");
      process.exit(1);
    }
    if (obj.videoPath.hasOwnProperty(option)) {
      url = obj.videoPath[option];
    } else {
      if (Object.keys(obj.videoPath).length === 1) {
        url = obj.videoPath[Object.keys(obj.videoPath)[0]];
        console.log("==> " + "Warning:\n".yellow + "\tNo video path for " + option + " found, used " + Object.keys(obj.videoPath)[0] + " instead.");
      } else {
        console.log("==> " + "Warning:\n".yellow + "\tNo video path for " + option + " found.");
        console.log("\tYou can try with:\n\t");
        for (let key in obj.videoPath) {
          console.log(key + " ");
        }
        const readlineSync = require("readline-sync");
        option = readlineSync.question("\tWhich one do you prefer?\n");
        if (obj.videoPath.hasOwnProperty(option)) {
          url = obj.videoPath[option];
        } else {
          console.log("==> " + "Error:\n".red + "\tNo such videoPath.");
          process.exit(1);
        }
      }
    }
  } catch (e) {
    let ans = readlineSync.question("\t==> " + "Warning:\n".yellow + "\tJSON parse failed. Do you want to add the content anyway? [Y/n]\n");
    if ((ans === "y") || (ans === "Y")) {
      url = s;
    } else {
      process.exit(0);
    }
  }
  let data = readData(file);
  const split = courseID.split("-");
  const courseClass = split[0] + "-" + split[1];
  let num = parseInt(split[2]);
  if (data === undefined) {
    data = {};
    data[courseClass] = [];
    if (!num) {
      // 如果没有指定序号，则默认放到第一个。
      num = 1;
    }
    data[courseClass][num - 1] = url;
    data = sortObjByKey(data);
  } else {
    // 检查重复
    for (let courseID in data) {
      let res = data[courseID].findIndex((_url, index) => _url === url);
      if (res !== -1) {
        console.log("==> " + "Warning:\n".red + "\tDuplicated with " + courseID + "-" + (res + 1));
        process.exit(1);
      }
    }
    // 如果 courseClass 已经存在
    if (data.hasOwnProperty(courseClass)) {
      if (!num) {
        // 没有指定序号
        if (!data[courseClass][0]) {
          num = 1;
        } else if (!data[courseClass][1]) {
          num = 2;
        } else {
          // 已记录课程大于等于 2
          readlineSync = require("readline-sync");
          let ans = readlineSync.question(
            "==> " +
            "Warning:\n\t".yellow +
            courseClass +
            "-1 and " +
            courseClass +
            "-2 already exist, where do you want to add? [n]\n\tEnter q to cancel.\n"
          );
          if (ans === "q") {
            return;
          }
          num = parseInt(ans);
          if (isNaN(num)) {
            console.log("==> " + "Error:\n".red + "\tInvalid number");
            process.exit(1);
          }
        }
      }
      data[courseClass][num - 1] = url;
    } else {
      // 如果 courseClass 不存在，则创建课程类别。
      data[courseClass] = [];
      if (!num) {
        // 如果没有指定序号，则默认放到第一个。
        num = 1;
      }
      data[courseClass][num - 1] = url;
    }
    data = sortObjByKey(data);
  }
  // 格式美化
  try {
    data = JSON.stringify(data, null, "    ");
    const prettier = require("prettier");
    data = prettier.format(data, { semi: false, parser: "json" });
  } catch (e) {
    console.log("==> " + "Notice:\n".gray + "\tPrettier error");
  }

  // 写入文件
  const fs = require("fs");
  fs.writeFile(file, data, (err) => {
    if (err) {
      console.log("Write file error");
      process.exit(1);
    }
    console.log(
      "==> " + "Successfully added " +
      file.slice(0, file.indexOf(".")) +
      " " +
      courseClass +
      "-" +
      num +
      " with " +
      option +
      " mode."
    );
  });
}

function showUsage() {
  console.log(
    "Usage: node script.js <file> <courseWeek-week[-n]> 'JSON' [--mobile|--teacherTrack|--pptVideo]"
  );
  console.log("       node script.js show <file> <courseWeek-week[-n]>|<ls>");
  console.log("       node script.js rm   <file> <courseWeek-week[-n]>");
  console.log("<file>: oop = 面向对象程序设计; rg = 软件工程概论; db = 数据库系统; jz = 计算机组成与结构; dm = 数据管理技术; cm = 通信技术基础; bg = 海量数据管理");
}

function getCourseClass(courseID) {
  let courseClass;
  const split = courseID.split("-");
  courseClass = split[0] + "-" + split[1];
  return courseClass;
}

// 在这里编辑课程的默认视频类型
function adaptOption(file) {
  switch (file) {
    default:
      return "mobile";
  }
}