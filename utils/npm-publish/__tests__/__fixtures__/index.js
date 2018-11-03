const fs = require("fs");
const path = require("path");

module.exports = {
  npm: {
    success: fs.readFileSync(path.join(__dirname, "npm-success.txt"), { encoding: "utf8" }),
    tfa: fs.readFileSync(path.join(__dirname, "npm-error-tfa.txt"), { encoding: "utf8" }),
  },
  yarn: {
    success: fs.readFileSync(path.join(__dirname, "yarn-success.txt"), { encoding: "utf8" }),
    tfa: fs.readFileSync(path.join(__dirname, "yarn-error-tfa.txt"), { encoding: "utf8" }),
  },
};
