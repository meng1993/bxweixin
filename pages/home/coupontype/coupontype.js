var app=getApp();
var formData = require('../../../utils/util.js');
Page({
  onLoad(e){
    this.youhuijuan(e);
  },
  youhuijuan(e) {//查优惠卷
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let goods_type = e.type;
    let price = e.price;
    let json = { token: token, userId: user_id, goods_type: goods_type, "type": '1', commodity_price: price}
//    console.log(json);
    app.request('index/coupon/userCoupon', 'POST', json, 'youhuijuanb', this);
  },
  youhuijuanb(data){
    if(data.code!=200){
      return false;
    }
    for(let i=0;i<data.data.length;i++){
      let name = app.couponttype(data.data[i].goods_type);
      data.data[i]['start_time'] = formData.dateTime2(data.data[i].use_start_time*1000)
      data.data[i]['end_time'] = formData.dateTime2(data.data[i].use_end_time*1000)
      data.data[i].name = name ;
    }
    this.setData({lists:data.data});
  },
  use(e){
    if (app.repeat(e.timeStamp) == false) { return; }

    // console.log()
    if (e.currentTarget.id=='no'){
      let pages = getCurrentPages();//页面栈
      var prevPage = pages[pages.length - 2];//上一页Page对象
      if (prevPage.useyouhui) {//使用优惠券
        prevPage.useyouhui('no');
      }
      wx.navigateBack({ delta: 1 })
      return false
    }
    let index = e.currentTarget.id;
    let pages = getCurrentPages();//页面栈
    var prevPage = pages[pages.length - 2];//上一页Page对象
    if (prevPage.useyouhui) {//使用优惠券
      prevPage.useyouhui(this.data.lists[index]);
    }
    wx.navigateBack({delta:1})
  }
})