var app=getApp();
Page({
  onLoad(e){
    console.log(e)
    let id=e.a;//快递单号
    let name =e.b;//快递公司，拼音
    let company=e.c;//快递公司
    let json={
      token:wx.getStorageSync('token'),
      userId: wx.getStorageSync('userdata').user_id,
      nu:e.a,
      com:e.b,
    }
    if (e.d ==="delivery"){//发货
      app.request('index/user/alicloudapi', 'POST', json, 'getb', this);
    }else{//归还
      app.request('index/user/backRoute', 'POST', json, 'getb', this);
    }    
  },
  data:{
    startTitle:'已揽件',
    info: []
  },
  getb(data){
//    console.log(data);
    if (data.code == 300 || typeof data.data == 'string'){
      this.setData({ startTitle:"暂无物流信息"});
      return false
    }
    this.setData({info:data.data})
  }
})