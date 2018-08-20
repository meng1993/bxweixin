var app = getApp();
Page({
  data: {
      titles: [{ a: '全部', b: "" }, { a: '待付款', b: "1" }, { a: '订单完成', b: "2" }],
      emptyContent: '暂无赔偿订单',
      status: 0,
      page: 1,
      pagesize: 10,
      objData: '',    //订单列表及订单信息的对象
  },
  onLoad: function (options) {
    this.change({currentTarget:{id: 0,dataset:{index: 0}}})
    this.getList()
  },
  onShow: function () {
  
  },
// 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
  
  },
// 页面上拉触底事件的处理函数
  onReachBottom: function () {

  },
  change(e) {//换状态搜索
      this.setData({ status: e.currentTarget.id, lists: [], page: 1, _index: e.currentTarget.dataset.index,
          havemore:true})
      this.getList();
  },
  getList(){
      let status = this.data.status;
      let token = wx.getStorageSync('token');
      let user_id = wx.getStorageSync('userdata').user_id;
      let page = this.data.page;
      let pagesize = this.data.pagesize;
      let json = {
          token: token, user_id: user_id, page: page, status: status,pagesize: pagesize
      }
      // wx.showLoading({title:'加载中...'});
      app.request('book/purchase/purchase_list', 'POST', json, 'getListSuccess', this)
  },
  getListSuccess(res){
    if(res.code == 200){
      this.setData({
          objData: res.data,
      })
    }
    console.log(JSON.stringify(res.data))
  },
  toPay(e){
      let token = wx.getStorageSync('token');
      let user_id = wx.getStorageSync('userdata').user_id;
      let purchase_order_id = e.currentTarget.dataset.id;   //赔偿订单主键id
      let openId=wx.getStorageSync('openid');
      let json = {
          token: token, user_id: user_id, purchase_order_id: purchase_order_id,
          openId: openId, pay_method: 6, buy_type: 'buy_book',platform: 'weixin'
      }
      app.request('book/purchase/purchasepay', 'POST', json, 'toPaySuccess', this)
  },
  toPaySuccess(res){
      console.log('22222-------->'+JSON.stringify(res))

      if (res.code && res.code == 300) {
          wx.showToast({ title: res.msg, mask: true, duration: 1000, icon: 'none' });
          return false;
      }
      if (res.code && res.code == 350){
          //跳转赔偿列表
          return false;
      }
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
    //取消订单
    cancelOrder(e){
        let token = wx.getStorageSync('token');
        let user_id = wx.getStorageSync('userdata').user_id;
        let purchase_order_id = e.currentTarget.dataset.id;   //赔偿订单主键id
        let json = {
            token: token, user_id: user_id, purchase_order_id: purchase_order_id
        }
        app.request('book/purchase/purchase_order_delete', 'POST', json, 'cancelOrderSuccess', this)
    },
    cancelOrderSuccess(res){
        this.getList()
    },
    toDetail(e){

        let id = e.currentTarget.dataset.id
        let list = this.data.objData
        var bookorder;
        for(var i=0;i<list.length;i++){
            if(list[i].id == id){
                bookorder = list[i]
            }
        }
        console.log('json---------->'+JSON.stringify(bookorder))
        wx.navigateTo({
            url: "/pages/home/buyone/buyoneDetail/buyoneDetail?message=" + encodeURIComponent(JSON.stringify(bookorder))
        })
        // console.log('json---------->'+JSON.stringify(this.data.objData[0].book_list))
        // let id = e.currentTarget.dataset.id
        // let list = this.data.objData
        // var bookorder;
        // for(var i=0;i<list.length;i++){
        //     if(list[i].id == id){
        //         bookorder = list[i].book_list
        //     }
        // }
        // wx.setStorageSync('bookorder',bookorder);
        // wx.navigateTo({ url: '/pages/shelf/zhanshi/zhanshi' })

    }
})