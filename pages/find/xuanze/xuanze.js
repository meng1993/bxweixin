var app = getApp();
var json2 = require('../../../json/json2.js');
Page({
  onLoad(){
    this.setData({ mylists: json2.mylists2})
  },
  data:{

  },
  list2(e){
    let id = e.currentTarget.id;
    if (id == 'sao') {
      let page = getCurrentPages()[getCurrentPages().length-2];
      page.cam();
      wx.navigateBack({delta: 1});
    } else if (id == 'search') {
      wx.redirectTo({ url: '/pages/shuwu/search/search' })
    } else if (id == 'add') {
      wx.redirectTo({ url: '/pages/shuwu/cam/cam' })
    }
  }
})