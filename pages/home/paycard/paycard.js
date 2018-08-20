var app=getApp();
Page({
  data:{
      addressid:0,
      num:1,
      youhuiprice: 0,//优惠价格
      haveyouhui: false,//有没有优惠卷
      hadyouhui: false,//选没选优惠卷
      coupon_no: '',//优惠券编号
      message:"",
      youhuitext:'',
      group:null,
      login:0,
      eggNum: 0,    //使用鸟蛋个数
      myEggNum: 0,  //我的鸟蛋总数
      switchType: false,     //是否使用鸟蛋
  },
  onLoad(e){
    let card = wx.getStorageSync('buycard');
    card.price = parseFloat(card.price) || card.price;
    card.deposit = parseFloat(card.deposit)||card.deposit;
    card.goods_type = parseInt(card.card_id)+1;
    this.setData({ card: card, jianyajin: e.jianyajin || "", olddeposit: card.olddeposit,
    "from":e.from || ""});
    wx.showLoading();
    this.youhuijuan();
    this.oneaddress('', '1');     //收货地址
    if(e.type === 'group'){
        var group={};
        if(e.group_type){//参团
            group.group_type = e.group_type;
        }
        if(e.group_id){//创团
            group.group_id = e.group_id;
        }
        this.setData({ group: group});
    }
    if (e.from === "pintuan" || e.from === "kanjia"){
      this.zhima();
    }
    if (e.from === "kanjia"){
      this.setData({ user_bargain_id: e.user_bargain_id})
    }
    this.cardorder();
    let ctstartdate = app.setdate(0);
    let ctenddate = app.setdate(180);
    let ctdate = app.setdate(0);
    this.setData({ctdate: ctdate, ctstartdate: ctstartdate, ctenddate: ctenddate });
    this.zongjia();
  },
  onShow(){
    let token = wx.getStorageSync('token');
    if (token === "") {//判断登陆状态
        wx.redirectTo({ url: '/pages/login/login' })
    }

  },
    onShow(){
        if(!this.data.youhuitext){
            this.youhuijuan();
        }
    },
  jia(e){
    this.setData({num:this.data.num+1});
    this.zongjia();
  },
  jian(e){
    if(this.data.num<=1){return}
    this.setData({ num: this.data.num - 1 });
    this.zongjia();
  },
  zhima(){
    let user_id = wx.getStorageSync('userdata').user_id;
    app.request('index/zhima/getUserZMScore', 'POST', { user_id: user_id }, 'zhimab', this)
  },
  zhimab(data){
    if (data.data.status == 0 || data.data.status==2) {
      this.setData({ jianyajin:'0'})
      return false
    }
    if (data.data.zmscore >= 600){
      this.setData({ jianyajin: '1', 'card.deposit':0.0})
    }
    this.zongjia();
  },
  youhuijuan() {//查优惠卷
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let goods_type = this.data.card.goods_type;
    let price = this.data.card.price;
    let json = { token: token, userId: user_id, goods_type: goods_type,"type":"1",commodity_price: price}
//    console.log(json)
      if(token && user_id) {
          app.request('index/coupon/userCoupon', 'POST', json, 'youhuijuanb', this);
      }
  },
  youhuijuanb(data) {//优惠查询回调
      this.getList();
    wx.hideLoading();
    if (data.code != 200) {
      return false;
    }
    if (data.data.length == 0) {
      this.setData({ youhuitext: '暂无可用红包' })
    } 
    else if (data.data.length == 1) {
        //一张默认选中
      this.setData({
        youhuiprice: parseFloat(data.data[0].amount), youhuitext: data.data[0].coupon_name,
        coupon_no: data.data[0].coupon_no, haveyouhui: true, hadyouhui: true
      })
        // this.changeSwitch()
        this.changeSwitch({currentTarget:{dataset:{id: 0}}});
    }
    else if (data.data.length > 1) {
      this.setData({ youhuitext: data.data.length + '张可用', haveyouhui: true })
    }
    this.zongjia();
  },
  checkyouhui(e) {//选择优惠卷
    if (this.data.haveyouhui) {
      wx.navigateTo({ url: '/pages/home/coupontype/coupontype?type=' + this.data.card.goods_type
      + '&price=' + this.data.card.price, })
    }
  },
  useyouhui(e) {//使用优惠卷,在优惠列表里选择了
    if (e == 'no') {
      this.setData({
        youhuiprice: 0.0, youhuitext: '不使用优惠',
        coupon_no: '', hadyouhui: false,
      })
    }else{
        this.setData({
            youhuiprice: parseFloat(e.amount) || e.amount, youhuitext: e.name,
            coupon_no: e.coupon_no, hadyouhui: true
        })
    }
    this.zongjia();
    // this.money();
      if(this.data.switchType){
          this.money();
      }
  },
  message(e) {//留言
    this.setData({ message: e.detail.value });
  },
  buy(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let card_id = this.data.card.card_id;
    let coupon_no = this.data.coupon_no;
    let num=this.data.num;
    let address_id = this.data.addressid
    let effect_day = this.data.ctdate;

      if(this.data.switchType){
          var eggNum = this.data.eggNum;    //使用鸟蛋数
      }
      else {
          var eggNum = ''
      }
    let cards = [{ "card_id": card_id, "zujie_coupon": coupon_no, "num": num,score: eggNum }];
    let _this=this;
    wx.showModal({
      title: '提示',
      content: '起始生效时间：' + effect_day,
      success(res){
        if(res.confirm){
          //如果未选收货地址
          if(_this.data.addressid == 0){
            wx.showToast({ title: '请选择收货地址', mask: true, duration: 1000, icon: 'none' });
            return false;
          }
          //如果选了收货地址，继续走下边逻辑
          let json = { user_id: user_id, token: token, cards: cards, effect_day:effect_day,address_id: address_id }

          if (_this.data.group && _this.data.group.group_type) {
            _this.setData({pintuan:1})
            json.group_type = _this.data.group.group_type;
          }
          if (_this.data.group && _this.data.group.group_id) {
            _this.setData({ pintuan: 1 })
            json.group_id = _this.data.group.group_id;
          }
          if (_this.data.user_bargain_id) {//砍价
            json.user_bargain_id = _this.data.user_bargain_id;
          }
          app.request('book/card/cardOrder', 'POST', json, 'buyb2', _this);
        }
      }
    })
    
  },
  gozm(e) {//去芝麻信用页
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.redirectTo({ url: '/pages/home/zhima/zhima' })
  },
  buyb2(data){
//    console.log(data);
    if(data.code!=200){
      wx.hideLoading();
      app.tishi('提示',data.msg)
      return
    }
    this.setData({ order_sn: data.data.order_sn, card_id: data.data.card_id});
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let order_sn = data.data.order_sn;
//    console.log(order_sn);
    let openId = wx.getStorageSync('openid');
    let json = {
      token: token, userId: user_id, orderSn: order_sn, payMethod: 5, "type": 2, openId: openId
    }
//    console.log(json);
    app.request('pay/jsapi/cardPay', 'POST',json,'pay',this)
  },
  pay(data){
//    console.log(data);
    wx.hideLoading();
    if (data.code && data.code == 300) {
      wx.showToast({ title: data.msg, mask: true, duration: 1000, icon: 'none' });
      return false
    }
    if (data.code && data.code == 250){
      if(this.data.pintuan!==1){//不是拼团，模板消息
        app.formid(this.data.form_id, this.data.order_sn, "form", "card", this.data.card_id);
      }
      wx.showToast({ title: data.msg, mask: true, duration: 1000, icon: 'none' });
      setTimeout(() => {
        wx.navigateBack({ delta: 1 })
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
      success(e) {
        wx.showToast({ title: '购买成功！', icon: 'success', mask: true, duration: 1000 });
        let pages = getCurrentPages();//页面栈
        if(pages.length >= 3){
            var prevPage = pages[pages.length - 3];//mycard-Page对象
            if (prevPage.buynewcard) {
              prevPage.buynewcard();//刷新我的会员计划页面
            }
        }
        if (_this.data.pintuan !== 1) {//不是拼团，模板消息
          app.formid(_this.data.form_id, _this.data.order_sn, "form", "card", _this.data.card_id);
        }else{//拼团
          app.formid(data.package, _this.data.order_sn, "pay", "card", _this.data.card_id);
        }
        setTimeout(() => {          
          wx.navigateBack({ delta: 1 })
        }, 1000)
      },
      fail(e) {
        wx.showToast({ title: '支付取消', mask: true, duration: 1000,icon:'none'});
        setTimeout(() => {
          wx.navigateBack({ delta: 1 })
        }, 1000)
      }
    })
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    app.request('book/user/bookShelfNum', 'POST', { token: token, user_id: user_id }, 'shelfnum', app);
  },
  bindDateChoose(e) {//修改开卡日期
    this.setData({ ctdate: e.detail.value});
  },
  zongjia(){
      let zongjia1 =this.data.card.price * this.data.num  - this.data.youhuiprice;
      if (zongjia1<=0){
        zongjia1 = 0;
      }
      let zongjia = zongjia1 + this.data.card.deposit
      this.setData({ zongjia: zongjia.toFixed(2)});
  },
  formid(e) {
    this.setData({ form_id: e.detail.formId })
  },
  cardorder(){
    let json = app.token({ user_bargain_id: this.data.user_bargain_id || ""});
    if (this.data.group && this.data.group.group_id){
      json.group_id = this.data.group.group_id;
    }
    app.request('book/card/card_order_notice', 'POST', json, 'cardorderb', this);
  },
  cardorderb(data){
      if(data.code===300){
        this.tishi1(data.msg);
      }else if(data.code===301){
        this.tishi2(data.msg);
      }
  },
  tishi1(msg){
    wx.showModal({
      title: '提示',
      content: msg,
      success(res) {
        if (res.confirm) {
          wx.navigateTo({ url: "/pages/cardorder/cardorder" })
        }
      }
    })
  },
  tishi2(msg){
    wx.showModal({
      title: '提示',
      content: msg,
      success(res) {
        if (res.confirm) {
          wx.navigateTo({ url: "/pages/cardorder/cardorder" })
        }else{
          wx.navigateBack({delta : 1})
        }
      }
    })
  },
  // 赋值开始（czy新增收货地址）
  oneaddress(id = '', moren = '0') {//收获地址
      if(id==-1) {
          this.setData({ address: {}, addressid: 0 });
          return false
      }
      let token = wx.getStorageSync('token');
      let user_id = wx.getStorageSync('userdata').user_id;
      let json = { token: token, userId: user_id, id: id, is_default: moren }
      app.request('index/User/userAddressInfo', 'POST', json, 'oneaddressb', this);
  },
  oneaddressb(data) {//地址回调
      if(data.code!=200) {//没有默认地址找一下上次用的地址
          let token = wx.getStorageSync('token');
          let user_id = wx.getStorageSync('userdata').user_id;
          let json = { token: token, user_id: user_id };
          app.request('book/card/defaultAddress', 'POST', json, 'oneaddressb', this);
          return false;
      }
      if (data.data.default_address) {//没有默认地址，上次购买用的地址
          this.setData({
              address: data.data.default_address,
              addressid: data.data.default_address.address_id
          });
          return false;
      }
      if (data.data.service_area) { return false }//300,走的上次购买地址回调
      this.setData({ address: data.data.addressList, addressid: data.data.addressList.id });
  },
  checkaddress(e) {//跳到地址列表
      if (app.repeat(e.timeStamp) == false) { return; }
      let id = e.currentTarget.id;
      wx.navigateTo({ url: '/pages/home/addresslist/addresslist?id=' + id })
  },
  // 赋值结束（czy新增收货地址）

//  新增鸟蛋
    changeEggs(e){

        let maxNum = parseInt((parseFloat(this.data.card.price*this.data.num) - parseFloat(this.data.youhuiprice))*100)
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
    getList(){
        let token=wx.getStorageSync('token');
        let user_id=wx.getStorageSync('userdata').user_id;
        //书筐中书的总数
        app.request('book/reclaim/my_reclaim_record', 'POST', { token: token,user_id:user_id, page: 1, pagesize: 1 },
            'getListSuccess', this);
    },
    getListSuccess(res){
        // 如果不使用优惠券
        let eggNum = res.data.user_info.score
        this.setData({
            myEggNum: eggNum,
        })
        this.money();
        if(this.data.eggNum>0 && !this.data.switchType){
            this.changeSwitch({currentTarget:{dataset:{id: 0}}});
        }
    },
    money(){
        if(!this.data.hadyouhui){
            //let list = res.data.reclaim_list
            if(this.data.myEggNum/100 < this.data.card.price*this.data.num){
                this.setData({
                    eggNum: this.data.myEggNum
                })
            }
            else{
                this.setData({
                    eggNum: parseInt((this.data.card.price*this.data.num)*100)
                })
            }
            console.log('不使用优惠券----------》'+this.data.eggNum)
        }
        // 如果使用优惠券
        else {
            //如果选完优惠券，优惠券价格大于商品总价，则把eggNum设置为0
            if(this.data.youhuiprice > this.data.card.price*this.data.num){
                console.log(11111111111111111111)
                this.setData({
                    eggNum: 0
                })
            }
            //如果优惠券+鸟蛋还是小于总价、鸟蛋一样全展示，
            else if(parseFloat(this.data.youhuiprice) + parseFloat(this.data.myEggNum/100) < this.data.card.price*this.data.num){
                console.log(22222222222222222222222)
                this.setData({
                    eggNum: this.data.myEggNum
                })
            }
            //如果优惠券+鸟蛋大于商品总价、
            else{
                console.log(3333333333333333333)
                let price = parseInt((this.data.card.price*this.data.num - this.data.youhuiprice) * 100)
                this.setData({
                    eggNum: price
                })
            }
        }
    },
    changeSwitch(e) {
        console.log(e);
        let id = e.currentTarget.dataset.id;

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


        // let switchType = this.data.switchType
        // if(switchType) {
        //     this.setData({
        //         switchType: false,
        //         eggNum: 0,
        //     })
        // }
        // else {
        //     this.money()
        //     console.log('cccccccccccccccc-------------->'+this.data.eggNum)
        //     if(this.data.eggNum == 0){
        //         return false;
        //     }
        //     else {
        //         this.setData({
        //             switchType: true,
        //         })
        //     }
        // }
    }
})