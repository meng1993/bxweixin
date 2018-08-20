var app = getApp();
Page({
  data: {
    imgSrc: [],         //展示图片的数组
    bookTotal: 0,       //展示的book总数
    eggNum: 0,          //展示的兑换鸟蛋总数
    list: '',
    book_reclaim: [],   //下单接口所需的book_reclaim_id的数组
    liuyan: '',
  },
  onLoad: function (options) {
    let list = JSON.parse(decodeURIComponent(options.list))

    this.setData({
        list: list,
        bookTotal: options.selectNum,
        eggNum: options.eggNum
    })
      // console.log('11111------->'+JSON.stringify(this.data.list))
      this.getMessage()
  },
  getMessage(){
    let list = this.data.list
    var imgSrc = []
    for(var i=0;i<list.length;i++){
      imgSrc.push(list[i].img_medium)
    }
    this.setData({
        imgSrc: imgSrc,
    })
  },
  commitOrder(){
    console.log(this.data.liuyan)
    let list = this.data.list;
    let token=wx.getStorageSync('token');
    let user_id=wx.getStorageSync('userdata').user_id;

    // 把book_reclaim_id取出来push到this.data.book_reclaim数组中
    for(var i=0;i<list.length;i++){
      this.data.book_reclaim.push(list[i].book_reclaim_id)
    }
    app.request('book/reclaim/reclaim_order_create', 'POST', { token: token, user_id: user_id,message: this.data.liuyan, book_reclaim: this.data.book_reclaim },
        'commitOrderSuccess', this);
  },
  commitOrderSuccess(res){
    console.log(res)
    if(res.code == 200){
        wx.redirectTo({
            url: '/pages/oldBookRecycling/orderList/orderList'
        })
    }
    // else {
    //     wx.showToast({ title: res.msg,icon: 'none', mask: true, duration: 1000 });
    // }
  },
  //  输入留言、改变liuyan值
  changeLiuyan(e){
    this.setData({
        liuyan: e.detail.value
    })
  },
  toOrderConfirmList(){
      let list = this.data.list
      wx.navigateTo({
          url: '/pages/oldBookRecycling/orderConfirmList/orderConfirmList?list='+encodeURIComponent(JSON.stringify(list))
      })
  }
})