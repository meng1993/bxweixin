var app = getApp();
Page({
  data: {
   page:1,
   books: []
  },
  onLoad(e) {
    let pages = getCurrentPages();//页面栈
    if (pages.length === 1) {//分享进入
      this.setData({ _from: "2" })
    }
    this.setData({id:e.id})
    this.reqlist(),
    wx.showShareMenu({
      withShareTicket: true
    });
  },
  reqlist() {
    let json= {
      book_list_id:this.data.id,
      page:this.data.page
    }
    app.request('book/communitytwo/choiceness_book_item','POST',json,'list',this)
  },
  list(data){
    let _this = this;
    if(data.code==200){
      let books = this.data.books;
      data.data.book.forEach((e) => {
          e.img_medium = e.img_medium.split('@')[0];
      })
      books = books.concat(data.data.book)
      _this.setData({ lists: data.data, books: books})
     }
  },
  onReachBottom() {
    if(this.data.nomore){
      return false
    }
    this.setData({ page: this.data.page + 1 });
    this.reqlist();
  },
  gobook(e) {
    let book_id = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/detail/detail?bookid=' + book_id})
  },
  onShareAppMessage: function () {
    return {
      title: "博鸟绘本，最新最全的儿童绘本租赁平台~",
      path: '/pages/jingxuan/jingxuan?id=' + this.data.id,
      success: function () {
        wx.showToast({
          title: '转发成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function () {
        wx.showToast({
          title: '转发失败',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },
  goshouye() {
    wx.reLaunch({
      url: '/pages/shouye/shouye',
    })
  },
})