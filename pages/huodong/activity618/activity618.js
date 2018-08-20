var app = getApp();
Page({
  onLoad(e) {
    this.setData({id:e.id})
  },
  data: {
  },
  getCoupons(e) {
    let token = wx.getStorageSync('token');
    if (token === '') {
      wx.navigateTo({ url: '/pages/login/login' })
      return false;
    }
    let data = app.token({activity_id: this.data.id})
    app.request('book/bargain/active_coupon', 'POST', data,'getb', this);
  },
  getb(data){
    app.tishi('提示',data.msg)
  }
})