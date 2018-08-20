var app = getApp();
Page({
  onLoad(e) {
    let searchbiaoqian = wx.getStorageSync('searchbiaoqian2');
    if (searchbiaoqian.length > 0) {
      this.setData({ searchbiaoqian: searchbiaoqian })
    }
    wx.showLoading({ title: '加载中...', })
    let search = wx.getStorageSync('search2');
    this.setData({ search: search});
    this.getbook();    
  },
  onShow(){
    app.getshelfnum(this);//借书架数量
    let num = wx.getStorageSync('shelfnum')
    this.setData({
        num: num
    })
  },
  onPullDownRefresh() {//下拉
    wx.stopPullDownRefresh();
    this.setData({
      searchbiaoqian: ['无勾选项'],
      page: 1,
      lists: [],
      bookids: [],
      bottomload: true, //loading图标,默认不显示
      bottomend: false, //某一类搜索到最后了 默认不显示
      nobook: false,   //没有结果？  默认false(有结果);
    })
    this.onLoad();
  },
  data: {
    searchbiaoqian: ['无勾选项'],
    page: 1,
    lists: [],
    bottomload: true, //loading图标,默认不显示
    bottomend: false, //某一类搜索到最后了 默认不显示
    nobook: false,   //没有结果？  默认false(有结果);
    num:0,
  },
  getbook() {//获取书
    let search=this.data.search;
    search.page = this.data.page;
    search.version = "2.0.1"; search.source = 4;
//    console.log(search)
    app.request('book/index/search', 'GET', search, 'getbookb', this)
  },
  getbookb(data) {//获取回调
    //    console.log(data);
    wx.hideLoading();//隐藏loading
    if (data.code != 200) {
      return false;
    }
    if (this.data.page == 1 && data.data.length == 0) {//没结果
      this.setData({ nobook: true });
      return false;
    }
    if (data.data.length < this.data.num) {//没有下一页了
      this.setData({ bottomend: true });
    }
    data.data.forEach((item, index) => {
      item.img_medium = item.img_medium.split('@')[0]  
      item.checked = true;
  })
    
    this.setData({ lists: data.data, bottomload: true, reqing: false });//隐藏loading,请求结束
  },
  checked(e) {
    let index = e.currentTarget.id;
    let lists = this.data.lists;
    let param = new Object();
    if (lists[index].checked != true) {
      param['lists[' + index + '].checked'] = true;
    } else {
      param['lists[' + index + '].checked'] = false;
    }
    this.setData(param);
  },
  huan(){//换一批
    this.setData({page:this.data.page+1})
    this.getbook();
  },
  add(e) {//添加到借书架
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.showToast({ title: '加入借书架...', icon: 'loading', mask: true })
    let token = wx.getStorageSync('token');
    if (token === "") {
      wx.navigateTo({ url: '/pages/login/login' });
      return false;
    }
    let bookids = new Array();
    this.data.lists.forEach((item, index) => {//查询已勾选的书
      if (item.checked == true) {
        bookids.push(item.book_id);
      }
    })
    this.setData({ _length: bookids.length })
    let user_id = wx.getStorageSync('userdata').user_id;
    app.request('book/user/addBookshelf', 'POST', { token: token, user_id: user_id, book_ids: bookids },
      'addb', this);
  },
  addb(data) {
    if(data.code!=200){
      wx.showToast({ title: data.msg, icon: 'none', duration: 800 });
      return false;
    }
    app.getshelfnum(this);//借书架数量
    wx.showToast({ title: '加入成功~', icon: 'none', duration: 800 });
    let _length = parseInt(this.data._length);
    app.shelftabbat(parseInt(_length));
      var that = this;
      setTimeout(function () {
          that.setData({
              num: app.globalData.box_num
          })
      },800)
  },
  detail(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    let bookid = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/detail/detail?bookid=' + bookid });
  },
  back(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateBack({ delta: 1 })
  },
  jieshujia(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.switchTab({ url: '/pages/shujia/shujia' })
  }
})