// pages/diandu/czyDetail/czyDetail.js
var app = getApp();
var formData = require('../../../utils/util.js');
Page({
  data: {
    detail: '',
    createTime: ''
  },
  onLoad: function (options) {
    let message = JSON.parse(options.message)
      let createTime = formData.dateTime(message.create_time*1000)
    this.setData({
        detail: message,
        createTime: createTime
    })

    console.log(JSON.stringify(this.data.detail))
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  },
  onHide: function () {
  
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
  //    取消订单
  cancelOrder: function () {
      var that = this
      let token=wx.getStorageSync('token');
      let userId=wx.getStorageSync('userdata').user_id;
      let id = that.data.detail.id;

      app.request('book/product/product_order_delete', 'POST', { token: token, user_id: userId, product_order_id: id },
          'cancelOrderSuccess', this);
      // wx.request({
      //     url: app.data.http +'book/product/product_order_delete',
      //     method:'post',
      //     header: {
      //         'content-type': 'application/x-www-form-urlencoded'
      //     },
      //     data: {token: token, user_id: userId, product_order_id: id},
      //     success(res){
      //       console.log(res)
      //         wx.navigateBack()
      //     }
      // })
  },
    cancelOrderSuccess(res){
        wx.showToast({ title: '取消成功！', icon: 'success', mask: true, duration: 1000 });
        // console.log(res)
        setTimeout(function () {
            wx.navigateBack()
        },1000)

    },
    //支付
    toPay: function (e) {
        var that = this
        let token=wx.getStorageSync('token');
        let userId=wx.getStorageSync('userdata').user_id;
        let openId = wx.getStorageSync('openid');
        let orderSn  = e.currentTarget.dataset.ordersn;

        app.request('book/product/productpay', 'POST', { token: token, user_id: userId, orderSn: orderSn,payMethod: 'weixin', openId: openId},
            'toPaySuccess', this);
        // wx.request({
        //     url: app.data.http +'book/product/productpay',
        //     method:'post',
        //     data: {token: token, user_id: userId, orderSn: orderSn,payMethod: 'weixin', openId: openId},
        //     success(res){
        //         console.log(JSON.stringify(res))
        //         let data = res.data;
        //         wx.requestPayment({
        //             'timeStamp': data.timeStamp,
        //             'nonceStr': data.nonceStr,
        //             'package': data.package,
        //             'signType': data.signType,
        //             'paySign': data.paySign,
        //             'success':function(res){
        //                 wx.showToast({ title: '购买成功！', icon: 'success', mask: true, duration: 1000 });
        //             },
        //             'fail':function(res){
        //                 wx.showToast({ title: '支付取消', mask: true, duration: 1000, icon: 'none' });
        //             }
        //         })
        //     }
        // })
    },
    toPaySuccess(res){
        // console.log(JSON.stringify(res))
        // let data = res.data;
        wx.requestPayment({
            'timeStamp': res.timeStamp,
            'nonceStr': res.nonceStr,
            'package': res.package,
            'signType': res.signType,
            'paySign': res.paySign,
            'success':function(res){
                wx.showToast({ title: '购买成功！', icon: 'success', mask: true, duration: 1000 });
            },
            'fail':function(res){
                wx.showToast({ title: '支付取消', mask: true, duration: 1000, icon: 'none' });
            }
        })
    },
    // 查看物流
    wuliu: function (e) {
        let a=e.currentTarget.dataset.a;
        let b = e.currentTarget.dataset.b;
        let c = e.currentTarget.dataset.c;
        let d = e.currentTarget.dataset.d;
        wx.navigateTo({url: '/pages/home/getwuliu/getwuliu?a='+a+'&b='+b+'&c='+c+'&d='+d})
    }
})