module.exports = function datecomp(num = Date.now()) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
  var curTime = new Date(num).toUTCString().split` `;
  curTime.shift();
  var day = Number(curTime.shift()).toString(32);
  var month = months.indexOf(curTime.shift()).toString(13);
  var year = (Number(curTime.shift()) - 2018).toString(36);
  var rest = curTime.shift().split`:`;
  var hour = Number(rest.shift()).toString(24);
  var minute = Number(rest.shift()).toString(36);
  return day + month + year + hour + minute;
};
