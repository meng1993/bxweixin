var app = getApp();
Page({
  go(e){
    if (e.currentTarget.id==="1"){
      wx.navigateTo({ url: '/pages/kanjia/kanjiaye/kanjiaye' });
    }
    else if (e.currentTarget.id === "2") {
      wx.navigateTo({ url: '/pages/pintuan/list/list' });
    }
    else if (e.currentTarget.id === "3") {
      wx.navigateTo({ url: '/pages/zhuli/list/list' });
    }
  },
  lingquan(){
    if (wx.getStorageSync('token')===""){
      wx.navigateTo({url:'/pages/login/login'});
      return false
    }
    let json = {
      token : wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id
    }
    app.request('book/bargain/kidsDayActive', 'POST', json,'lingquanb',this);
  },
  lingquanb(data){
    app.tishi('提示',data.msg);
  }
})