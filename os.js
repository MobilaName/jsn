// const os = require('os');

const isMac = process.platform === "darwin";
const isWindows = process.platform === "win32";
const isLinux = process.platform === "linux";

module.exports = {
  isMac,
  isWindows,
  isLinux,
};
