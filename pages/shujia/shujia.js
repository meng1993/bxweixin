var app=getApp();
var json1=require('../../json/json1.js');
Page({
  onLoad(){
  },
  onShow(){
    //登陆之后
    let token = wx.getStorageSync('token');
    if (token === "") {//判断登陆状态
      this.setData({ login: false,});    
      this.setData({index:this.data.index+1});
      if (this.data.index==1){
        wx.navigateTo({ url: '/pages/login/login' })
      }
      
      return false; 
    }else{//登陆了
      if (this.data.login===false){
        this.setData({ login: true });
        wx.showLoading({ title: '加载中...' });
        this.getshelf();//获取列表
      }     
      this.shelfnum();
      app.getshelfnum();//更新书架数量
    }
    this.getMinMaxDays();
    let date = wx.getStorageSync('date');//选中的日期
    let jystartdate = app.setdate(5);//可选初始日期
    let _date = app.checkday(date, jystartdate);//判断本地日期是否可用    
    let _jydate = _date.split('-');//借阅开始时间
    let jydate = _jydate[1] + '月' + _jydate[2] + '日';
    let jymaxdate = this.jymaxdate(_jydate[1], _jydate[2]);//借阅结束时间
    this.setData({
      date: _date,jydate: jydate, jymaxdate: jymaxdate
    }); 
  },
  onPullDownRefresh() {//下拉
    wx.stopPullDownRefresh();
    this.onShow();
  },
  data: {
    lists: [],
    max: 15,
    listload: false,//onload时默认不显示无书提示
    selected: 0,
    checkall: false,
    editstate: '1',//编辑状态，‘1’表示正常状态，‘2’表示编辑状态
    page: 1,
    havemore: true,//每页30本，可以加载更多
    index:0,
    book_num:-1,
    login:false
  },
  onReachBottom() {//底部加载
    if (this.data.reqing != false||this.data.havemore==false) {//请求中||没有更多了
      return false;
    }
      this.setData({ reqing: true });//显示loading图,请求中
      this.setData({page:this.data.page+1});
      this.getshelf();
  },
  shuaxin(){
    this.setData({ page: 1, lists: [], listload: false, checkall: false,
      editstate: '1', havemore: true, selected: 0
    });
    wx.showLoading({ title: '加载中...' });
    this.getshelf();//获取列表
  },
  shelfnum(){
    let json = app.token({});
    app.request('book/user/bookShelfNum', 'POST', json,'shelfnumb',this);
  },
  shelfnumb(data){
    if(data.code!=200){
      return false
    }
    if (data.data.book_num !== this.data.book_num && this.data.book_num!==-1){
      this.shuaxin();
    }
    this.setData({ book_num:data.data.book_num});
  },
  getMinMaxDays() {
    app.request('book/index/getMinMaxDays', 'GET', '', 'getMinMaxDaysb', this)
  },
  getMinMaxDaysb(data) {
    if (data.code != 200) { return false }
    let jystartdate = app.setdate(data.data.min_days);
    let jyenddate = app.setdate(data.data.max_days);
    this.setData({ jystartdate: jystartdate, jyenddate: jyenddate })
  },
  getshelf(){//获取列表
    if(this.data.havenore == false){//没有更多了
      wx.showToast({title: '没有更多了',icon:'none'});
      return false;
    }
    let json={
      user_id: wx.getStorageSync('userdata').user_id,
      token: wx.getStorageSync('token'),
      page:this.data.page,
      page_number:30,
      start_date: wx.getStorageSync('date')
    }
//    console.log(this.data.page)
    app.request('book/user/bookshelf', 'GET', json,'getshelfb',this);
  },
  getshelfb(data){//获取列表回调
  wx.hideLoading();
    if(data.code!=200){
      if(data.code==300){//登陆态失效，重新登陆
        app.relogin();
      }
      return false;
    }   
    if (data.data.length==0){
      this.setData({havemore:false})//没有更多了
      this.setData({ reqing: false, listload: true })//无书提示可以显示，可以继续上拉加载
      return false;
    } else if (data.data.length < 30){
      this.setData({ havemore: false })//没有更多了
    }
    let _lists = this.data.lists;
    data.data.forEach((item, index) => [
      item.img_medium = item.img_medium.split('@')[0]
    ])
    _lists = _lists.concat(data.data);  
    this.setData({ lists: _lists,});
    this.setData({ reqing: false, listload: true })//无书提示可以显示，可以继续上拉加载
  },
  jymaxdate(m,d){//借阅结束时间，借阅时间+30天
    d=parseInt(d);
    m=parseInt(m);
    let date =new Date();
    // date.setMonth(m);//加1之后的，正常数
    // date.setDate(d+30);
    // let month = date.getMonth();//不需要再+1了

    //  huange
      date.setMonth(m-1);//加1之后的，正常数
      date.setDate(d);
      date.setTime(date.getTime()+86400000*30)
      let month = date.getMonth()+1;//不需要再+1了
    //  huange


    let day = date.getDate();
    if (month < 10) { month = "0" + month};
    if (day < 10) { day = "0" + day};
    return month + '月' + day + '日';
  },
  bindDateChange(e) {//修改租赁日期
    let date = e.detail.value.split('-');
    let jydate = date[1] + '月' + date[2] + '日';//借阅开始时间
    let jymaxdate = this.jymaxdate(date[1], date[2]);//借阅结束时间
    this.setData({ date: e.detail.value, jydate: jydate, jymaxdate: jymaxdate });
    wx.setStorageSync('date', e.detail.value);
  },
  checked(e){
    let checked = e.currentTarget.dataset.checked;//选中状态
    let index = e.currentTarget.id;//数组下标
    let selected = this.data.selected;//已选数量
    let listslength = this.data.lists.length;//书架里书的数量
    if (checked==undefined||checked==false){//未选标记成已选     
      if (selected >= this.data.max && this.data.editstate=="1"){//标准状态大于最大可选数,跳出
        app.tishi('提示', '每次最多不超过15本');
        return false;
      }
      let param = {};//改变选中状态
      param['lists[' + index + '].checked'] = true;
      this.setData(param);
      this.setData({ selected: this.data.selected + 1 });//已选数+1       
      if (selected + 1 >= listslength) {//全选了
        this.setData({ checkall: true });
      }   
    } else if (checked == true) {//已选标记成未选
      let param = {};//改变选中状态
      param['lists[' + index + '].checked'] = false;
      this.setData(param);
      this.setData({ selected: this.data.selected - 1 });//已选数+1
      if (selected - 1 < listslength) {//全选了
        this.setData({ checkall: false });
      }
    }
  },
  checkall(){//全选
    let checkall = this.data.checkall;  
    if (checkall==false){//尝试全选，当前未全选
      let listslength = this.data.lists.length;//书架里书的数量
        if (this.data.editstate=='2'){//编辑状态，全部可选
          this.data.lists.forEach((item, index) => {//循环，全变成已选
            let param = {};
            param['lists[' + index + '].checked'] = true;
            this.setData(param);
          })
          this.setData({ checkall: true, selected: listslength });//勾选全选按钮,已选数赋值=数组长度
        } else if(this.data.editstate == '1'){//正常状态，已借完的不可选
          // if (listslength > this.data.max) {//书架里的书大于最大可借值,跳出
          //   app.tishi('提示', '每次最多不超过10本');
          //   return false;
          // }
          this.data.lists.forEach((item, index) => {//循环，全变成已选
            if(item.has_stock==0){//已借完，不选，跳出当此循环
              listslength--;
              return; //只跳出当此循环，不终止整个循环
            }
            let param = {};
            param['lists[' + index + '].checked'] = true;
            this.setData(param);
          })
          this.setData({ checkall: true, selected: listslength });//勾选全选按钮,已选数赋值=数组长度
        } 
    } else if (checkall==true){
      this.data.lists.forEach((item, index) => {//循环，全变成未选
        let param = {};
        param['lists[' + index + '].checked'] = false;
        this.setData(param);
      })
      this.setData({ checkall: false, selected: 0 });//取消全选按钮,已选数赋值=0
    }
  },
  edit(){//编辑按钮，更改编辑状态
    if(this.data.editstate=="1"){
      this.setData({ editstate:"2"});
    }else{//编辑状态改为常规状态
      this.setData({ editstate: "1" });
    }
    this.setData({ checkall: true });//切换状态取消全选
    this.checkall();
  },
  borrow(e){//借阅 
    if (app.repeat(e.timeStamp) == false) { return; }
    let lists = [];
    this.data.lists.forEach((item, index) => {//循环，全变成已选
      if(item.checked == true){
        lists.push(item);
      }
    })
    // if(lists.length==0){
    //   wx.showToast({title: '您未选任何图书',icon:'none'});
    //   return false;
    // }
    // if(lists.length < 3){
    //     wx.showModal({
    //       title: '提示',
    //       content: '您所选绘本少于3本不划算，确认下单吗？',
    //       cancelText: "取消",
    //       confirmText: "确定",
    //       success(res){
    //         if(res.confirm){
    //           wx.setStorageSync('bookorder', lists);
    //           wx.navigateTo({ url: '../shelf/orderinfo/orderinfo', })
    //         }
    //       }
    //     })
    // }
    if(lists.length == 0){
      wx.showToast({ title: '您未选任何图书', icon: 'none' });
    } else if (lists.length < 3 && lists.length > 0)
    {
      wx.showModal({
        title: '提示',
        content: '绘本少于三本，无法下单！',
        cancelText: "取消",
        confirmText: "确定",
        showCancel: false,
        success(res) {
          if (res.confirm) {
            // wx.setStorageSync('bookorder', lists);
            // wx.navigateTo({ url: '../shelf/orderinfo/orderinfo', })
          }
        }
      })
    } 
    else if (lists.length > this.data.max)
    {
      app.tishi('提示', '每次最多不超过15本');
    }
    else{
      wx.setStorageSync('bookorder', lists);
      wx.navigateTo({ url: '../shelf/orderinfo/orderinfo', })
    }
    
  },
  shanchu(e){//删除按钮
    if (app.repeat(e.timeStamp) == false) { return; }
    let _this=this;
    wx.showModal({
      title: '提示',
      content: '确定要删除绘本吗？',
      success(res){
        if(res.confirm){//确定删除
          let token=wx.getStorageSync('token');
          let user_id = wx.getStorageSync('userdata').user_id;
          let book_ids = [];
          //let listslength = _this.data.lists.length;//书架里书的数量
          _this.data.lists.forEach((item, index) => {//循环数组
            if (item.checked == true) {//该书已勾选
              book_ids.push(item.book_id);//id添加到要删除的数组
            }
          });
          let json={
            token: token, user_id: user_id, book_ids: book_ids
          }
          app.request('book/user/delBookshelf','POST',json,'shanchub',_this);
        }
      }
    })    
  },
  shanchub(data){//删除回调
    if(data.code!=200){return false};
    wx.showToast({title: '删除成功',icon:'none'});
    let lists = [];
    let dellength = this.data.lists.length;
    this.data.lists.forEach((item, index) => {//循环数组
      if (item.checked == false || item.checked == undefined) {//某书未勾选
        lists.push(item);//添加到lists
        dellength--;
      }
    });
    if (lists.length===0){
      this.setData({page:1});
      this.getshelf();
    }
    this.setData({ lists: lists, selected: 0, editstate: '1', checkall: false });
    app.shelftabbat(-dellength);//tabbar
  },
  login(e) {//去登陆
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateTo({ url: '../login/login' })
  },
  goshouye(){//去首页
    wx.switchTab({ url: '../shouye/shouye'});
  },
  godetail(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    let bookid = e.currentTarget.id;
    let date = this.data.date;
    wx.navigateTo({ url: '../detail/detail?bookid=' + bookid + '&date=' + date });
  }
})