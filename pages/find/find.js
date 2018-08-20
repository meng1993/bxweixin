let app = getApp();
Page({
  onLoad(){    
    this.jilu();
    wx.showLoading({ mask: true });
    setTimeout(() => {
      wx.hideLoading();
    }, 500)  
  },
  onShow(e){ 
    let token = wx.getStorageSync('token');
    if (token === "") { 
      this.setData({ login: false, index: this.data.index + 1 });
      if (this.data.index == 1) {
        wx.navigateTo({ url: '/pages/login/login' })
      }
      return false
    }
    this.info();
    let _this = this;
    setTimeout(()=>{
      _this.setData({ hadedit:0})
    },500)
    if(this.data.login===false){
      this.jilu();
    }
    let y = new Date().getFullYear();
    let m = new Date().getMonth() + 1 < 10 ? "0" + (new Date().getMonth() + 1) : new Date().getMonth() + 1;
    let d = new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate();
    let x = new Date().getDay();
    this.setData({
      month: m, year: y, day: d,login: true,
      toyear: y, tomonth: m, today: d,xingqi:x
      });
    this.xingqi();
    this.cangshu();
    this.headinfo();
  },

  onReachBottom() {
    if (this.data.nomore || this.data.hadedit===1){
      return false;
    }
    this.setData({page:this.data.page+1});
    this.jilu();
  },
  data:{
    kong:[],
    days:['日','一','二','三','四','五','六'],
    lists:[],
    look:false,
    index:0,
    showdate: false,
    showbook:true,
    changem:false,
    page:1,
    face:"/img/shouye/head.png"
  },
  info() {
    let userdata = wx.getStorageSync('userdata');
    this.setData({ face: userdata.face });
  },
  jilu(){
    let json = app.token({page:this.data.page});
    app.request("book/communitytwo/baby_sign_detail_list",'POST',json,'jilub',this);
  },
  jilub(data){
    if(data.code!=200){
      return false
    }
    if (data.data.length <10){
      this.setData({ nomore: true });
    }
    this.setData({jilulist:(this.data.jilulist||[]).concat(data.data)});
  },
  headinfo(){
    let json={user_id:wx.getStorageSync('userdata').user_id}
    app.request('book/communitytwo/baby_read_statistic', 'POST', json,'headinfob',this)
  },
  headinfob(data){
    this.setData({headinfo:data.data})
  },
  xingqi(){  
    
    //首日对应星期
    let a = new Date();
    let a_year = this.data.year;
    let a_yue = this.data.month;
    console.log('a_year-------->'+a_year)
    console.log('a_yue-------->'+a_yue)
    if(parseInt(a_yue)<10){
      a_yue = "0"+a_yue
    }
    let b = new Date((a_year + '-' + a_yue+'-01').replace(/-/g, "/"));// y-m-d m=当前月数
    let b_xingqi=b.getDay();
    console.log('b_xingqi--------->'+b_xingqi)
    let array=new Array();
    for (let i = 0; i < b_xingqi; i++) {
      array.push(i);
    } 
    this.setData({kong:array});
      console.log('data---kong--------->'+array)
    //当前月份天数
    let c = new Date(a_year, a_yue, 0).getDate();// y,m,d m-1=实际月数
    let array2 = new Array();
    for(let i=0;i<c;i++){     
      if(this.data.month==this.data.tomonth&&i>parseInt(this.data.today)-1){
        array2.push({ had: "0" })//had:1没打卡，2正常打卡，3补打，4今天，0不可打日期
      }else{
        let maxbuday = app.setdate(-30).split('-')[2];
        let tday = parseInt(this.data.today)+40;
        let mi = i;
        if(this.data.year==this.data.toyear){
          if (this.data.month == this.data.tomonth && mi + 1 < this.data.today && mi + 1 > this.data.today - 10) {
            array2.push({ had: "1" })
          } else if (this.data.month == this.data.tomonth - 1 && mi + 31 > tday) {
            array2.push({ had: "1" })
          }else{
            array2.push({ had: "0" })
          }
        }else{
          array2.push({ had: "0" })
        }       
      }
    }
    this.setData({dates:array2});
    let json = {
      token:wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata') ? wx.getStorageSync('userdata').user_id:"",
      date:this.data.year+'-'+this.data.month
    }
    app.request('book/communitytwo/baby_sign_list','POST',json,'infob',this);
    // if (this.data.month != this.data.tomonth|| this.data.year != this.data.toyear){
    //   return false;
    // }
    // let params = new Object();
    // let json2 = { had: "3" }
    // let date = new Date().getDate();
    // params['dates[' + (date - 1) + ']'] = json2;
    // this.setData(params);
  },
  infob(data){
    if (data.code != 200) {
      app.tishi("提示", data.msg);
      return false
    }
    let dates=this.data.dates;
    let _this = this;
    if (_this.data.tomonth == _this.data.month && _this.data.year == _this.data.toyear) {//今天         
      let params = new Object();
      params['dates[' + (parseInt(_this.data.today) - 1) + '].had'] = "4";
      _this.setData(params)
    }
    data.data.forEach((item)=>{
        let params = new Object();
        let json = { id: item.id, day: item.day, date: item.date}     
        if (item.type ==="normal"){//正常
            json.had = "2";
        } else if (item.type ==="repair"){//补打       
            json.had = "3";
        }
        params['dates[' + (parseInt(item.day) - 1) + ']'] = json;
        _this.setData(params);
        if (parseInt(item.day) === parseInt(_this.data.today) && parseInt(_this.data.tomonth) === parseInt(_this.data.month) && parseInt(_this.data.year) === parseInt(_this.data.toyear)){
          _this.setData({ today_signin:true});
        }
    })      
    if(data.data.length===0){
      this.setData({ changem:true });
    }
    this.setData({yiqiandays:data.data.length})
  },
  reducemonth() {//前月份
    let m = parseInt(this.data.month);
    if (m <= 1) {
      this.setData({ month: 12, year: this.data.year - 1 });
    } else {
      this.setData({ month: m - 1 < 10 ? "0" + (m - 1) : m - 1});
    }
    this.xingqi();
  },
  addmonth() {//后月份
    let m = parseInt(this.data.month);
    if (m >= parseInt(this.data.tomonth)&&this.data.year>=this.data.toyear){
      return false;
    }
    if (m >= 12) {
      this.setData({ month: 1, year: this.data.year + 1 });
    } else {
      this.setData({ month: m + 1 < 10 ? "0" + (m + 1) : m + 1});
    }
    this.xingqi();
  },
  detail(e){
    if (e.currentTarget.dataset.had === "1" || e.currentTarget.dataset.had ==="4"){//补打
      let date = this.data.year + '-' + this.data.month + '-' + (e.currentTarget.dataset.index+1);
      wx.navigateTo({ url: '/pages/shuwu/shuwu?from=find&date=' + date });
      return false;
    }
    let plan_id =e.currentTarget.id||false;
    if (!plan_id){
      return false;
    }
    this.setData({ day:e.currentTarget.dataset.day||""});
    let json={
      token: wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id,
      plan_id: plan_id
    }
    app.request('book/communitytwo/baby_sign_detail', 'POST', json,'detailb',this,);
    this.setData({ delid: plan_id, deldate: e.currentTarget.dataset.date})
  },
  detailb(data){
    if (data.code != 200) {
      app.tishi("提示", data.msg);
      return false
    }
    data.data.sign_info.forEach((item)=>{
      item.img = item.img.split('@')[0];
    })
    this.setData({ look: true, dayimgs: data.data.sign_info, remark: data.data.remark});
  },
  del(e){
    let date = e.currentTarget.id ? e.currentTarget.dataset.date : this.data.deldate;
    let min = new Date(app.setdate(-10)).getTime();
    let thisdate = new Date(date).getTime();
    if (thisdate < min) {
      wx.showToast({ title: "限删10天内", duration: 800, icon: "none" });
      return false
    }
    let _this = this;
    let plan_id = e.currentTarget.id ? e.currentTarget.id : this.data.delid;
    
    wx.showModal({
      title: '提示',
      content: '删除' + date+'打卡记录？',
      success(res){
        if(res.confirm){
          let json = {
            token: wx.getStorageSync('token'),
            user_id: wx.getStorageSync('userdata').user_id,
            plan_id: plan_id,
            date: date
          }
          app.request('book/communitytwo/baby_sign_delete', 'POST', json, 'delb', _this);
          _this.setData({ deltype: e.currentTarget.dataset.type, delindex: e.currentTarget.dataset.index||""})
        }
      }
    })    
  },
  refresh(){
    this.setData({ today_signin: false, look:false,jilulist:null,nomore:false,page:1});
  },
  delb(data){
    if(data.code==200){
      wx.showToast({ title: data.msg, duration: 800, mask: true })
      if(this.data.deltype==="date"){//日期列表
        this.refresh();
        this.onShow();
        this.jilu();
      } else if (this.data.deltype === "jilu"){//打卡记录列表
        this.onShow();
        this.setData({ today_signin: false, look: false});
        let list = this.data.jilulist;
        list.splice(this.data.delindex,1);
        this.setData({ jilulist: list});
      }   
    }
  },
  quxiao(){
    this.setData({ look:false})
  },
  daka(){
    let date = this.data.toyear + '-' + this.data.tomonth + '-' + this.data.today;
    wx.navigateTo({url: '/pages/shuwu/shuwu?from=find&date='+date});
  },
  babyhouse(){
    wx.navigateTo({ url: "/pages/shuwu/shuwu?from=my" })
  },
  jingxuan(){
    let user_id = wx.getStorageSync('userdata').user_id || "";
    app.request('book/communitytwo/recommend_book_list','POST',{user_id:user_id},'jingxuanb',this)
  },
  jingxuanb(data){
    if(data.code!=200){
      app.tishi("提示",data.msg);
      return false
    }
    let lists = this.data.lists;
    data.data.forEach((item)=>{
      item.img_medium = item.img_medium.split('@')[0];
    })
    lists = lists.concat(data.data)
    this.setData({ lists: lists })
  },
  getdetail(e) {//去绘本详情页
    if (app.repeat(e.timeStamp) == false) { return; }
    let bookid = e.currentTarget.id;
    if (bookid!=0&&bookid!=""){
      wx.navigateTo({ url: '../detail/detail?bookid=' + bookid });
      return false
    }
    let src = e.currentTarget.dataset.src;
    let arr = [];
    for (let i = 0; i < this.data.dayimgs.length;i++){
      arr.push(this.data.dayimgs[i].img);
    }
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: arr// 需要预览的图片http链接列表
    })
  },
  login(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateTo({ url: '/pages/login/login' })
  },
  buzhou(){
    wx.navigateTo({url: '/pages/find/buzhou/buzhou',})
  },
  showdate(){
    this.setData({ showdate: !this.data.showdate})
  },
  cangshu(){
    let json = {
      token: wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id,
    }
    app.request('book/communitytwo/get_shuwu_num','POST',json,'cangshub',this);
  },
  cangshub(data){
    this.setData({ cangshu: data.data.all_book})
  },
  share(e){
    //wx.showToast({ title: "功能暂未开发", duration: 800, icon: "none" })
     wx.navigateTo({ url:"/pages/group/savephoto/savephoto?from=find&id="+e.currentTarget.id})
  },
  edit(e) {
    let date = e.currentTarget.id ? e.currentTarget.dataset.date : this.data.deldate;
    let id = e.currentTarget.id ? e.currentTarget.id : this.data.delid;
    let min = new Date(app.setdate(-10)).getTime();
    let thisdate = new Date(date).getTime();
    if (thisdate < min){
      wx.showToast({ title: "可编辑10天内记录", duration: 800, icon: "none" });
      return false
    }
    wx.navigateTo({ url: "/pages/find/record/record?id=" + id + '&date=' + date});
  },
  wish(){
    wx.navigateTo({ url: "/pages/find/editwish/editwish"});
  }
})