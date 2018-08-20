var app = getApp();
Page({
  data: {
      book_reclaim_order_id: '',
      orderMessage: '',      //订单详情所有信息，包括列表
      list: '',             //订单信息中的图书列表
  },
  onLoad: function (options) {
    let book_reclaim_order_id = options.id
    this.setData({
        book_reclaim_order_id: book_reclaim_order_id
    })
    console.log(book_reclaim_order_id)
    this.getMessage()
  },
  onPullDownRefresh: function () {
  
  },
  onReachBottom: function () {
  
  },
  getMessage(){
      let token=wx.getStorageSync('token');
      let user_id=wx.getStorageSync('userdata').user_id;
      app.request('book/reclaim/reclaim_order_detail', 'POST', { token: token, user_id: user_id, book_reclaim_order_id: this.data.book_reclaim_order_id},
          'getMessageSuccess', this);
  },
  getMessageSuccess(res){
    this.setData({
        orderMessage: res.data,
        list: res.data.book_list
    })
    console.log('res----------->'+JSON.stringify(res))
  },
    cancelOrder(e){
        let book_reclaim_order_id = e.currentTarget.dataset.id
        let token=wx.getStorageSync('token');
        let user_id=wx.getStorageSync('userdata').user_id;
        app.request('book/reclaim/reclaim_order_delete', 'POST', { token: token, user_id: user_id,book_reclaim_order_id: book_reclaim_order_id },
            'cancelOrderSuccess', this);
    },
    cancelOrderSuccess(res){
        console.log(res)
        wx.showToast({ title: res.msg,icon: 'none', mask: true, duration: 1000 });
        setTimeout(function () {
            wx.navigateBack();
        },1000)
    },
    toDetail(e){
        let id = e.currentTarget.dataset.id
        wx.navigateTo({ url: '/pages/detail/detail?bookid='+id});
    },
})