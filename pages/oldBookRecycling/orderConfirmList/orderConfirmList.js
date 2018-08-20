// pages/oldBookRecycling/orderConfirmList/orderConfirmList.js
Page({
  data: {
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
          list: JSON.parse(decodeURIComponent(options.list))
      })
      console.log(this.data.list)
  },
  onShow: function () {

  },
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
  toDetail(e){
    let bookid = e.currentTarget.dataset.id
    wx.navigateTo({
        url: '/pages/detail/detail?bookid='+bookid
    })
  }
})