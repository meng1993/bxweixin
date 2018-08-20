var app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    courierList: ['京东快递',"顺丰快递"],
    courierCodeList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCourierList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  checkCourier(e){
    let pages = getCurrentPages()
    let prePage = pages[pages.length - 2]
    prePage.setData({
      courierName: e.currentTarget.dataset.name,
      courierCode: e.currentTarget.dataset.code
    })
    console.log(e.currentTarget.dataset.name)
    wx.navigateBack()
  },
  getCourierList(){
      let token = wx.getStorageSync('token');
      let userId = wx.getStorageSync('userdata').user_id;
      let json = { token: token, user_id: userId, platform: 'weixin' };
      app.request('book/user/expressList', 'POST', json,'submitOrderSuccess',this);
  },
  submitOrderSuccess(res){
    console.log(JSON.stringify(res))
    let data = res.data;
    var keyArr = [];
    var valArr = []
    for (var i in data) {
        console.log("key:" + i + ", value:" + data[i]);
        keyArr.push(i)
        valArr.push(data[i])
    }
    console.log(keyArr)
    console.log(valArr)
    this.setData({
      courierList: valArr,
      courierCodeList: keyArr
    })
  }
})