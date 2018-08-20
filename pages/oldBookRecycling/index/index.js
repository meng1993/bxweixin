// pages/oldBookRecycling/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: [
        {src: '/img/oldBook/process_2.png', 'text': '搜索图书；'},
        {src: '/img/oldBook/process_2.png', 'text': '加入回收书筐；'},
        {src: '/img/oldBook/process_2.png', 'text': '提交共享图书订单；'},
        {src: '/img/oldBook/process_2.png', 'text': '预约上门取书 (随借阅订单寄回,不支持单独寄回)；'},
        {src: '/img/oldBook/process_2.png', 'text': '平台审核并结算鸟蛋至'}
    ],
    index: 0,
    login: false
  },

  onLoad: function (options) {

  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      let token = wx.getStorageSync('token');
      if (token === ""){//判断登陆状态
          this.setData({ login: false, index: this.data.index + 1});
          if (this.data.index == 1) {
              wx.navigateTo({ url: '/pages/login/login' })
          }
      }else{
          this.setData({ login:true });
          // this.zhima();
          // app.getshelfnum();
          // this.orderstatus();
          // this.info();
      }
  },
    toCheck(e){
      console.log(e.currentTarget.dataset.type)
        let type = e.currentTarget.dataset.type
      wx.navigateTo({
          url: '/pages/oldBookRecycling/checkList/checkList?type='+type
      })
    },
    toWallet(){
        wx.navigateTo({
            url: '/pages/oldBookRecycling/wallet/wallet'
        })
    },
    toImgs(){
        wx.navigateTo({
            url: '/pages/oldBookRecycling/notRecyclingImg/notRecyclingImg'
        })
    },
    toRules(){
        wx.navigateTo({
            url: '/pages/oldBookRecycling/rule/rule'
        })
    }



})