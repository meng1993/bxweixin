var app = getApp();
Page({
  onLoad(e) {
    this.setData({ series: e.series });
    wx.setNavigationBarTitle({ title: "系列-" + e.series });
    this.gethot();
  },
  onShow() {
    app.getshelfnum(this);//借书架数量
    let num = wx.getStorageSync('shelfnum')
    this.setData({
        num: num
    })
  },
  onPullDownRefresh() {//下拉刷新
    wx.stopPullDownRefresh();
    //page归0，列表清空，隐藏到底提示
    this.setData({ page: 1, bottomend: false, lists: [], bottomload: true });
    this.gethot();
  },
  onReachBottom() {//底部触发
    if (this.data.reqing != false) {//请求中，上次未加载完不许再加载
      return false;
    }
    if (this.data.bottomend == false) {
      this.setData({ bottomload: false, reqing: true, page: this.data.page + 1 });//显示loading图
      this.gethot();//当前关键字的下一页
    }
  },
  data: {
    icon_id: 0,
    lists: [],
    page: 1,
    bottomload: true,//loading图标,默认不显示
    bottomend: false,//某一类搜索到最后了 默认不显示
    num:0
  },
  gethot() {//获取列表
    let date = wx.getStorageSync('date');
    let token = wx.getStorageSync('token');
    let series = this.data.series;
    app.request('book/index/seriesDetails', 'GET', { page: this.data.page, start_date: date, series: series,
    user_id:wx.getStorageSync('userdata').user_id || "",token: token || "" }, 'gethotb', this)
  },
  gethotb(data) {//列表回调
   console.log('列表--------------->'+JSON.stringify(data));
    if (data.code != 200) {
      return false
    }
    if (data.data.length == 0) {//当前page没有结果
      this.setData({ bottomend: true });//显示到底了
    } else {//有结果
      if (data.data.length < 10) {//小于10条，下一页没有了
        this.setData({ bottomend: true });//显示到底了
      }
      let _lists = this.data.lists;
      data.data.forEach((item, index) => {
        item.checked = true;
        item.img_medium = item.img_medium.split('@')[0]
      })
      _lists = _lists.concat(data.data);//数组合并
      this.setData({ lists: _lists });
    }
    this.setData({ bottomload: true, reqing: false })//隐藏loading,加载完成
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
  inshelf(e) {//加入书架
    if (app.repeat(e.timeStamp) == false) { return; }
    let token = wx.getStorageSync('token');
    let shelf = e.currentTarget.id;//0未加入书架，1已加入书架  
    if (token === "") {//没登陆的
      wx.showToast({
        title: '请先登录', mask: true, icon: 'none', duration: 500
      })
      return false;
    }
    if (shelf == 1) {//已加入书架的
      this.outshelf(e);//此时必已登陆
      return false;
    }
    let shelfindex = e.currentTarget.dataset.index;
    this.setData({ shelfindex: shelfindex });//下标，加入书架成功后修改对应图标
    let book_id = e.currentTarget.dataset.book_id;//book_id;
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { book_ids: [book_id], token: token, user_id: user_id }
    app.request('book/user/addBookshelf', 'POST', json, 'inshelfb', this);
  },
  inshelfb(data) {//加入书架回调
    if (data.code == 200) {//加入成功
      wx.showToast({
        title: '加入成功', icon: "none"
      })
      let shelfindex = this.data.shelfindex;//下标
      let param = {};//单个赋值法
      param['lists[' + shelfindex + '].is_shelf'] = 1;//加入书架成功后=1
      this.setData(param);
      this.setData({ num: parseInt(this.data.num) + 1 });//借书架+1
      app.shelftabbat(1);//更新书架tabbar数量
    }
  },
  outshelf(e) {//移出书架
    let token = wx.getStorageSync('token');
    let shelfindex = e.currentTarget.dataset.index;
    this.setData({ shelfindex: shelfindex });//下标，移出书架成功后修改对应图标
    let book_id = e.currentTarget.dataset.book_id;//book_id;
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { book_ids: book_id, token: token, user_id: user_id }
    app.request('book/user/delBookshelf', 'POST', json, 'outshelfb', this);
  },
  outshelfb(data) {//移除回调
    if (data.code == 200) {
      wx.showToast({ title: '移除成功', icon: 'none' });
      let shelfindex = this.data.shelfindex;//下标
      let param = {};//单个赋值法
      param['lists[' + shelfindex + '].is_shelf'] = 0;//移出书架成功后=0
      this.setData(param);
      this.setData({ num: parseInt(this.data.num) - 1 });//借书架+1
      app.shelftabbat(-1);//更新书架tabbar数量
    }
  },
  getdetail(e) {//去绘本详情页
    if (app.repeat(e.timeStamp) == false) { return; }
    let bookid = e.currentTarget.id;
    let date = wx.getStorageSync('date');
    wx.navigateTo({ url: '/pages/detail/detail?bookid=' + bookid + '&date=' + date });
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
    let _this = this;
    this.data.lists.forEach((item, index) => {//查询已勾选的书
      if (item.checked == true) {
        let param = {};//改变状态
        param['lists[' + index + '].is_shelf'] = 1;
        _this.setData(param);
        bookids.push(item.book_id);//加入书架的数组
      }
    })
    this.setData({ _length: bookids.length })
    let user_id = wx.getStorageSync('userdata').user_id;
    if (bookids.length == 0) {
      wx.showToast({ title: '您未勾选绘本~', icon: 'none', duration: 800 });
      return false
    }
    app.request('book/user/addBookshelf', 'POST', { token: token, user_id: user_id, book_ids: bookids },
      'addb', this);
  },
  addb(data) {
    if (data.code != 200) {
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
  jieshujia(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.switchTab({ url: '/pages/shujia/shujia' })
  }
})