var app = getApp();
Page({
  data: {
    lists: [],          //buyone界面传过来铺列表数据的数组
    objJson: '',        //buyone界面传过来的请求接口的完整json
    compenPrice: 0,     //赔偿价格
    myEggNum: 0,        //我的鸟蛋数
    eggNum: 0,          //有效鸟蛋数
    switchType: false,  //是否开启鸟蛋
    endMoney: '',       //最终需支付价格
    reduceMoney: '',    //抵扣价格
    purchase_order_id:'', //下单后的赔偿订单id
  },
  onLoad: function (e) {
    let json = JSON.parse(decodeURIComponent(e.json))
    let lists = JSON.parse(decodeURIComponent(e.lists))
      console.log('上页传过来的json----->'+JSON.stringify(json))
      console.log('上页传过来的lists----->'+JSON.stringify(lists))
    var compenPrice = 0;
    for(var i=0;i<lists.length;i++){
      compenPrice += lists[i].price
    }
    this.setData({
        objJson: json,
        lists: lists,
        compenPrice: compenPrice
    })
    this.getList();

  },
  onShow: function () {
  
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
        if(this.data.compenPrice > 0){
            this.changeSwitch({currentTarget:{dataset:{id:0}}})
            this.changeEggs()
        }
    },
    //  新增鸟蛋
    changeEggs(){
        let maxNum = parseFloat(this.data.compenPrice * 100);     //赔偿价格
        let maxNum2 = this.data.myEggNum                          //我的鸟蛋数

        if(maxNum > maxNum2){
            this.setData({
                eggNum: maxNum2,
                endMoney: parseFloat((maxNum-maxNum2)/100),
                reduceMoney: parseFloat(maxNum2/100)
            });
        }
        else {
            this.setData({
                eggNum: maxNum,
                endMoney: 0,
                reduceMoney: parseFloat(maxNum/100)
            });
        }
    },
    changeSwitch(e) {
        let id = e.currentTarget.dataset.id;
        if(id == 1){
            this.setData({
                switchType: false,
                eggNum: 0,
                endMoney: this.data.compenPrice,
                reduceMoney: 0
            })
        }
        else if(id == 0) {
            this.changeEggs()
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
    toOrder(){
        // user_id   token   score   order_id  book_ids(数组)
        let token = wx.getStorageSync('token');
        let user_id = wx.getStorageSync('userdata').user_id;
        let score = parseInt(this.data.reduceMoney * 100)
        let order_id = this.data.objJson.order_id        //租书的order_id
        let book_ids = this.data.objJson.book_ids       //书的数组

        let json = {
            token: token, user_id: user_id, score: score,
            order_id: order_id, book_ids: book_ids
        }
        app.request('book/purchase/create_purchase_order', 'POST', json, 'toOrderSuccess', this)
    },
    toOrderSuccess(res){
        console.log('下单接口返回数据' + JSON.stringify(res))
        //如果下单成功，再去调取支付接口
        if(res.code == 200){
            this.setData({
                purchase_order_id: res.data.order_id
            })
            this.toPay()
        }
        else if(res.code == 350){
            wx.showToast({ title: res.msg, mask: true, duration: 1500, icon: 'none' });
            setTimeout(function () {
                wx.navigateTo({
                    url: '/pages/home/buyone/buyoneList/buyoneList'
                })
            },1500)

        }
    },
    toPay(){
        console.log('toPay1111111111111111111111')
        let token = wx.getStorageSync('token');
        let user_id = wx.getStorageSync('userdata').user_id;
        let purchase_order_id = this.data.purchase_order_id;   //赔偿订单id
        let openId=wx.getStorageSync('openid');
        let json = {
            token: token, user_id: user_id, purchase_order_id: purchase_order_id,
            openId: openId, pay_method: 6, buy_type: 'buy_book',platform: 'weixin'
        }
        app.request('book/purchase/purchasepay', 'POST', json, 'toPaySuccess', this)
    },
    toPaySuccess(res){
        console.log('22222-------->'+JSON.stringify(res))

        if (res.code && res.code == 300) {
            wx.showToast({ title: res.msg, mask: true, duration: 1000, icon: 'none' });
            return false;
        }
        if (res.code && res.code == 250){
            //跳转赔偿列表
            wx.navigateTo({
                url: '/pages/home/buyone/buyoneList/buyoneList'
            })
            return false;
        }

        wx.requestPayment({
            'timeStamp': res.timeStamp,
            'nonceStr': res.nonceStr,
            'package': res.package,
            'signType': res.signType,
            'paySign': res.paySign,
            'success':function(res){
                wx.showToast({ title: '购买成功！', icon: 'success', mask: true, duration: 1000 });
                //跳转赔偿列表
                setTimeout(function () {
                    wx.navigateTo({
                        url: '/pages/home/buyone/buyoneList/buyoneList'
                    })
                },1000)
            },
            'fail':function(res){
                wx.showToast({ title: '支付取消', mask: true, duration: 1000, icon: 'none' });
                setTimeout(function () {
                    wx.navigateTo({
                        url: '/pages/home/buyone/buyoneList/buyoneList'
                    })
                },1000)
            }
        })

    }
})