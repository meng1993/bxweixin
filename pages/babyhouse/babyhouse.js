var app = getApp();
Page({
  onLoad(e){
    if(e.from == "my"){
      this.setData({'from':"my"})
    }else{
      this.setData({ 'from': "find" })
    }
       
    this.getlist();
  },
  onPullDownRefresh(){
    wx.stopPullDownRefresh();
    this.setData({ nomore: false, page: 0,lists:[]});     
    this.getlist();
  },
  onReachBottom(){
    if(this.data.nomore){
      wx.showToast({title: '已显示全部',duration:700,icon:"none"})
      return false
    }
    this.getlist();
  },
  data:{
    lists:[],
    babylist:[{
      baby_nick: "", baby_birthday: "", baby_sex:"1"
    }],
    nobabyinfo:false,
    page : 0,
    nomore: false
  },
  babyinfo(){//宝贝信息
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { token: token, user_id: user_id }
    app.request('book/communitytwo/baby_list', 'POST', json, 'getinfob', this);
  },
  getinfob(data){
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    if (data.data&&data.data.length===0){
      this.setData({ nobabyinfo:true})
    }
  },
  all(e){//某订单全部展示
    let index = e.currentTarget.id;
    let params = {};
    params['lists['+index+'].all'] = !this.data.lists[index].all;
    this.setData(params)
  },
  getlist(){//宝贝列表
    wx.showLoading()
    this.setData({page:this.data.page+1})
    let json = {
      token : wx.getStorageSync('token'),
      user_id : wx.getStorageSync('userdata').user_id,
      page : this.data.page
    }
    app.request('book/communitytwo/baby_book_home', 'POST', json,'getlistb',this)
  },
  getlistb(data){   
    if(data.code!=200){
      wx.hideLoading()
      app.tishi('提示',data.msg);
      return false
    }
    if (this.data.page == 1 && data.data.length==0){
      wx.hideLoading();
      return false
    }   
    if (this.data.page == 1 && data.data.length != 0){//查看宝贝信息
      wx.hideLoading();
      this.babyinfo();
    }
    if (data.data.length<10){
      this.setData({nomore:true});
    }
    data.data.forEach((item)=>{
      item.all = false //全显示||显示四个
      item.rent_start_time = app.shijianchuo(item.rent_start_time);
      item.books.forEach((i)=>{ //默认不勾选
        i.checked = false;
        i.img_medium = i.img_medium.split('@')[0];
      })
    })
    let lists = this.data.lists;
    lists = lists.concat(data.data);
    this.setData({ lists: lists});
    wx.hideLoading();
  },
  checked(e){//勾选|取选
    if(this.data.from === 'my'){
      let bookid = e.currentTarget.dataset.bookid;
      wx.navigateTo({ url: '/pages/detail/detail?bookid=' + bookid });
      return false
    }
    let index1 = e.currentTarget.id;
    let index2 = e.currentTarget.dataset.index;
    let params = {};
    params['lists['+index1+'].books['+index2+'].checked'] = !this.data.lists[index1].books[index2].checked;
    this.setData(params);
  },
  queding() {//确定按钮，弹窗
    let checkedarr=new Array();
    let length = this.data.lists.length;
    for (let i = 0; i < length;i++){
      for(let j=0;j<this.data.lists[i].books.length;j++){
        if (this.data.lists[i].books[j].checked){
          checkedarr.push(this.data.lists[i].books[j])
        }
      }
    }
    if (checkedarr.length===0){
      wx.showToast({title: '您未勾选',icon:'none',duration:800})
      return false;
    }
//    console.log(checkedarr)
    this.setData({ look: true, month: new Date().getMonth() + 1, day: new Date().getDate(), checkedarr: checkedarr})
  },
  quxiao2() {
    this.setData({ look: false })
  },
  zudang(){},
  beizhu(e){
    this.setData({beizhu:e.detail.value});
  },
  tijiao(){//提交
    let date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate();
    let beizhu = this.data.beizhu || "";
    let sign_list = [];
    this.data.checkedarr.forEach((item)=>{
      sign_list.push({book_id:item.book_id,img:"","type":"order"})
    }) 
    let json={
      date: date, remark: beizhu, sign_list: sign_list,
      token:wx.getStorageSync('token'),
      user_id:wx.getStorageSync('userdata').user_id
    }
    app.request('book/communitytwo/baby_sign_in','POST',json,"tijiaob",this)
  },
  tijiaob(data){
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    wx.showToast({title: data.msg,duration:1000})
    setTimeout(()=>{
      wx.navigateBack({ delta: 2 })
    },1000)
    
  },
  input(e){//宝贝信息
    let index = e.currentTarget.id;
    let value = e.detail.value;
    let params = {};
    params['babylist[' + index + '].baby_nick'] = value;
    this.setData(params);
  },
  bindDateChange(e) {//宝贝信息
    let index = e.currentTarget.id;
    let value = e.detail.value;
    let params = {};
    params['babylist[' + index + '].baby_birthday'] = value;
    this.setData(params);
  },
  radioChange(e) {//宝贝信息
    let index = e.currentTarget.id;
    let value = e.detail.value;
    let params = {};
    params['babylist[' + index + '].baby_sex'] = value;
    this.setData(params);
  },
  add(){//+宝贝组
    let params = {baby_nick: "", baby_birthday: "", baby_sex: "1"}
    let babylist = this.data.babylist;
    babylist.push(params);
    this.setData({ babylist: babylist})
  },
  save(){//保存宝贝信息
    let babylist = this.data.babylist;
    for (let i = 0; i < babylist.length;i++){
      if (babylist[i].baby_nick === "" || babylist[i].baby_birthday === "") {
        app.tishi('提示', '请完善宝贝信息')
        return false
      }
    }     
    let json = {
      token : wx.getStorageSync('token'),
      user_id : wx.getStorageSync('userdata').user_id,
      baby_info : this.data.babylist
    }
    app.request('book/communitytwo/add_baby_info','POST',json,'savb',this)
  },
  savb(data){
    app.tishi('提示', data.msg);
    if(data.code!=200){     
      return false
    }
    this.setData({nobabyinfo : false})
  },
  quxiao(){
    this.setData({ nobabyinfo : false})
  },
  goshouye() {//去首页
    wx.switchTab({ url: '/pages/shouye/shouye' });
  }
})