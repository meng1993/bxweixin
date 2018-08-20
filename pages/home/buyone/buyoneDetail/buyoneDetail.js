var formData = require('../../../../utils/util.js');
Page({
  data: {
    message: '',
    createTime: '',
  },
  onLoad: function (e) {
    console.log(JSON.parse(decodeURIComponent(e.message)))
    let message = JSON.parse(decodeURIComponent(e.message))
    message['create_time'] = formData.dateTime(message.create_time*1000)
    this.setData({
        message: message,
        createTime: 1
    })
      // data.data[i]['start_time'] = formData.dateTime2(data.data[i].use_start_time*1000)
  },
  onShow: function () {
  
  },
})