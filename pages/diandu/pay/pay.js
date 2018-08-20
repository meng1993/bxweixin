var app = getApp();
Page({
    data:{
        addressid:0,
        youhuitext: '',
        coupon_no: '', //优惠券编号
        coupon_id: '', //优惠券编号
        youhuiprice: 0,//优惠价格
        haveyouhui: false,//有没有优惠卷
        hadyouhui: false,//选没选优惠卷
        liuyan: '',//选没选优惠卷
        //上页传过来数据开始
        num: '',
        message: '',
        img: '',
        title: '',
        //上页传过来数据结束
        eggNum: 0,
        myEggNum: 0,     //我的鸟蛋总数
        converPrice: 0,     //eggNum/100 + youhuipricec 为了数字转化
        switchType: false,  //是否使用鸟蛋
    },
  onLoad(options){
      app.judgelogin();
      this.youhuijuan()             //查看优惠券
      this.oneaddress('', '1');     //收货地址
      this.setData({
          num: options.num,
          message: JSON.parse(options.message),
          img: options.img,
          title: options.title
      })
      console.log(this.data.message)
  },
    onShow(){
      if(!this.data.youhuitext){
          this.youhuijuan();
      }
    },
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
  youhuijuan() {//查优惠卷
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    if(token && user_id){
        let json = { token: token, userId: user_id,goods_type: '10', "type": "1" }
        app.request('index/coupon/userCoupon', 'POST', json, 'youhuijuanb', this);
    }

  },
  youhuijuanb(data) {//优惠查询回调
    //  this.setData({ chazujinyajin: true })
       console.log(data);
    this.getList();

    if (data.code != 200) {
      return false;
    }
    if (data.data.length == 0) {
      this.setData({ youhuitext: '暂无可用红包' })
    }
    else if (data.data.length == 1) {//一张默认选中
         console.log('666666------->'+JSON.stringify(data.data))
      this.setData({
        youhuiprice: parseFloat(data.data[0].amount), youhuitext: data.data[0].coupon_name,
        coupon_no: data.data[0].coupon_no, haveyouhui: true, hadyouhui: true,coupon_id: data.data[0].coupon_id
      })
        this.changeSwitch({currentTarget:{dataset:{id: 0}}});
    }
    else if (data.data.length >= 1) {
      this.setData({ youhuitext: data.data.length + '张可用', haveyouhui: true })
    }
  },
  checkyouhui(e) {//选择优惠卷
    if (this.data.haveyouhui) {
      wx.navigateTo({ url: '/pages/home/coupontype/coupontype?type=1', })
    }
  },
  useyouhui(e) {//使用优惠卷,在优惠列表里选择了
    if (e == 'no') {
      this.setData({
        youhuiprice: 0, youhuitext: '不使用优惠',
        coupon_no: '', hadyouhui: false,coupon_id: ''
      })
    }else{
        this.setData({
            youhuiprice: parseFloat(e.amount), youhuitext: e.coupon_name,
            coupon_no: e.coupon_no, hadyouhui: true,coupon_id: e.coupon_id
        });
        this.changeSwitch({currentTarget:{dataset:{id: 0}}});
    }
      if(this.data.switchType){
          this.money();
      }
  },
  //  调用下单接口(下单成功后再调用支付接口)
  payMoney:function (e) {
    // 否则走下边逻辑（下单、购买）
    var that = this
    let token=wx.getStorageSync('token');
    let userId=wx.getStorageSync('userdata').user_id;
    let openId = wx.getStorageSync('openid');


    // let orderSn  = e.currentTarget.dataset.ordersn;
    let product_id = that.data.message[0].product_id  //产品id
    let sku_id = that.data.message[0].id    //点读笔类别id（对象最内层id）
    let product_num = that.data.num       //产品数量
    let message = that.data.liuyan        //留言
    let address_id = that.data.addressid  //地址id
    let coupon_id = that.data.coupon_id //优惠券id
    let coupon_no = that.data.coupon_no   //优惠券id
      let eggNum = that.data.eggNum         //鸟蛋
      console.log('eggNum------>'+eggNum);

    if(address_id == 0){
        wx.showToast({ title: '请选择收货地址', mask: true, duration: 1000, icon: 'none' });
        return false;
    }


      app.request('book/product/product_order_create', 'POST', {token: token, user_id: userId, product_id: product_id,sku_id: sku_id, product_num: product_num, message: message, address_id: address_id,coupon_id: coupon_id,platform: 'minWeixin',score: eggNum},
          'payMoneySuccess', that);
  },
    payMoneySuccess(res){
        console.log(res)
        //  下单成功后调用支付接口
        if(res.code == 200){
            let token=wx.getStorageSync('token');
            let userId=wx.getStorageSync('userdata').user_id;
            let openId = wx.getStorageSync('openid');
            let orderSn = res.data.order_sn

            app.request('book/product/productpay', 'POST', {token: token, user_id: userId, orderSn: orderSn,payMethod: 'weixin', openId: openId},
                'jjSuccess', this);
        }
        else {
            wx.showToast({ title: res.msg, mask: true, duration: 1000, icon: 'none' });
        }
    },
    jjSuccess(res){
        console.log('我是支付接口——--》'+JSON.stringify(res))
        let data = res.data;
        if(res.code == 250){
            wx.showToast({ title: '购买成功！', icon: 'success', mask: true, duration: 1000 });
            setTimeout(function () {
                wx.redirectTo({ url: '/pages/diandu/order/order'})
            },1000)
        }
        else{
            wx.requestPayment({
                'timeStamp': res.timeStamp,
                'nonceStr': res.nonceStr,
                'package': res.package,
                'signType': res.signType,
                'paySign': res.paySign,
                'success':function(res){
                    wx.showToast({ title: '购买成功！', icon: 'success', mask: true, duration: 1000 });
                    setTimeout(function () {
                        // wx.navigateBack({
                        //     delta: 2
                        // })
                        wx.redirectTo({ url: '/pages/diandu/order/order'})
                    },1000)
                },
                'fail':function(res){
                    wx.showToast({ title: '支付取消', mask: true, duration: 1000, icon: 'none' });
                    setTimeout(function () {
                        // wx.navigateBack({
                        //     delta: 2
                        // })
                        //navigateTo
                        wx.redirectTo({ url: '/pages/diandu/order/order'})
                    },1000)
                }
            })
        }
    },
    message(e){
        this.setData({
            liuyan: e.detail.value
        })
    },
    changeEggs(e){
        let maxNum = parseInt((parseFloat(this.data.message[0].price * this.data.num) - parseFloat(this.data.youhuiprice))*100)
        let maxNum2 = this.data.myEggNum

        if(maxNum < 0){
            this.setData({
                eggNum: 0,
                converPrice: this.data.message[0].price * this.data.num,
            });
            return false;
        }
        else if(maxNum > maxNum2){
            if(e.detail.value > maxNum2){
                this.setData({
                    eggNum: maxNum2,
                    converPrice: maxNum2/100 + this.data.youhuiprice
                });
                return false;
            }
        }
        else {
            if(e.detail.value > maxNum){
                this.setData({
                    eggNum: maxNum,
                    converPrice: maxNum/100 + this.data.youhuiprice
                });
                return false;
            }
        }

        this.setData({
            eggNum: e.detail.value,
            converPrice: parseFloat(e.detail.value/100)+parseFloat(this.data.youhuiprice)
        });
    },

    getList(){
        let token=wx.getStorageSync('token');
        let user_id=wx.getStorageSync('userdata').user_id;
        //书筐中书的总数
        app.request('book/reclaim/my_reclaim_record', 'POST', { token: token,user_id:user_id, page: 1, pagesize: 1 },
            'getListSuccess', this);
    },
    getListSuccess(res){
        wx.hideLoading();
        console.log('youhuiprice------------_________>'+this.data.youhuiprice)
        let eggNum = res.data.user_info.score
        this.setData({
            myEggNum: eggNum,
            converPrice: this.data.youhuiprice
        });
        this.money();
        if(this.data.eggNum>0 && !this.data.switchType){
            this.changeSwitch({currentTarget:{dataset:{id: 0}}});
        }
    },
    money(){
        // 如果不使用优惠券
        if(this.data.youhuiprice == 0){
            //let list = res.data.reclaim_list
            if(this.data.myEggNum/100 < this.data.message[0].price * this.data.num){
                this.setData({
                    eggNum: this.data.myEggNum,
                    converPrice: this.data.myEggNum/100
                })
            }
            else{
                this.setData({
                    eggNum: parseInt((this.data.message[0].price * this.data.num)*100),
                    converPrice: this.data.message[0].price * this.data.num
                })
            }
        }
        // 如果使用优惠券
        else {
            //如果选完优惠券，优惠券价格大于商品总价，则把eggNum设置为0
            if(this.data.youhuiprice >= this.data.message[0].price * this.data.num){
                this.setData({
                    eggNum: 0,
                    converPrice: this.data.youhuiprice
                })
            }
            //如果优惠券+鸟蛋还是小于总价、鸟蛋一样全展示，
            else if(parseFloat(this.data.youhuiprice) + parseFloat(this.data.myEggNum/100) < this.data.message[0].price * this.data.num){
                this.setData({
                    eggNum: this.data.myEggNum,
                    converPrice: this.data.youhuiprice + this.data.myEggNum/100
                })
            }
            //如果优惠券小于商品总价且 优惠券+鸟蛋大于商品总价、
            else{
                let price = parseInt((this.data.message[0].price * this.data.num - this.data.youhuiprice) * 100)
                this.setData({
                    eggNum: price,
                    converPrice: this.data.message[0].price * this.data.num
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
                converPrice: this.data.youhuiprice
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
        // console.info(switchType)
        // if(switchType) {
        //     this.setData({
        //         switchType: false,
        //         eggNum: 0,
        //         converPrice: this.data.youhuiprice
        //     })
        // }
        // else {
        //     this.money()
        //     // this.setData({
        //     //     switchType: true,
        //     // })
        //     console.log('cccccccccccccccc-------------->'+this.data.eggNum)
        //     if(this.data.eggNum == 0){
        //         return false;
        //     }
        //     else {
        //         this.setData({
        //             switchType: true,
        //         })
        //     }
        //
        // }
    }
})