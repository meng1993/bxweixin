var app=getApp();
Page({
  onLoad(e) {
    console.info(e);
    if(e.id){
        this.setData({card_id:e.id});
        wx.setStorageSync('pay-card-id', 0);
    }
  },
  onShow(){
    this.setData({ onshow: this.data.onshow+1});
    let token = wx.getStorageSync('token');
    if (token === "") {
      if(this.data.onshow===1){//第一次onShow
        wx.navigateTo({ url: '/pages/login/login' })
      }else{
        wx.navigateBack({delta:1})
      }     
    } else {
      wx.showLoading();
      this.setData({ checked: '', price: 0.00, yajin: 0.00, jianyajin:""})
      this.getcard();
    }
  },
  data:{
    checked:'',
    price:0.00,
    yajin:0.00,
    jianyajin:"",
    onshow:0
  },
  getcard(){
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    app.request('book/card/index', 'POST', { token: token, user_id: user_id,version:'2.0.2'},'getcardb',this)
  },
  getcardb(data){
    wx.hideLoading();
    if(data.code!=200){return false}
    let arr = data.data.card;
    let lists1=new Array();//小博士
    let lists2=new Array();//小状元
    let num = 0;
    arr.forEach((item, index) => {
      if (item.rank == 4) {//小博士无限次
        item.rank_id = num;
        lists1.push(item);
        num++;
      }
    });
    lists1[lists1.length-1].rank_last = true;
    num = 0;
    arr.forEach((item,index)=>{
      if (item.rank==2){//小博士普通
        item.rank_id = num;
        lists1.push(item);
        num++;
      }
    });
    lists1[lists1.length - 1].rank_last = true;
    num = 0;
    arr.forEach((item, index) => {
      if (item.rank == 1) {//小状元普通
        item.rank_id = num;
        lists1.push(item);
        num++;
      }
    });
    lists1[lists1.length - 1].rank_last = true;
    this.setData({ lists1: lists1});
    console.log('list1-------->'+JSON.stringify(this.data.lists1))
    this.zhima();
  },
  zhima() {
    let user_id = wx.getStorageSync('userdata').user_id;
    app.request('index/zhima/getUserZMScore', 'POST', { user_id: user_id }, 'zhimab', this)
  },
  zhimab(data) {
    if (data.data.status == 0 || data.data.status == 2) {
      this.setData({ jianyajin: "0" });
        this.buyHuodong();
      return false
    }
    if (data.data.zmscore >= 600) {
      this.setData({ jianyajin:"1"})
      for (let i = 0; i < this.data.lists1.length;i++){
        let param=new Object();
        param['lists1[' + i + '].olddeposit'] = this.data.lists1[i].deposit;
        param['lists1[' + i +'].deposit']=0;       
        this.setData(param)
      }
      // for (let i = 0; i < this.data.lists2.length; i++) {
      //   let param = new Object();
      //   param['lists2[' + i + '].olddeposit'] = this.data.lists2[i].deposit;
      //   param['lists2[' + i + '].deposit'] = 0;
      //   this.setData(param)
      // }
    }
    this.buyHuodong();
  },
  checkcard(e){
      let index =e.currentTarget.id;
    if (this.data.checked == index && this.data.listsc == 'lists1'){
      let param = new Object();
      param['lists1['+index+'].checked']=false;
      this.setData(param);
      this.setData({ checked: "" ,price:0.00,yajin:0.00});//取选已选项
      return false
    }  
    let lists=this.data.lists1;        
    let param = new Object();
    if (this.data.checked != "") {//取消旧的
      param[this.data.listsc+'[' + this.data.checked + '].checked'] = false;
      this.setData(param);
    }
    param = new Object();//新选中的item
    param['lists1[' + index + '].checked'] = true;
    this.setData(param);
    let price = parseFloat(lists[index].price);
    let yajin = parseFloat(lists[index].deposit);
    if (!lists[index].olddeposit){
      lists[index].olddeposit = lists[index].deposit;
    }
    this.setData({ checked: index, price: price, yajin: yajin,listsc:'lists1',
      olddeposit: lists[index].olddeposit});//新选中的下标
  },
  checkcard2(e) {
    let index = e.currentTarget.id;
    if (this.data.checked == index && this.data.listsc =='lists2') {
      let param = new Object();
      param['lists2[' + index + '].checked'] = false;
      this.setData(param);
      this.setData({ checked: "", price: 0.00, yajin: 0.00 });//取选已选项
      return false
    }
    let lists = this.data.lists2;
    let param = new Object();
    if (this.data.checked != "") {//取消旧的
      param[this.data.listsc + '[' + this.data.checked + '].checked'] = false;
      this.setData(param);
    }
    param = new Object();//新选中的item
    param['lists2[' + index + '].checked'] = true;
    this.setData(param);
    let price = parseFloat(lists[index].price);
    let yajin = parseFloat(lists[index].deposit);
    this.setData({ checked: index, price: price, yajin: yajin, listsc: 'lists2',
      olddeposit: lists[index].olddeposit});//新选中的下标
  },
  youhuijuan(e) {//查优惠卷
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let goods_type = e;
    let json = { token: token, userId: user_id, goods_type: e, "type": 1 }
    app.request('index/coupon/userCoupon', 'POST', json, 'youhuijuanb', this);
  },
  youhuijuanb(data) {
    if (data.code != 200) {
      return false;
    }
//    console.log(data);
    for (let i = 0; i < data.data.length; i++) {
      let name = app.couponttype(data.data[i].goods_type);
      data.data[i].name = name;
    }
  },
  buy(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    if(this.data.checked==""){return false}
    let token=wx.getStorageSync('token');
    if (token===""){return}
    let card=this.data.lists1;
    if(this.data.listsc=='lists2'){
      card = this.data.lists2;
    }
    wx.setStorageSync('buycard', card[this.data.checked]);
    wx.navigateTo({ url: '/pages/home/paycard/paycard?jianyajin=' + this.data.jianyajin})
  },
  gozm(e) {//去芝麻信用页
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.redirectTo({ url: '/pages/home/zhima/zhima' })
  },
  shuoming(){
    wx.navigateTo({url: '/pages/home/shuoming2/shuoming2'})
  },
  shuoming3() {
    wx.navigateTo({ url: '/pages/home/shuoming3/shuoming3' })
  },
  buyHuodong: function () {
      if(this.data.card_id===undefined || this.data.card_id == wx.getStorageSync('pay-card-id')){
        return;
      }
      wx.setStorageSync('pay-card-id', this.data.card_id);
      for(var key in this.data.lists1){
        console.info(this.data.lists1[key])
        if(this.data.card_id== this.data.lists1[key].card_id){
            this.setData({checked:key});
            this.buy({});
            break;
        }
      }
  }
})