var json1 = require('../../json/json1.js');
var app=getApp();
Page({
  onPullDownRefresh() {//下拉刷新
    wx.stopPullDownRefresh();
    wx.showNavigationBarLoading();
    setTimeout(()=>{
      wx.hideNavigationBarLoading()    
    },1000);
    //page归0，列表清空，隐藏到底提示
    this.setData({ page: 0, bottomend: false, lists: [],books:[],bottomload: true});
    this.reqhot();
    this.reqbook();
    this.series();
  },
  onLoad(e){
    if (e.channel){
      let json = {
        channel: e.channel,
        date:new Date().getTime()
      }
      wx.setStorageSync("channel",json);
    }
    let date = app.setdate(5);
    wx.setStorageSync("date", date);
    wx.showShareMenu({
      withShareTicket: true
    });
    this.setData({ icons: json1.icons});
    this.reqhot();
    this.reqbook();
    this.banner();
    this.mr();
    this.jiang();
    this.diandu();
    this.series();
  },
  onShow(){
      //设置可选时间范围
     let date = wx.getStorageSync('date');//选中的日期    
     //let jystartdate=app.setdate(5);
     //let _date = app.checkday(date, jystartdate);//判断本地日期是否可用    
     //let jyenddate=app.setdate(30);
     let jydate = date.split('-');
     jydate = jydate[1] + '月' + jydate[2]+'日';
     this.setData({ date: date,jydate: jydate});
     this.getMinMaxDays();  
     //登陆之后，没登陆不执行
     let token=wx.getStorageSync('token');
     if(token===''){return false;}
     let user_id=wx.getStorageSync('userdata').user_id;
     app.getshelfnum();//更新书架数量
     
  }, 
  getMinMaxDays(){
    app.request('book/index/getMinMaxDays', 'GET', '','getMinMaxDaysb',this)
  },
  getMinMaxDaysb(data){
    if(data.code!=200){return false}
    let jystartdate = app.setdate(data.data.min_days);
    let jyenddate = app.setdate(data.data.max_days);
    this.setData({ jystartdate: jystartdate, jyenddate: jyenddate})
  },
  onReachBottom(){//底部触发
    if (this.data.reqing != false) {//请求中，上次未加载完不许再加载
      return false;
    }
    if (this.data.bottomend == false) {
      this.setData({ bottomload: false, reqing:true});//显示loading图
      this.reqhot();//当前关键字的下一页
    }
  },
  data:{
    imgUrls:[
    ],
    swiper:{
      indicatorDots: true,
      indicatorColor: '#6ED14E',
      autoplay:true,
      circular:true
    },
    lists:[],
    books:[],
    bottomload: true,//loading图标,默认不显示
    bottomend: false,//某一类搜索到最后了 默认不显示
    page:0,//页数
    seriesList: [],   //出版方、作家、首页展示数组
  },
  banner(){
    let _this=this;

    app.request('index/banner/lists', 'POST', { platform: 'wx', place: 'index'},
        'bannerSuccess', _this);
    // wx.request({
    //   url: app.data.http + 'index/banner/lists',
    //   data: { platform: 'wx', place: 'index'},
    //   success(res){
    //   //  console.log(res.data)
    //     _this.setData({ imgUrls: res.data.data})
    //   }
    // })
  },
  bannerSuccess(res){
      //  console.log(res.data)
      this.setData({ imgUrls: res.data})
  },
  bindDateChange(e){//修改租赁日期
    let date =e.detail.value.split('-');
    this.setData({ jydate: date[1] + '月' + date[2] + '日', date:e.detail.value});
    wx.setStorageSync('date', e.detail.value);
  },
  gosearch(e){//去搜索
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateTo({
      url: '../search/search?startdate=' + this.data.jystartdate,
    })
  },
  reqhot(){//请求热门绘本
    this.setData({ page: this.data.page + 1 });
    let page = this.data.page;//页数+1
    let token = wx.getStorageSync('token');
    let user_id="";
    if (wx.getStorageSync('userdata').user_id){
      user_id = wx.getStorageSync('userdata').user_id;
    }
    let _this=this;

    app.request('book/index/recommend', 'GET', {page: page, token:token, user_id: user_id},
        'reqhotSuccess', _this);
  },
  reqhotSuccess(e){
    let data=e.data;
    if(e.code=="200"){
        if (data.length == 0) {//当前page没有结果
            this.setData({ bottomend: true });//显示到底了
        } else {//有结果
            if (data.length < 10) {//小于10条，下一页没有了
                this.setData({ bottomend: true });//显示到底了
            }
            let _lists = this.data.lists;
            data.forEach((item,index)=>[
                item.img_medium = item.img_medium.split('@')[0]
            ])
            _lists = _lists.concat(data);//数组合并
            this.setData({ lists: _lists });
        }
        this.setData({ bottomload: true, reqing: false})//隐藏loading,加载完成
    }
  },
  // 精选书单
  reqbook(){
    let _this = this;

    app.request('book/communitytwo/choiceness_book_list', 'POST', {},
        'reqbookSuccess', _this);
    // wx.request({
    //   url: app.data.http + 'book/communitytwo/choiceness_book_list',
    //   method: 'POST',
    //   data :{
    //   },
    //   success(e){
    //     let data = e.data;
    //     if (data.code == "200"){
    //       data.data.forEach((item)=>{
    //         item.book_info.forEach((e)=>{
    //           e.img_medium = e.img_medium.split('@')[0];
    //         })
    //       })
    //       _this.setData({books:data.data})
    //     }
    //   }
    // })
  },
  reqbookSuccess(e){
    let data = e.data;
    if (e.code == "200"){
        data.forEach((item)=>{
            item.book_info.forEach((e)=>{
                e.img_medium = e.img_medium.split('@')[0];
            })
        })
        this.setData({books:data})
    }
  },
  inshelf(e){//加入书架
    if (app.repeat(e.timeStamp) == false) { return; }
    let token = wx.getStorageSync('token');   
    let shelf = e.currentTarget.id;//0未加入书架，1已加入书架  
    if (token===""){//没登陆的
      wx.showToast({
        title: '请先登录',mask:true,icon:'none',duration:500
      })
      return false;
    }
    if (shelf==1){//已加入书架的
      this.outshelf(e);//此时必已登陆
      return false;
    }
    let shelfindex = e.currentTarget.dataset.index;
    this.setData({ shelfindex: shelfindex });//下标，加入书架成功后修改对应图标
    let book_id = e.currentTarget.dataset.book_id;//book_id;
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { book_ids: [book_id], token: token, user_id: user_id}
    app.request('book/user/addBookshelf', 'POST', json,'inshelfb',this);
  },
  inshelfb(data){//加入书架回调
    if(data.code==200){//加入成功
      wx.showToast({
        title: '加入成功',icon:"none"
      })
      let shelfindex = this.data.shelfindex;//下标
      let param={};//单个赋值法
      param['lists[' + shelfindex + '].is_shelf'] = 1;//加入书架成功后=1
      this.setData(param);
      app.shelftabbat(1);//更新书架tabbar数量
    }
  },
  outshelf(e){//移出书架
    let token = wx.getStorageSync('token');   
    let shelfindex = e.currentTarget.dataset.index;
    this.setData({ shelfindex: shelfindex });//下标，移出书架成功后修改对应图标
    let book_id = e.currentTarget.dataset.book_id;//book_id;
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { book_ids: book_id, token: token, user_id: user_id }
    app.request('book/user/delBookshelf', 'POST', json, 'outshelfb', this);
  },
  outshelfb(data){//移除回调
    if(data.code==200){
      wx.showToast({title: '移除成功',icon:'none'});
      let shelfindex = this.data.shelfindex;//下标
      let param = {};//单个赋值法
      param['lists[' + shelfindex + '].is_shelf'] = 0;//移出书架成功后=0
      this.setData(param);
      app.shelftabbat(-1);//更新书架tabbar数量
    }
  },
  getdetail(e){//去绘本详情页
    if (app.repeat(e.timeStamp) == false) { return; }
    let bookid = e.currentTarget.id;
    let date=this.data.date;
    wx.navigateTo({ url: '../detail/detail?bookid='+bookid+'&date='+date});
  },
  go(e){//选书
    if (app.repeat(e.timeStamp) == false) { return; }
    if (e.currentTarget.id==""){
      wx.showToast({ title: '频道暂未开通~', icon: 'none' });
    }
    let path =e.currentTarget.id;
    wx.navigateTo({ url: path})
  },
  getxinren(e) {//去新人礼包
    if (app.repeat(e.timeStamp) == false) { return; }
    let id =e.currentTarget.id;
    let item = this.data.imgUrls[id];
    if (item.wx_path === ""){//web-view页
      wx.setStorageSync('huodongsrc', item.h5_path);
      wx.navigateTo({ url: '/pages/index/huodong/huodong' })
    }
    else{//内部页面
      // if (wx.getStorageSync('token') === "" && item.wx_path !=="/pages/index/xinren/xinren?id=1"){
      //   wx.showToast({title:'请先登陆~',icon:'none',duration:700});
      //   return false;
      // }
      wx.navigateTo({ url: item.wx_path })
    }
  },
  getxinren2(){
    wx.navigateTo({url: '/pages/index/xinren/xinren?id=1',})
  },
  shiyong(){
    wx.navigateTo({ url: '/pages/home/shuoming/shuoming' })
  },
  shudan(e) {
    let id = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/jingxuan/jingxuan?id='+id })
  },
  onShareAppMessage: function(){
    return {
      title:"博鸟绘本，最新最全的儿童绘本租赁平台~",
      path:'/pages/shouye/shouye',
      success:function(){
        wx.showToast({
          title: '转发成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail:function(){
        wx.showToast({
          title: '转发失败',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },
  navigate(e){
    wx.navigateTo({url:e.currentTarget.id});
  },
  mr(){
    app.request('book/index/celebrity_list','POST',"",'mrb',this);
  },
  mrb(data){
    this.setData({mr:data.data});
  },
  mrlist(e){
    wx.navigateTo({ url:'/pages/celebritylist/celebritylist?id='+e.currentTarget.id})
  },
  jiang(){
    app.request('book/index/award_list','POST',"","jiangb",this);
  },
  jiangb(data){
    this.setData({jiang:data.data})
  }, 
  diandu() {
    app.request('book/index/brand_list', 'POST', "", "diandub", this);
  },
  diandub(data) {
    this.setData({ diandu: data.data })
  },
  award(e){
    wx.navigateTo({ url:'/pages/award/award?award_id='+e.currentTarget.id});
  },
  diandud(e){
    // if (e.currentTarget.id==2){
    //   wx.showToast({title:'敬请期待',icon:"none",duration:1000});
    //   return false
    // }
    wx.navigateTo({url:"/pages/diandu/diandu?id="+e.currentTarget.id});
  },

  //czy新增作家、名人、出版方模块
  series(){
    app.request('book/index/dimension_list_first', 'POST', { pagesize: 3 }, 'seriesSuccess', this);
  },
  seriesSuccess(res){
    console.log('1111111111111111111----->'+JSON.stringify(res))
    this.setData({
        seriesList: res.data
    })
  },
  toSeries(e){
    console.log(e)
    wx.navigateTo({url:"/pages/shouye/series/series?type="+e.currentTarget.dataset.type});
  },
  toCelebrity(e){
      console.log('id------------>'+e.currentTarget.dataset.id)
      console.log('name------------>'+e.currentTarget.dataset.name)
    wx.navigateTo({url:"/pages/celebritylist1/celebritylist1?id="+e.currentTarget.dataset.id+'&name='+e.currentTarget.dataset.name});
  }
})