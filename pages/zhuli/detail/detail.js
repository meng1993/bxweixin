var app = getApp();
Page({
  onLoad(e){
    this.setData({ id : e.id})
    this.detail();
  },
  onShareAppMessage(res) {
    return {
      title: "全民助力！关注博鸟绘本，免费获得会员卡和优惠券",
      path: "pages/zhuli/list/list",
    }
  },
  data:{

  },
  detail(){
    app.request('book/assistance/assistanceInfo', 'POST', { assistance_id: this.data.id},'detailb',this);
  },
  detailb(data){
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    this.setData({detail:data.data})
  },
  zhuli(){
    if(wx.getStorageSync('token')===""){
      wx.navigateTo({url:"/pages/login/login"});
      return false
    }
    wx.navigateTo({ url: '/pages/group/savephoto/savephoto?from=zhuli&id=' + this.data.id });
  },
  jindu(){
    if (wx.getStorageSync('token') === "") {
      wx.navigateTo({ url: "/pages/login/login" });
      return false
    }
    let json = {
      assistance_id: this.data.id,
      user_id: wx.getStorageSync('userdata').user_id,
      token: wx.getStorageSync('token')
    }
    app.request('book/assistance/assistanceProgress', 'POST', json, 'jindub', this); 
  },
  jindub(data){
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    wx.navigateTo({ url: '/pages/zhuli/jilu/jilu?id=' + this.data.id });
  },
  share(){
    this.setData({share:true});
  },
  closeshare() {
    this.setData({ share: false });
  },
})