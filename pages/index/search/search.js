var app = getApp();
Page({
  onLoad(e){
    if (e.from && e.from == '智能') {
      wx.setNavigationBarTitle({ title: '智能选书' })
    }
    let searchbiaoqian = wx.getStorageSync('searchbiaoqian');
    if (searchbiaoqian.length>0){
      this.setData({ searchbiaoqian: searchbiaoqian })
    }
    wx.showLoading({title: '加载中...',})
    this.getbook();
  },
  onShow(){
    app.getshelfnum(this);//借书架数量
    // console.log(this.data.book_num)
      let num = wx.getStorageSync('shelfnum')
      this.setData({
          num: num
      })

  },
  onPullDownRefresh (){//下拉
    wx.stopPullDownRefresh();
    this.setData({
      searchbiaoqian: this.data.searchbiaoqian,
      page: 1,
      lists: [],
      bookids:[],
      checkall: false,
      bottomload: true, //loading图标,默认不显示
      bottomend: false, //某一类搜索到最后了 默认不显示
      nobook: false,   //没有结果？  默认false(有结果);
      })
    this.getbook();
  },
  onReachBottom() {//上拉
    if (this.data.reqing!=false){//请求中
      return false;
    }
    if (this.data.bottomend == false) {
      this.setData({ bottomload: false,page:this.data.page+1,reqing:true});//显示loading图
      this.getbook();//当前关键字的下一页
    }
  },
  data:{
    searchbiaoqian:['无勾选项'],
    page:1,
    lists:[],
    checkall: false,
    bottomload: true, //loading图标,默认不显示
    bottomend: false, //某一类搜索到最后了 默认不显示
    nobook: false,   //没有结果？  默认false(有结果);
    num:0,
    condition:"0"
  },
  changecondition(e){
    this.setData({ condition: e.currentTarget.id, page: 1, nobook: false, lists: [], bottomload: true,
      bottomend: false});
    this.getbook();
  },
  getbook(){//获取书
    let search = wx.getStorageSync('search');
    search.page=this.data.page;
    search.page_number= 16;
    search.version = "2.0.1";
    search.source=4;
    search.order_method = this.data.condition;
    console.log(search)
    app.request('book/index/search', 'GET', search,'getbookb',this)
  },
  getbookb(data){//获取回调
  //  console.log(data);
    wx.hideLoading();//隐藏loading
    if(data.code!=200){
      return false;
    }   
    if (this.data.page==1&&data.data.length==0){//没结果
      this.setData({ nobook:true});
      return false;
    }
    if (data.data.length <16){//没有下一页了
      this.setData({ bottomend:true});
    }
    let lists = this.data.lists;
    data.data.forEach((item, index) => [
      item.img_medium = item.img_medium.split('@')[0]
    ])
    lists=lists.concat(data.data);
    
    this.setData({ lists: lists, bottomload: true, reqing: false,checkall :false});//隐藏loading,请求结束
  },
  checked(e){
    let index = e.currentTarget.id;
    let lists=this.data.lists;
    let param = new Object();
    if (lists[index].checked!=true){
      param['lists['+index+'].checked']=true;
    }else{
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
      this.setData({num:parseInt(this.data.num)+1});//借书架+1
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
      this.setData({ num: parseInt(this.data.num) - 1 });//借书架-1
      app.shelftabbat(-1);//更新书架tabbar数量
    }
  },
  add(e){//添加到借书架
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.showToast({title: '加入借书架...',icon:'loading',mask:true})
    let token=wx.getStorageSync('token');
    if(token===""){
      wx.navigateTo({url: '/pages/login/login'});
      return false;
    }
    let bookids=new Array();
    let _this=this;
    this.data.lists.forEach((item,index)=>{//查询已勾选的书
      if (item.checked==true){
        let param={};//改变状态
        param['lists[' + index +'].is_shelf']=1;
        _this.setData(param);
        bookids.push(item.book_id);//加入书架的数组
      }
    })
    this.setData({ _length: bookids.length})
    let user_id=wx.getStorageSync('userdata').user_id;
    if (bookids.length==0){
      wx.showToast({ title: '您未勾选绘本~', icon: 'none', duration: 800 });
      return false
    }
    app.request('book/user/addBookshelf', 'POST', { token: token, user_id: user_id, book_ids: bookids},
    'addb',this);
  },
  addb(data){
    console.log('11111111___________>'+JSON.stringify(data))
    if(data.code!=200){
      wx.showToast({ title: data.msg, icon: 'none', duration: 800 });
      return false;
    }
    app.getshelfnum(this);//借书架数量
    wx.showToast({title: '加入成功~',icon:'none',duration:800});
    let _length = parseInt(this.data._length);
    app.shelftabbat(parseInt(_length));
  },
  getdetail(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    let bookid=e.currentTarget.id;
    wx.navigateTo({url: '/pages/detail/detail?bookid='+bookid});
  },
  back(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateBack({delta:1})
  },
  jieshujia(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.switchTab({url: '/pages/shujia/shujia'})
  },
  checkall(e){
    let lists = this.data.lists;
    let checkall = this.data.checkall;  
    if(checkall==false){
      lists.forEach((item, index) => {
        let param = {};
        param['lists[' + index + '].checked'] = true;
        this.setData(param);
      })
      this.setData({ checkall: true });
    }else{

      lists.forEach((item, index) => {
        let param = {};
        param['lists[' + index + '].checked'] = false;
        this.setData(param);
      })
      this.setData({ checkall: false });
    }
  }
})