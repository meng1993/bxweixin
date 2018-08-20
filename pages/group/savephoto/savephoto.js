var app = getApp();
Page({
  onLoad(e){
//    console.log(e);
    this.setData({ "from": e.from});
    if (e.from && e.from =="kanjia"){
      wx.setNavigationBarTitle({ title:"砍价"})
      this.setData({ jiekou: "wechat/index/getbargainshareimage" });
      let json = { id: e.id };//user_bargain_id
      this.getimg(json);
    } else if (e.from &&e.from == "pintuan"){
      wx.setNavigationBarTitle({ title: "拼团" })
      this.setData({ jiekou:"wechat/index/getwxacode"});
      let json = {  group_order_id: e.group_id}
      this.getimg(json);
    } else if (e.from && e.from == "zhuli") {
      wx.setNavigationBarTitle({ title: "助力" })
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff',
      })
      this.setData({ jiekou: "book/assistance/assistanceAdd" });
      let json = {
        assistance_id: e.id,
        openid: wx.getStorageSync('openid'),
        user_id: wx.getStorageSync('userdata').user_id,
        token: wx.getStorageSync('token')
      }
      this.getimg(json);
    } else if (e.from && e.from == "find") {
      wx.setNavigationBarTitle({ title: "阅读" })
      this.setData({ jiekou: "index/index/shareread" });
      let json = app.token({ id: e.id,userId:wx.getStorageSync('userdata').user_id});
      this.getimg(json,'GET');
    } 
  },
  getimg(json,mothod='POST'){
    wx.showLoading({title: '图片生成中...'});
    //app.request(this.data.jiekou, "POST", json, 'getimgb', this);
    let _this = this;

    app.request(_this.data.jiekou, mothod, json,
        'getimgSuccess', _this);
    // wx.request({
    //   url: app.data.http + this.data.jiekou,
    //   method: mothod,
    //   data:json,
    //   success(data){
    //     _this.getimgb(data.data);
    //     wx.hideLoading();
    //   },
    //   fail(){
    //     wx.showToast({title: '图片生成失败',icon:"none"});
    //   }
    // })
  },
  getimgSuccess(data){
    this.getimgb(data);
    wx.hideLoading();
  },
  getimgb(data){
    this.setData({src:data.data.src});
  },
  data: {
  },
  save(){
    wx.downloadFile({
      url: this.data.src,
      success(res){
//        console.log(res);
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res){
            wx.showToast({
              title: '保存成功~',
              icon: 'success',
              duration: 2000
            })
          },
          fail() {
            wx.showToast({
              title: '保存失败',
              icon: 'none',
              duration: 2000
            })
          }
        })
      }
    })
  },
  fail(){
//    console.log('fail')
  }
});