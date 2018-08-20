var app = getApp();
Page({
  onLoad(e) {
    app.judgelogin();
    let order_id = e.order_id;
    this.getorder(order_id);
    let date = wx.getStorageSync('date');//选中的日期
    let _jydate = date.split('-');//借阅开始时间
    let enddate = this.endtime(date, 30, '1');//借阅结束时间yyyy-mm-dd
    let jydate = _jydate[1] + '月' + _jydate[2] + '日';
    let jymaxdate = this.endtime(date, 30, '2');//借阅结束时间 几月几日
    this.setData({ jydate: jydate, jymaxdate: jymaxdate, date: date, enddate: enddate, 
    order_id: order_id });
    wx.showLoading({ title: '加载中...' })
    //this.oneaddress('', '1');
  },
  data: {
    addressid: 0,//收货地址id
    address: {},
    yunfei: 0,//运费
    zujin: 0,//租金
    yajin: 0,
    cardid: 0,//会员卡号
    havecard: false,//有无会员卡
    youhuiprice: 0,//优惠价格
    haveyouhui: false,//有没有优惠卷
    hadyouhui: false,//选没选优惠卷
    coupon_no: '',//优惠券编号
    message: '',//留言
    jianyajin: "",
    // chazujinyajin:false //是否查询过直购租金押金
    effectiveCard: 0,   //有效会员卡数
  },
  getorder(e){//原订单
    let token=wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let order_id = e;
    app.request('book/order/orderDetail','GET',{token:token,user_id:user_id,order_id:order_id},
    'getorderb',this);
  },
  getorderb(data){
    if(data.code!=200){
      app.tishi('提示',data.msg);
      return false
    }   
    let bookids = new Array(),num = 0;
    for (let i = 0; i < data.data.books.length; i++) {
      data.data.books[i].img_medium = data.data.books[i].img_medium.split('@')[0];
      if (data.data.books[i].is_purchased == 0) {
        bookids.push(data.data.books[i].book_id)
        num++;
      }
    }
    this.setData({ lists: data.data.books, items: data.data, bookids: bookids,
      stime: app.shijianchuo(data.data.rent_end_time),
      total_num:num,
      etime: app.shijianchuo(data.data.rent_end_time+(3600*24*30))  });
    wx.setStorageSync('bookorder', data.data.books);
    this.getmycards();//可用计划
  },
  checkaddress(e) {//跳到地址列表
    if (app.repeat(e.timeStamp) == false) { return; }
    let id = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/home/addresslist/addresslist?id=' + id })
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
  },
  getmycards() {//会员卡
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let book_num = this.data.total_num;
    let json = {
      token: token,
      user_id: user_id,
      book_num: book_num,
      version: '2.0.1'
    }
    app.request('book/user/myValidCards', 'GET', json, 'getmycardsb', this);
  },
  getmycardsb(data) {//获取会员卡
    this.setData({
        effectiveCard: data.data.cards_num,       //有效会员卡数量
    })
    wx.hideLoading();
    if (data.code != 200) {
      return false;
    }
    if (!data.data.cards) {//没有
      this.setData({ jihuashu: 0 });
      this.zhigouzujin();//获取直接购买租金
      //this.youhuijuan();//获取优惠卷
      this.zhima();//获取芝麻信用
      return false;
    }
    let cards = data.data.cards;
    if (cards.length == 1) {//只有一张
      if (cards[0].use_status != undefined && cards[0].use_status == 0) {//一张无限次卡，已有两单的情况
        this.setData({ jihuashu: 1, cardname: '小博士计划(暂不可用)' });
        this.zhigouzujin();//获取直接购买租金
        this.youhuijuan();//获取优惠卷
        this.zhima();//获取芝麻信用
      } else {
        this.setData({ jihuashu: 1, cardname: cards[0].name, cardid: cards[0].user_card_id, havecard: true });
      }
      // 如果只有一张可用，开启会员卡开关
      this.changeSwitch2({currentTarget:{dataset:{id: 0}}})
    }
    else if (cards.length > 1) {//多张会员卡
      this.setData({ jihuashu: 1, cardname: cards.length + '张可选', havecard: false });
      this.zhigouzujin();//获取直接购买租金
      this.youhuijuan();//获取优惠卷
      this.zhima();//获取芝麻信用
      // 如果多张可用，开启会员卡开关
      this.changeSwitch2({currentTarget:{dataset:{id: 0}}})
    }
  },
  chosecard(e) {//多种计划，去选择
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateTo({ url: '/pages/home/mycard/mycard?from=orderinfo&num=' + this.data.lists.length})
  },
  chosecardb(cardid, name) {//回调，会员卡号赋值
    if (cardid == 0) {//不使用会员计划
      this.setData({ cardname: name, cardid: 0, havecard: false });
      // if (this.data.chazujinyajin==false){//之前没查过就查一下租金押金
      wx.showLoading();
      this.zhigouzujin();//获取直接购买租金
      this.youhuijuan();//获取优惠卷
      this.zhima();//获取芝麻信用
      //}
    } else {
      this.setData({ cardname: name, cardid: cardid, havecard: true, zujin: 0, switchType: false, switchType2:true });
    }
  },
  zhigouzujin() {//获取租金
    let json = { books: this.data.bookids, is_renew : '1'};
    app.request('book/order/getPurchasePackage', 'POST', json, 'zhigouzujinb', this);
  },
  zhigouzujinb(data) {//租金押金
    //this.setData({ chazujinyajin: true });
    wx.hideLoading();
    //    console.log(data.data);
    if (data.code != 200) {
      return false;
    }
    this.setData({ zujin: data.data.rent_price, yajin: data.data.deposit, yunfei: data.data.freight });
  },
  youhuijuan() {//查优惠卷
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let goods_type = "1";
    let json = { token: token, userId: user_id, goods_type: goods_type, "type": "1" }
    app.request('index/coupon/userCoupon', 'POST', json, 'youhuijuanb', this);
  },
  youhuijuanb(data) {//优惠查询回调
    //  this.setData({ chazujinyajin: true })
      this.getList()
     console.log('datta=====>'+JSON.stringify(data));
    wx.hideLoading();
    if (data.code != 200) {
      return false;
    }
    if (data.data.length == 0) {
      this.setData({ youhuitext: '暂无可用优惠券' })
    } else if (data.data.length == 1) {//一张默认选中
      //    console.log(data.data)
      this.setData({
        youhuiprice: parseInt(data.data[0].amount), youhuitext: data.data[0].coupon_name,
        coupon_no: data.data[0].coupon_no, haveyouhui: true, hadyouhui: true
      })
    }
    else if (data.data.length > 1) {
      this.setData({ youhuitext: data.data.length + '张可用', haveyouhui: true })
    }
  },
  checkyouhui(e) {//选择优惠卷
      console.log('我要去选择优惠券')
    if (this.data.haveyouhui) {
      wx.navigateTo({ url: '/pages/home/coupontype/coupontype?type=1', })
    }
  },
  useyouhui(e) {//使用优惠卷,在优惠列表里选择了
    // if (e == 'no') {
    //   this.setData({
    //     youhuiprice: 0, youhuitext: '不使用优惠',
    //     coupon_no: '', hadyouhui: false,
    //   })
    //   return false;
    // }
    // this.setData({
    //   youhuiprice: parseInt(e.amount), youhuitext: e.coupon_name,
    //   coupon_no: e.coupon_no, hadyouhui: true
    // })

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
  submit(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    if (this.data.cardid == 0) {//直购
      this.zhigou();
    } else {//会员卡购买
      let _this = this;
      wx.showModal({
        title: '提示',
        content: '会员计划无需付款，订单立即生效',
        cancelText: '再选选',
        confirmText: '选好啦',
        success(res) {
          if (res.confirm) {
            _this.cardbuy();
          }
        }
      })
    }
  },
  cardbuy() {
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let order_id = this.data.order_id;
    let card_id = this.data.cardid;
    let json = {
      token: token, user_id: user_id, order_type: 1, order_id: order_id, card_id: card_id
    }
    //    console.log(json);
    app.request('book/order/createRenewOrder', 'POST', json, 'cardbuyb', this);
  },
  cardbuyb(data) {
    if (data.code != 200) {
      app.tishi('提示', data.msg)
      return false
    } else {
      wx.showToast({ title: '购买成功', icon: 'success', duration: 1000 });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/order/order?id=4' })
      }, 1000)
    }
  },
  zhigou() {//直购
    wx.showLoading({ title: '调起支付...', mask: true })
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let order_id = this.data.order_id;
    let json = {
      token: token, user_id: user_id, order_id: order_id, order_type: 2
    }
    app.request('book/order/createRenewOrder', 'POST', json, 'zhigoub', this);
  },
  zhigoub(data) {
    if (data.code != 200) {
      wx.hideLoading();
      app.tishi('提示', data.msg)
      return false;
    }
    let token = wx.getStorageSync('token');
    let userId = wx.getStorageSync('userdata').user_id;
    let orderSn = data.data.order_sn;
    let openId = wx.getStorageSync('openid');
    let json = {
      token: token, userId: userId, orderSn: orderSn, payMethod: 5, "type": 1, openId: openId
    }
    app.request('pay/jsapi/cardPay', 'POST', json, 'zhigoupay', this);
  },
  zhigoupay(data) {//直购支付
    if (data.code && data.code == 300) {
      wx.showToast({ title: data.msg, mask: true, duration: 1000, icon: 'none' });
      return false
    }
    if (data.code && data.code == 250) {
      wx.hideLoading();
      wx.showToast({ title: '购买成功！', icon: 'success', mask: true, duration: 1000 });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/order/order?id=4' })
      }, 1000)
      return false
    }
    //    console.log(data);
    wx.requestPayment({
      'timeStamp': data.timeStamp,
      'nonceStr': data.nonceStr,
      'package': data.package,
      'signType': data.signType,
      'paySign': data.paySign,
      success(e) {
        wx.hideLoading();
        wx.showToast({ title: '购买成功！', icon: 'success', mask: true, duration: 1000 });
        setTimeout(() => {
          wx.redirectTo({ url: '/pages/order/order?id=4' })
        }, 1000)
      },
      fail(e) {
        wx.hideLoading();
        wx.showToast({ title: '支付取消', mask: true, icon: 'none', duration: 500 });
        setTimeout(() => {
          wx.redirectTo({ url: '/pages/order/order?id=4' })
        }, 500)
      }
    })
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    app.request('book/user/bookShelfNum', 'POST', { token: token, user_id: user_id }, 'shelfnum', app);
  },
  endtime(e, days, _type) {
    let date = new Date(e);
    date.setDate(date.getDate() + days);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) { month = "0" + month };
    if (day < 10) { day = "0" + day };
    if (_type == '1') {
      return year + '-' + month + '-' + day;
    } else {
      return month + '月' + day + '日';
    }
  },
  message(e) {
    this.setData({ message: e.detail.value });
  },
  tofixed(e) {//两位小数
    return parseFloat(e).toFixed(2);
  },
  gohuiyuan() {//去购买会员
    wx.redirectTo({ url: '/pages/home/buycard/buycard' })
  },
  gozhima() {//去芝麻信用页
    wx.redirectTo({ url: '/pages/home/zhima/zhima' })
  },
  gozhanshi(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateTo({ url: '/pages/shelf/zhanshi/zhanshi' })
  },

//    新增鸟蛋逻辑
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