var app=getApp();
Page({
  data: {
    book_dimension_id: '',      //首页传过来的id值
    book_dimension_info: '',    //系列信息对象
    book_dimension_list: [],    //系列数组
  },
  onLoad: function (options) {
    console.log(options.type)
    this.setData({
      book_dimension_id: options.type
    });
    this.getMessage()
  },
  onShow: function () {
    // this.setTitle();
  },
  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
  
  },
  // 页面上拉触底事件的处理函数
  onReachBottom: function () {
  
  },
  getMessage(){
      // let token=wx.getStorageSync('token');
      // let user_id=wx.getStorageSync('userdata').user_id;
      //书筐中书的总数
    app.request('book/index/dimension_list_second', 'POST', { page: 1,pagesize: 10,book_dimension_id: this.data.book_dimension_id },
        'getMessageSuccess', this);
  },
  getMessageSuccess(res){
    console.log(JSON.stringify(res))
    this.setData({
      book_dimension_info: res.data.book_dimension_info,
      book_dimension_list: res.data.item_list
    });
    wx.setNavigationBarTitle({
        title: res.data.book_dimension_info.name
    })
  },
  login(){
      wx.navigateTo({url:'/pages/login/login'});
  },
  //  全部加入书筐
  addBoxAll(e){
      if(wx.getStorageSync('token')===""){
          this.login();
          return false;
      }
    console.log('index------->'+e.currentTarget.dataset.index)
      var index = e.currentTarget.dataset.index
      var list = this.data.book_dimension_list
      list[index]['allin'] = 1;

      this.setData({
          cIndex: e.currentTarget.dataset.index,
          book_dimension_list: list
      })
      let book_id = e.currentTarget.dataset.ids;//book_ids;
      let user_id = wx.getStorageSync('userdata').user_id;
      let token=wx.getStorageSync('token');
      let json = { book_ids: book_id, token: token, user_id: user_id }
      app.request('book/user/addBookshelf', 'POST', json, 'addBoxAllSuccess', this);

  },
  addBoxAllSuccess(res){
    wx.showToast({
        title: res.msg, icon: "none",duration:700
    })
    console.log('666666666-------------->'+JSON.stringify(res))
  },
//    查看更多
  toCelebrity(e){
      wx.navigateTo({url:"/pages/celebritylist1/celebritylist1?id="+e.currentTarget.dataset.id+'&name='+e.currentTarget.dataset.name});
  },
//    跳转绘本详情
  toDetail(e){
      wx.navigateTo({url:"/pages/detail/detail?bookid="+e.currentTarget.dataset.id});
  }
})