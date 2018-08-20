var app = getApp();
Page({
  onLoad(e){
    this.setData({id:e.id});
    this.detail();
  },
  detail() {
    let json = {
      assistance_id: this.data.id,
      user_id: wx.getStorageSync('userdata').user_id,
      token: wx.getStorageSync('token')
    }
    app.request('book/assistance/assistanceProgress', 'POST', json, 'detailb', this);
  },
  detailb(data){
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    data.data.list.forEach((item)=>{
      item.subscribe_time = app.shijianchuo3(item.subscribe_time);
    })
    this.setData({list:data.data.list,count:data.data.count});
  }
})