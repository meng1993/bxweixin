const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
// 获取日期新增开始(毫秒数转化成日期格式（日期格式包括几点几分）)
const dateTime = value => {
    var oTime;
    var oDate = new Date(value)
    var oYear = oDate.getFullYear()
    var oMonth = oDate.getMonth() + 1
    var oDay = oDate.getDate()
    var oHour = oDate.getHours();
    var oMinute = oDate.getMinutes();
    var oSecond = oDate.getSeconds();
    if(oMonth < 10){
      oMonth = '0' + oMonth
    }
    if(oDay < 10){
        oDay = '0' + oDay
    }
    if (oHour < 10) {
        oHour = '0' + oHour
    }
    if (oMinute < 10) {
        oMinute = '0' + oMinute
    }
    if (oSecond < 10) {
        oSecond = '0' + oSecond
    }
    oTime = oYear + '-' + oMonth + '-' + oDay + '  ' + oHour + ':' + oMinute
    return oTime;
};
// 获取日期新增结束
// 获取日期新增开始(毫秒数转化成日期格式（日期格式不包括几点几分）)
const dateTime2 = value => {
    var oTime;
    var oDate = new Date(value)
    var oYear = oDate.getFullYear()
    var oMonth = oDate.getMonth() + 1
    var oDay = oDate.getDate()
    var oHour = oDate.getHours();
    var oMinute = oDate.getMinutes();
    var oSecond = oDate.getSeconds();
    if(oMonth < 10){
        oMonth = '0' + oMonth
    }
    if(oDay < 10){
        oDay = '0' + oDay
    }
    if (oHour < 10) {
        oHour = '0' + oHour
    }
    if (oMinute < 10) {
        oMinute = '0' + oMinute
    }
    if (oSecond < 10) {
        oSecond = '0' + oSecond
    }
    oTime = oYear + '-' + oMonth + '-' + oDay
    return oTime;
};
// 获取日期新增结束

module.exports = {
  formatTime: formatTime,
  dateTime: dateTime,
    dateTime2: dateTime2
}
