
Page({
  onLoad(){
    let lists = wx.getStorageSync('bookorder');
    this.setData({ lists: lists});
  },
  getdetail(e) {//去绘本详情页
    let bookid = e.currentTarget.id;
    let date = this.data.date;
    wx.navigateTo({ url: '/pages/detail/detail?bookid=' + bookid + '&date=' + date });
  }
})