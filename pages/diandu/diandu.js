var app = getApp();
Page({
  onLoad(e) {
    this.setData({ id: e.id })
    this.getinfo();
  },
  onReachBottom() {
    if (this.data.nomore === true) {
      return false
    }
    this.setData({ page: this.data.page + 1, bottomload: false });
    this.getlist();
  },
  data: {
    page: 1,
  },
  getinfo() {
    let json = app.token({ brand_id: this.data.id });
    app.request('book/index/brand_info', 'POST', json, 'getinfob', this);
  },
  getinfob(data) {
    console.log(JSON.stringify(data))
    this.setData({ info: data.data });
    this.getlist();
  },
  getlist() {
    let json = app.token({ brand_id: this.data.id, page: this.data.page });
    app.request('book/index/brand_series_list', 'POST', json, 'listb', this);
  },
  listb(data) {
    this.setData({ bottomload: true })
    if (data.code != 200) {
      return false
    }
    if (data.data.length < 10) {
      this.setData({ nomore: true });
    }
    if(data.data.length>0){
      data.data.forEach((item)=>{
        item.img_medium = item.img_medium.split('@')[0];
      })
    }
    let list = (this.data.list || []).concat(data.data);
    this.setData({ list: list })
  },
  // series(e) {//去绘本详情页
  //   if (app.repeat(e.timeStamp) == false) { return; }
  //   let series = e.currentTarget.id;
  //   wx.navigateTo({//跳转到搜索结果页面
  //     url: '/pages/searchres/searchres?typearrindex=1&keywords=' + series
  //   })
  // },
  series(e) {
    wx.navigateTo({ url: '/pages/index/series/series?series=' + e.currentTarget.id })
  },
  login() {
    wx.navigateTo({ url: '/pages/login/login' });
  },
  //  跳转到点读笔详情界面
  goPay: function () {
    wx.navigateTo({ url: '/pages/diandu/detail/detail?product_id='+this.data.info.product_id});
  }
})