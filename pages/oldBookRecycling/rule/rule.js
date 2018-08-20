// pages/oldBookRecycling/rule/rule.js
Page({
  data: {
    num: -1
  },

  onLoad: function (options) {

  },

  onReady: function () {
  
  },

  onShow: function () {
    this.setData({
        num: Math.random()
    })
      console.log(this.data.num)
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
  
  }
})