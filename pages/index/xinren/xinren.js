var app = getApp();
Page({
  onLoad(e) {
    if(e.id==1){//新人
      let a = Math.random();
      this.setData({ src:"https://m.zujiekeji.cn/xcximg/newpeople.jpg?a="+a, btn:true})
    }else if(e.id==2){//环保袋
      this.setData({ src: "https://m.zujiekeji.cn/img/activity-201804.jpg" });
      wx.setNavigationBarTitle({ title: '活动' })
    }
  },
  data: {
    login: true
  },
  getCoupon(e) {
    let token = wx.getStorageSync('token');
    if (token === '') { 
      wx.navigateTo({url: '/pages/login/login'})
      return false; }
    let data = {
      userId: wx.getStorageSync("userdata").user_id,
      token: token
    }
    app.request('index/coupon/receiveCoupon', 'POST', data, 'goto_shouye', this);
  },
  goto_shouye(data){
    wx.navigateTo({ url:'/pages/home/coupon/coupon'})
  }
})