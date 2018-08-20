var app = getApp();
Page({
  onLoad(e){
    this.setData({"from":e.from});
    let shuwupaixu = wx.getStorageSync('shuwupaixu');
    if (shuwupaixu!==""){
      this.setData({ paixuname: shuwupaixu.a, "type": shuwupaixu.id});
    }
    if(e.date){
      this.setData({ date:e.date});
    }    
    if(e.edit){
      this.setData({ edit: 1 });
      this.hadin();
    }
    if (e.beforefenlei) {
      this.setData({ del: 1, del_add: 1, beforefenlei: e.beforefenlei, fenlei: 0, fenleititle: decodeURIComponent(e.fenleititle)});
      this.refresh();
      if (e.from == "find" && e.copycheckeds) {
        this.setData({ copycheckeds: JSON.parse(decodeURIComponent(e.copycheckeds)) });
        this.clearcheckeds();
      }
    }else{
      this.list();
    }
  },
  onShow(){
    this.cangshu();  
    if(this.data.fenleititle&&this.data.fenleititle!==0){
      wx.setNavigationBarTitle({ title: "书屋-" + this.data.fenleititle })
    }else{
      wx.setNavigationBarTitle({ title: "书屋" })
    }  
    if(this.data.del===1&&this.data.del_add===1){
      wx.setNavigationBarTitle({ title: "书屋" })
    }
  },
  onReachBottom(){
    if (this.data.nomore){
      if(this.data.tishi===0){
        wx.showToast({
          title: '已显示全部~', icon: "none", duration: 700
        })
        this.setData({tishi:1})
      }    
      return false;
    }    
    this.setData({ page: this.data.page + 1 });
    this.list();
  },
  data:{
    page :1,
    "type":"sign_time",//4-1
    read_flag:"",//3-1
    list:"",
    keyword:"",
    titles: [{ a: '全部', b: "" }, { a: '读过', b: "readed" }, { a: '未读过', b: "notread" }],
    _index:0,
    checkeds:[],
    paixuname:"按阅读打卡时间",
    tishi:0,
    allnum:-1,
    search:true,
    fenlei:0,//0-全部，非0-有分类
    del:0,//0-浏览模式，1-删除模式
    del_add: 0,//0-删除模式 1-添加模式
  },
  list(){
    //wx.showLoading({mask:true});
    let json = {
      token:wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id,
      page:this.data.page,
      keyword: this.data.keyword||"",
      "type":this.data.type,
      read_flag: this.data.read_flag,
      cate_id: this.data.fenlei===0?"":this.data.fenlei
    }
    app.request('book/communitytwo/baby_shuwu','POST',json,'listb',this);
  },
  listb(data){
    //wx.hideLoading();
    if(data.code!=200){
      app.tishi('提示',data.msg);
      return false;
    }
    if(this.data.page===1&&data.data.length===0){     
      this.setData({ list: [], nomore: true});
      return false
    }
    if(data.data.length<12){
      this.setData({nomore:true});
    }
    let checkeds = this.data.checkeds;
//    console.log(checkeds)
    data.data.forEach((res)=>{
      res.bid = res.book_id===""?res.user_study_id:res.book_id;
      res.bname = res.book_id === "" ?"user_study_id" : "book_id";
      res.checked = false;
      checkeds.forEach((item)=>{        
         if(res.bid == item[res.bname]){          
           res.checked = true;
         }
      })
    })
    ;
    this.setData({ list: (this.data.list === "" ? [] : this.data.list).concat(data.data)});  
  },
  paixu(id,name) {
    this.setData({ "type": id, keyword: "", paixuname:name});
    this.refresh();
  },
  search(value){
    this.setData({ keyword: value, "type": this.data.type, read_flag:"",_index:0});
    this.refresh();
  },
  refresh(){
    this.setData({list:"",page:1,nomore:false,tishi:0});
    this.list();   
  },
  searchadd(){
    //wx.showToast({ title: "暂未开放", icon: "none", duration: 800, mask: true })
    wx.navigateTo({ url:"/pages/shuwu/search/search"})
  },
  cam(){
    var _this = this;
    wx.scanCode({
      scanType: ['barCode', 'qrCode'],
      success(res) {
        wx.showLoading({ title: '识别中...' });
        let cate_id = _this.data.fenlei;
        let json = {
          token: wx.getStorageSync('token'),
          user_id: wx.getStorageSync('userdata').user_id,
          code: res.result,
          merchant: 90,
          cate_id: cate_id === 0 ? "" : cate_id
        }
        app.request('book/Isbnstudy/book', 'POST', json, 'camb', _this)
      }
    })
  },
  camb(data){
    wx.hideLoading();
    if(data.code!=200){
      wx.showToast({ title: data.msg, icon:"none",duration:1000,mask:true})
    }else{
      wx.showToast({ title: "添加书屋成功~", icon: "success", duration: 1000, mask: true });
      //this.paixu("shuwu_time");
      this.setData({ "type": "shuwu_time", keyword: ""});
      this.refresh();
    }
  },
  pai(){
    wx.navigateTo({url:'/pages/shuwu/paixu/paixu?id=' + (this.data.type === "" ? "sign_time" : this.data.type)});
  },
  detail(e){
    if (e.currentTarget.id === "" || e.currentTarget.id ==="dyMPwy_bKYk"){
      return false;
    }
    wx.navigateTo({ url: '/pages/detail/detail?bookid=' + e.currentTarget.id})
  },
  change(e){
    let id = e.currentTarget.id;
    let _index = e.currentTarget.dataset.index;
    this.setData({ _index: _index, keyword: "", read_flag:id });
    this.refresh();
  },
  checked(e){
    let index = e.currentTarget.id;
    let list = this.data.list;
    let book_id = list[index].book_id;
    let user_study_id = list[index].user_study_id;
    let checkeds = this.data.checkeds;
    let had = 0;
    if (list[index].checked ===false){//选中
      checkeds.forEach((item) => {
        if ((book_id != "" && item.book_id === book_id) || (item.user_study_id == user_study_id &&
          user_study_id != "")) {
          had = 1;
        }
      })
      if (had === 0) {
        checkeds.push(list[index]);      
      }
    }else{//取选
      for (let i = 0; i < checkeds.length;i++){
        if ((book_id != "" && checkeds[i].book_id === book_id) || (checkeds[i].user_study_id == user_study_id &&
          user_study_id != "")) {
          checkeds.splice(i,1);
        }
      }
    }
    this.setData({ checkeds: checkeds});
    let params = {};
    params['list[' + index + '].checked'] = !list[index].checked;
    this.setData(params);
  },
  add(){
    wx.setStorageSync("cate_id","");
    wx.navigateTo({ url:"/pages/shuwu/add/add?add=1"});
  },
  add2() {
    wx.setStorageSync("cate_id", this.data.fenlei);
    wx.setStorageSync("cate_title", this.data.fenleititle);
    wx.navigateTo({ url: "/pages/shuwu/add/add?add=2" });
  },
  queren(){
    if(this.data.checkeds.length===0){
      return false;
    }
    this.setData({ queren:true});
  },
  quxiao2(){
    this.setData({ queren: false });
  },
  beizhu(e){
    this.setData({beizhu:e.detail.value});
  },
  remove(e){
    let index = e.currentTarget.id;
    let checkeds = this.data.checkeds;
    let list = this.data.list;
    let b_id = checkeds[index].book_id === "" ? checkeds[index].user_study_id : checkeds[index].book_id;
    let b_name = checkeds[index].book_id === "" ? "user_study_id" : "book_id";
    let params = {};
    for(let i=0;i<list.length;i++){
      if (list[i][b_name]===b_id){
        params['list[' + i +'].checked'] = false;
        this.setData(params);
      }
    }
    checkeds.splice(index,1);
    this.setData({ checkeds: checkeds});
    if (checkeds.length===0){
      this.setData({ queren: false });
    }
  },
  tijiao() {//提交
    // let date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate();
    let date = this.data.date;
    let beizhu = this.data.beizhu || "";
    let sign_list = [];
    this.data.checkeds.forEach((item) => {
      sign_list.push({ book_id: item.book_id, user_study_id: item.user_study_id ,
        img: item.img, "type": item.book_id === "" ? "photograph" :"order" })
    })
    if (sign_list.length>20){
      wx.showToast({ title: "最多可选20本~", duration: 800 });
      return false;
    }
    let json = {
      date: date, remark: beizhu, sign_list: sign_list,
      token: wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id
    }
    app.request('book/communitytwo/baby_sign_in', 'POST', json, "tijiaob", this)
  },
  tijiaob(data) {
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    let page = getCurrentPages()[getCurrentPages().length-2];
    page.onShow();
    page.refresh();
    page.jilu();
    wx.showToast({ title: data.msg, duration: 1000 })
    setTimeout(() => {
      wx.navigateBack({ delta: 1 })
    }, 1000)
  },
  shoudong(){
    wx.navigateTo({url:"/pages/shuwu/cam/cam"});
  },
  cangshu() {
    let json = {
      token: wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id,
      cate_id: this.data.fenlei === 0 ? "" : this.data.fenlei
    }
    app.request('book/communitytwo/get_shuwu_num', 'POST', json, 'cangshub', this);
  },
  cangshub(data) {
    if(data.code!=200){
      return false
    }
    let titles = this.data.titles;
    titles[0].a = "全部(" + data.data.all_book+")";
    titles[1].a = "读过(" + data.data.readed + ")";
    titles[2].a = "未读过(" + data.data.not_read + ")";
    this.setData({ titles: titles});
    // if (this.data.allnum !== data.data.all_book || this.data.allnum === -1){
    //   this.refresh();
    //   this.setData({ allnum: data.data.all_book})
    // }
  },
  hadin(){
    let page = getCurrentPages()[getCurrentPages().length - 2];
    let dayimgs = page.data.dayimgs;   
    this.setData({ checkeds: dayimgs, hadarr: dayimgs});
  },
  edit(){
    let checkeds = this.data.checkeds;
    let hadarr = this.data.hadarr;
    let length = 0;
    if (checkeds.length === hadarr.length){
      checkeds.forEach((res) => {
        hadarr.forEach((item) => {
          if ((res.book_id !== "" && res.book_id === item.book_id) || res.user_study_id == item.user_study_id) {
            length++;
            return false;
          }
        })
      })
    }    
    if (length === hadarr.length && hadarr.length!==0){
      wx.navigateBack({ delta: 1 });
      return false
    }
    if (checkeds.length > 20) {
    wx.showToast({ title: "最多勾选20本", icon: "none", duration: 800, mask: true });
      return false;
    }
    let page = getCurrentPages()[getCurrentPages().length - 2];
    page.setData({ dayimgs: checkeds, imgchange :1});
    wx.navigateBack({delta : 1});
  },
  golocus(e){
    let book = this.data.list[e.currentTarget.id];    
    wx.navigateTo({ url: "/pages/shuwu/creative/creative?id=" + book.book_id + '&uid=' + book.user_study_id+
    '&num='+book.daka_num});
  },
  search(){
    this.setData({ search: false });
  },
  back(){
    this.setData({ search: true });
    this.setData({ keyword:'' });
    this.refresh();    
  },
  searchbook(e){
    if (e.detail.value == "") {
      wx.showToast({ title: "请输入关键字", icon: "none", duration: 700 });
      return false
    }
    wx.pageScrollTo({scrollTop: 0, duration: 0});
    this.setData({ keyword: e.detail.value });
    this.refresh();
  },
  del(){//删除|取消删除按钮
    this.setData({del:1-this.data.del});
    if (this.data.del === 1){//删除模式
      this.setData({del_add:0});
    }
    if(this.data.del===0){//取消
      if(this.data.from==="my"){
        this.clearcheckeds();
      }
      else if (this.data.from === "find"){
        this.setData({checkeds : this.data.copycheckeds});
      }
    }
    if (this.data.del === 0&&this.data.del_add===1){//分类加书
      this.setData({ fenlei: this.data.beforefenlei });
      wx.setNavigationBarTitle({ title: "书屋-" + this.data.fenleititle })
      this.refresh();
    }
  },
  fenlei(){
    wx.navigateTo({url:"/pages/shuwu/fenlei/fenlei"});
  },
  clearcheckeds(){//清空已选书
    this.setData({ checkeds : []});
    let list = this.data.list;
    if(list.length===0){
      return false;
    }
    list.map(item => item.checked = false);
    this.setData({list:list});
  },
  deltrue(){//确认删除
    let user_study_id_list = [];
    let checkeds = this.data.checkeds;
    if (checkeds.length === 0) {
      return false
    }
    checkeds.forEach((item) => {
      user_study_id_list.push(item.user_study_id)
    })
    let cate_id = this.data.fenlei === 0 ? "" : this.data.fenlei;
    let json = app.token({ cate_id: cate_id, user_study_id_list: user_study_id_list });
    app.request('book/communitytwo/user_study_book_delete', 'POST', json, 'deltrueb', this);
  },
  deltrueb(data){
    if (data.code != 200) {
      wx.showToast({ title: data.msg, icon: "none", duration: 1000 });
      return false
    }
    this.setData({ del: 0 });//变回浏览模式
    this.clearcheckeds();
    this.refresh();
    this.cangshu();  
  },
  addfenlei(){//分类加书模式
    this.setData({ del: 1, del_add: 1, beforefenlei: this.data.fenlei, fenlei: 0, });
    this.refresh();
  },
  addinfenlei(){//确认加书进分类
    let user_study_id_list = [];
    let checkeds = this.data.checkeds;
    if (checkeds.length===0){
      return false
    }
    checkeds.forEach((item)=>{
      user_study_id_list.push(item.user_study_id)
    })
    let json = app.token({ cate_id: this.data.beforefenlei, user_study_id_list: user_study_id_list});
    app.request('book/communitytwo/shuwu_to_cate_insert', 'POST', json,'addinfenleib',this);
  },
  addinfenleib(data){
    if(data.code!=200){
      wx.showToast({ title: data.msg, icon: "none", duration: 1000});
      return false
    }
    wx.showToast({ title: data.msg, icon: "success", duration: 1000 });
    wx.setNavigationBarTitle({ title: "书屋-" + this.data.fenleititle })
    this.setData({ del: 0, fenlei: this.data.beforefenlei});//变回浏览模式,分类改回加书前
    this.clearcheckeds();
    this.refresh();
    this.cangshu();
  }
})