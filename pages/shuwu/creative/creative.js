let app = getApp();
Page({
  data: {
    page:1
  },
  onLoad(e){
    let book = {};
    book.book_id = e.id;
    book.user_study_id = e.uid;
    book.daka_num = e.num
    this.setData({ book: book });
    console.log(book);
    this.jilu();
  },
  onReachBottom() {
    if (this.data.nomore) {
      return false;
    }
    this.setData({ page: this.data.page + 1 });
    this.jilu();
  },
  jilu() {
    let book = this.data.book;
    let json = app.token({ page: this.data.page ,
      book_id: book.book_id, user_study_id: book.user_study_id});
    app.request("book/communitytwo/record_list", 'POST', json, 'jilub', this);
  },
  jilub(data) {
    if (data.code != 200) {
      return false
    }
    if (data.data.length < 10) {
      this.setData({ nomore: true });
    }
    this.setData({ jilulist: (this.data.jilulist || []).concat(data.data) });
  },
  getdetail(e){
    let bookid = e.currentTarget.id;
    if (bookid == "" || bookid==0){
      return false;
    }
    wx.navigateTo({ url: '/pages/detail/detail?bookid=' + bookid });
  }
})