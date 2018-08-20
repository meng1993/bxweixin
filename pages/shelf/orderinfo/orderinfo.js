var app = getApp();
Page({
  onLoad(){
    app.judgelogin();
    let lists=wx.getStorageSync('bookorder');
    console.log(lists)
    this.setData({ lists: lists});
    let bookids = new Array();
    for (let i = 0; i < lists.length; i++) {
      bookids.push(lists[i].book_id)
    }
    this.setData({bookids: bookids});
    this.getmycards();
    wx.showLoading({ title: '加载中...'})
    this.oneaddress('','1');
    this.getorder();
    this.youhuijuan();//获取优惠卷


  },
  onShow(){
      if(!this.data.youhuitext){
          this.youhuijuan();
      }
    this.zhigouzujin()
    this.zhima()

    this.cardDate()
  },
  data:{
    addressid:0,//收货地址id
    address:{},
      youhuitext:'',
    yunfei:0,//运费
    zujin:0,//租金
    yajin:0,
    cardid:0,//会员卡号
    havecard:false,//有无会员卡
    youhuiprice:0,//优惠价格
    haveyouhui:false,//有没有优惠卷
    hadyouhui:false,//选没选优惠卷
    coupon_no:'',//优惠券编号
    message:'',//留言
    jianyajin:"",
   // chazujinyajin:false //是否查询过直购租金押金
    eggNum: 0,    //使用鸟蛋个数
    myEggNum: 0,  //我的鸟蛋总数
    switchType: false,  //是否开启鸟蛋
    switchType2: false, //是否开启会员卡
    leaseDay: 30,       //不使用会员卡时租期30天、使用会员卡时、租期为会员卡的lease_day
    leaseDayText:"共计30天",   //租期text
    effectiveCard: 0,           //有效会员卡数
    hasCheck: false,            //多张可用卡时，有没有手动选过卡
  },
  oneaddress(id = '', moren = '0') {//收获地址
    if(id==-1){
      this.setData({ address: {}, addressid: 0});
      return false
    }
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { token: token, userId: user_id, id: id, is_default: moren }
    app.request('index/User/userAddressInfo', 'POST', json, 'oneaddressb', this);
  },
  oneaddressb(data) {//地址回调
      console.log('1111111111111------------>moren'+JSON.stringify(data))
    if(data.code!=200){//没有默认地址找一下上次用的地址
      let token = wx.getStorageSync('token');
      let user_id = wx.getStorageSync('userdata').user_id;
      let json = { token: token, user_id: user_id};
      app.request('book/card/defaultAddress', 'POST', json,'oneaddressb',this);
      return false;
    }   
    if (data.data.default_address){//没有默认地址，上次购买用的地址
      this.setData({ address: data.data.default_address, 
      addressid: data.data.default_address.address_id});
      return false;
    }
    if (data.data.service_area){return false}//300,走的上次购买地址回调
    this.setData({ address: data.data.addressList, addressid: data.data.addressList.id});
  },
  checkaddress(e){//跳到地址列表
    if (app.repeat(e.timeStamp) == false) { return; }
    let id=e.currentTarget.id;
    wx.navigateTo({ url: '/pages/home/addresslist/addresslist?id='+id })
  },
  zhima() {//芝麻信用
    let user_id = wx.getStorageSync('userdata').user_id;
    app.request('index/zhima/getUserZMScore', 'POST', { user_id: user_id }, 'zhimab', this)
  },
  zhimab(data) {//芝麻信用
    wx.hideLoading();
    if (data.data.status == 0 || data.data.status == 2) {
      this.setData({ jianyajin: "0" })
      return false
    }
    if (data.data.zmscore >= 600) {
      this.setData({ jianyajin: "1", yajin: 0 })
    }
   // this.setData({chazujinyajin:true});
    console.log('押金---------------->' + this.data.yajin)
  },
  getmycards(){//会员卡
    let token=wx.getStorageSync('token');
    let user_id=wx.getStorageSync('userdata').user_id;
    let book_num=this.data.lists.length;
    let json={
      token: token,
      user_id: user_id,
      book_num: book_num,
      version: '2.0.1'
    }
    app.request('book/user/myValidCards', 'GET', json,'getmycardsb',this);
  },
    //获取会员卡
  getmycardsb(data){
      this.setData({
          effectiveCard: data.data.cards_num,       //有效会员卡数量
      })
    wx.hideLoading();
    if(data.code!=200){      
      app.tishi('提示',data.msg);
      return false;
    }
    let cards = data.data.cards;
    let book_num = this.data.lists.length;
    if (!data.data.cards_num || (data.data.cards_num&&data.data.cards_num == 0)){//没有可用计划||没卡
      this.setData({ jihuashu: 0 });
      if (cards&&cards.length > 0) {//有卡，都不可用
        this.setData({ jihuashu: 1, cardname: cards[0].name + "(暂不可用)" });
      }
      this.zhigouzujin();//获取直接购买租金
      this.youhuijuan();//获取优惠卷
      this.zhima();//获取芝麻信用
      return false;
    }
    else if (data.data.cards_num == 1){//只有一张可用
        this.setData({ jihuashu: 1, cardname: cards[0].name, cardid: cards[0].user_card_id, havecard: true,leaseDay:cards[0].lease_day,leaseDayText:"共计"+cards[0].lease_day+"天"});
        //jjjjjjjj
        this.setData({
            yajin: 0,
            zujin: 0,
            eggNum: 0
        });
        // 如果只有一张可用，开启会员卡开关
        this.changeSwitch2({currentTarget:{dataset:{id: 0}}})
    }
    else if (data.data.cards_num > 1){//多张可用会员卡
      if (book_num > 10){//大于10本，勾选上可用计划
        this.setData({ jihuashu: 1, cardname: cards[0].name, cardid: cards[0].user_card_id, havecard: true,leaseDay: cards[0].lease_day,leaseDayText:"共计"+cards[0].lease_day+"天"});
        return false;
      }
      this.setData({ jihuashu: 1, cardname: data.data.cards_num+'张可选',  havecard: false});
      this.zhigouzujin();//获取直接购买租金
      this.youhuijuan();//获取优惠卷
      this.zhima();//获取芝麻信用
        // 如果多张可用，开启会员卡开关
        this.changeSwitch2({currentTarget:{dataset:{id: 0}}})
    }
  },
  chosecard(e){//多种计划，去选择
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateTo({url: '/pages/home/mycard/mycard?from=orderinfo' })
  },
  chosecardb(cardid,name,day,leaseDayText){//回调，会员卡号赋值
    if (cardid==0){//不使用会员计划
      this.setData({ cardname: name, cardid: 0, havecard: false,leaseDayText:leaseDayText});
     // if (this.data.chazujinyajin==false){//之前没查过就查一下租金押金
        wx.showLoading();
        this.zhigouzujin();//获取直接购买租金
        this.youhuijuan();//获取优惠卷
        this.zhima();//获取芝麻信用
      //}
    }else{
      this.setData({ cardname: name, cardid: cardid, havecard: true,zujin:0,switchType: false,leaseDay: day,leaseDayText:leaseDayText,switchType2:true});
      this.cardDate();
    }
  },
  zhigouzujin(){//获取租金
    let json = { books: this.data.bookids};
     app.request('book/order/getPurchasePackage', 'POST', json,'zhigouzujinb',this);
  },
  zhigouzujinb(data){//租金押金
    console.log('租金接口--------->'+JSON.stringify(data))
    wx.hideLoading();
    if (data.code != 200) {
      setTimeout(()=>{
        app.tishi('提示', data.msg)
      },600)    
      return false;
    }
      //如果使用会员卡、租金为0，如果不使用会员卡、租金正常
      if(this.data.havecard){
          var zujin = 0
          var yajin = 0
      }
      else {
          var zujin = data.data.rent_price;
          var yajin = data.data.deposit;
      }
    this.setData({ zujin: zujin, yajin: yajin, yunfei: data.data.freight});
  },
  youhuijuan(){//查优惠卷
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let goods_type="1";
    let json = { token: token, userId: user_id, goods_type: goods_type, "type": "1"}
      if(token && user_id) {
          app.request('index/coupon/userCoupon', 'POST', json, 'youhuijuanb', this);
      }
  },
  youhuijuanb(data){
      //优惠查询回调
      this.getList()
    wx.hideLoading();
    if(data.code!=200){
      return false;
    }
    if(data.data.length==0){
      this.setData({ youhuitext:'暂无可用优惠券'})
    }
    else if (data.data.length == 1){
        //一张默认选中
      this.setData({
        youhuiprice: parseFloat(data.data[0].amount), youhuitext: data.data[0].coupon_name,
        coupon_no: data.data[0].coupon_no, haveyouhui: true, hadyouhui:true
      })
        this.changeSwitch({currentTarget:{dataset:{id: 0}}});
    }
    else if (data.data.length > 1){
      this.setData({ youhuitext: data.data.length + '张可用', haveyouhui:true})
    }
  },
  checkyouhui(e){
      //选择优惠卷
    if (this.data.haveyouhui){
      wx.navigateTo({ url: '/pages/home/coupontype/coupontype?type=1',})
    }
  },
  useyouhui(e){
      //使用优惠卷,在优惠列表里选择了
    if(e=='no'){
      this.setData({
        youhuiprice: 0, youhuitext: '不使用优惠券',
        coupon_no: '', hadyouhui: false,
      })
    }else{
        this.setData({
            youhuiprice: parseFloat(e.amount), youhuitext: e.coupon_name,
            coupon_no: e.coupon_no, hadyouhui:true})
    }
    if(this.data.switchType){
        this.money();
    }


  },
  submit(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    if (this.data.addressid==0){//没地址
      app.tishi('提示','请选择收货地址');
      return false;
    }
    if(this.data.switchType2 && !this.data.havecard){
        app.tishi('提示','请选择会员卡或关闭优惠券开关');
        return false;
    }
    if (this.data.cardid==0){//直购
      this.zhigou();
    }else{//会员卡购买
      this.cardbuy(); 
    }

  },
  cardbuy(){
    wx.showLoading();
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let address_id = this.data.addressid;
    let books = this.data.bookids;
    let start_date = this.data.date;
    let end_date = this.data.enddate;
    let message = this.data.message;
    let card_id=this.data.cardid;
    let json = {
      token: token, user_id: user_id, address_id: address_id, books: books, start_date: start_date,
      end_date: end_date, message: message, card_id: card_id}
//    console.log(json);
    app.request('book/order/createOrder','POST',json,'cardbuyb',this);
  },
  cardbuyb(data){
    wx.hideLoading();
//      console.log(data);
      if(data.code!=200){
        app.tishi('提示',data.msg)       
        return false
      }else{
        app.formid(this.data.form_id, data.data.order_sn, "form", "book");
        wx.showToast({title: '购买成功',icon:'success',duration:1000});
        setTimeout(()=>{
          wx.redirectTo({ url: '/pages/order/order?id=2' })
        },1000)
      }
  },
  zhigou(){//直购
    wx.showLoading({title: '调起支付...',mask:true})
    let token=wx.getStorageSync('token');
    let user_id=wx.getStorageSync('userdata').user_id;
    let address_id = this.data.addressid;
    let rent_price = this.data.zujin;
    let coupon_no = this.data.coupon_no;
    let freight = 0.00;
    let books = this.data.bookids;
    let start_date =this.data.date;
    let end_date = this.data.enddate;
    let message = this.data.message;
    let eggNum = this.data.eggNum;
    let json = { token: token, user_id: user_id, address_id: address_id, rent_price: rent_price,
      coupon_no: coupon_no, freight: freight, books: books, start_date: start_date,
      end_date: end_date, message: message,score: eggNum}
    app.request('book/order/createBookOnceOrder','POST',json,'zhigoub',this);
  },
  zhigoub(data){
    if(data.code!=200){
      wx.hideLoading();
      app.tishi('提示',data.msg)
      return false;
    }
    this.setData({ order_sn: data.data.order_sn});
    let token = wx.getStorageSync('token');
    let userId = wx.getStorageSync('userdata').user_id;
    let orderSn = data.data.order_sn;
    let openId=wx.getStorageSync('openid');
    let json={
      token: token, userId: userId, orderSn: orderSn, payMethod: 5, "type": 1, openId: openId
    }
    app.request('pay/jsapi/cardPay','POST',json,'zhigoupay',this);
  },
  zhigoupay(data){//直购支付
    if (data.code && data.code == 300) {
      wx.showToast({ title: data.msg, mask: true, duration: 1000, icon: 'none' });
      return false
    }
    if (data.code && data.code == 250) {
      wx.hideLoading();
      wx.showToast({ title: '购买成功！', icon: 'success', mask: true, duration: 1000 });
      app.formid(this.data.form_id, this.data.order_sn,"form","book");
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/order/order?id=2' })
      }, 1000)
      return false
    }
    let _this = this;
    wx.requestPayment({
      'timeStamp': data.timeStamp,
      'nonceStr': data.nonceStr,
      'package': data.package,
      'signType': data.signType,
      'paySign': data.paySign,
      success(e){
        wx.hideLoading();
        wx.showToast({title: '购买成功！',icon:'success',mask:true,duration:1000});
        app.formid(_this.data.form_id, _this.data.order_sn, "form", "book");
        setTimeout(()=>{
          wx.redirectTo({ url: '/pages/order/order?id=2' })
        },1000)
      },
      fail(e){
        wx.hideLoading();
        wx.showToast({ title: '支付取消',mask: true, icon:'none',duration: 500 });
        setTimeout(() => {
          wx.redirectTo({url: '/pages/order/order?id=1'})
        }, 500)
      }
    })
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    app.request('book/user/bookShelfNum', 'POST', { token: token, user_id: user_id }, 'shelfnum', app);
  },
  endtime(e,days,_type){
    let date = new Date(e);
    date.setDate(date.getDate() + days);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) { month = "0" + month };
    if (day < 10) { day = "0" + day };
    if (_type=='1'){
      return year + '-' + month + '-' + day;
    }else{
      return  month + '月' + day+'日';
    }   
  },
  message(e){
    this.setData({ message:e.detail.value});
  },
  tofixed(e){//两位小数
   return parseFloat(e).toFixed(2);
  },
  gohuiyuan(){//去购买会员
    wx.redirectTo({url: '/pages/home/buycard/buycard'})
  },
  gozhima(){//去芝麻信用页
    wx.redirectTo({url: '/pages/home/zhima/zhima'})
  },
  gozhanshi(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateTo({url: '/pages/shelf/zhanshi/zhanshi'})
  },
  getorder() {
    let order_status = 1;
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let page = 1;
    let json = {
      token: token, user_id: user_id, page: page, order_status: order_status
    }
    app.request('book/order/orderList', 'GET', json, 'getorderb', this)
  },
  getorderb(data){
    if(data.data.length>0){
       wx.showModal({
         title: '提示',
         content: '您有未支付的订单，立即去处理？',
         cancelText:"确定",
         confirmText:"取消",
         success(res){
           if(!res.confirm){
            wx.navigateTo({url:"/pages/order/order?id=1"});
           }
         }
       })
    }
  },
  formid(e) {
    this.setData({ form_id: e.detail.formId })
  },
    //  新增鸟蛋
    changeEggs(e){
        let maxNum = parseInt((parseFloat(this.data.zujin) - parseFloat(this.data.youhuiprice))*100)
        let maxNum2 = this.data.myEggNum
        console.log(maxNum)
        if(maxNum < 0){
            this.setData({
                eggNum: 0
            });
            return false;
        }
        else if(maxNum > maxNum2){
            if(e.detail.value > maxNum2){
                this.setData({
                    eggNum: maxNum2
                });
                return false;
            }
        }
        else {
            if(e.detail.value > maxNum){
                this.setData({
                    eggNum: maxNum
                });
                return false;
            }
        }

        this.setData({
            eggNum: e.detail.value
        });
        console.log(this.data.youhuiprice+this.data.eggNum/100)
    },
    //获取鸟蛋数量
    getList(){
        let token=wx.getStorageSync('token');
        let user_id=wx.getStorageSync('userdata').user_id;
        //书筐中书的总数
        app.request('book/reclaim/my_reclaim_record', 'POST', { token: token,user_id:user_id, page: 1, pagesize: 1 },
            'getListSuccess', this);
    },
    getListSuccess(res){

        let eggNum = res.data.user_info.score
        this.setData({
            myEggNum: eggNum
        })
        // 如果不使用优惠券
        this.money();
        if(this.data.eggNum>0 && !this.data.switchType && !this.data.havecard){
            this.changeSwitch({currentTarget:{dataset:{id: 0}}});
        }
    },
    money(){
        if(!this.data.hadyouhui){
            //let list = res.data.reclaim_list

            if(this.data.myEggNum/100 < this.data.zujin){
                this.setData({
                    eggNum: this.data.myEggNum
                })
            }
            else{
                this.setData({
                    eggNum: parseInt((this.data.zujin)*100)
                    // eggNum: 30
                })
            }
            console.log('不使用优惠券----------》'+this.data.eggNum)
        }
        // 如果使用优惠券
        else {
            //如果选完优惠券，优惠券价格大于商品总价，则把eggNum设置为0
            if(this.data.youhuiprice > this.data.zujin){
                console.log(11111111111111111111)
                this.setData({
                    eggNum: 0
                })
            }
            //如果优惠券+鸟蛋还是小于总价、鸟蛋一样全展示，
            else if(parseFloat(this.data.youhuiprice) + parseFloat(this.data.myEggNum/100) < this.data.zujin){
                console.log(22222222222222222222222)
                this.setData({
                    eggNum: this.data.myEggNum
                })
            }
            //如果优惠券+鸟蛋大于商品总价、
            else{
                console.log(3333333333333333333)
                let price = parseInt((this.data.zujin - this.data.youhuiprice) * 100)
                this.setData({
                    eggNum: price
                })
            }
        }
    },
    changeSwitch(e) {
        let id = e.currentTarget.dataset.id;
        if(this.data.havecard){
            return false;
        }
        if(id == 1){
            this.setData({
                switchType: false,
                eggNum: 0,
            })
        }
        else if(id == 0) {
            this.money()
            console.log('cccccccccccccccc-------------->'+this.data.eggNum)
            if(this.data.eggNum == 0){
                return false;
            }
            else {
                this.setData({
                    switchType: true,
                })
            }
        }
    },
    cardDate(){
        let date = wx.getStorageSync('date');//选中的日期
        let _jydate = date.split('-');//借阅开始时间
        let jydate = _jydate[1] + '月' + _jydate[2] + '日';

      var enddate = this.endtime(date, this.data.leaseDay ? this.data.leaseDay:30, '1');//借阅结束时间yyyy-mm-dd
      var jymaxdate = this.endtime(date, this.data.leaseDay ? this.data.leaseDay :30,'2');//借阅结束时间 几月几日
        //  jjjjjjjjj开始
        var that = this;
        setTimeout(function () {
            if(that.data.havecard){
                enddate = that.endtime(date, that.data.leaseDay, '1');//借阅结束时间yyyy-mm-dd
                jymaxdate = that.endtime(date,that.data.leaseDay,'2');//借阅结束时间 几月几日
            }
            that.setData({ jydate: jydate, jymaxdate: jymaxdate, date: date, enddate: enddate});
        },500)
        console.log('jymaxdate-------->'+jymaxdate)
        //  jjjjjjjjj结束
    },
    //是否启用会员卡
    changeSwitch2(e){
        let id = e.currentTarget.dataset.id;
        if(id == 1){
            this.setData({
                switchType2: false,
                havecard: false
            })
            this.chosecardb(0, '不使用会员计划', '30', '共计30天');
        }
        else if(id == 0) {
            this.setData({
                switchType2: true,
            })
            if(this.data.effectiveCard == 1){
                this.setData({ jihuashu: 1, cardname: this.data.cardname, cardid: this.data.cardid, havecard: true,leaseDay:this.data.leaseDay,leaseDayText:this.data.leaseDayText});
                this.setData({
                    yajin: 0,
                    zujin: 0,
                    eggNum: 0
                });
            }
            else {
                if(this.data.hasCheck){
                    this.chosecardb(this.data.checkCardMessage.cardid, this.data.checkCardMessage.name, this.data.checkCardMessage.leaseday, this.data.checkCardMessage.leaseDayText);
                }
            }
        }
    }
})