// 大兄dei、别怪我逻辑乱、产品需求变动节奏太快，
// 写逻辑耗仨小时，改需求注释逻辑要一个小时。完全跟不上节奏吖（不要删、没准儿啥时候就要改回来呢！！！）
var app=getApp()
Page({
  data: {
      courierName: '顺丰',    //快递名字
      courierCode: 'SF',            //快递code
      express_no: '',          //自主预约时的订单号
      orderDate: '',          //自主预约日期
      orderTime: '',          //自主预约时间
      orderType: 0,           //0为预约快递，1为自己联系快递
  },
  onLoad: function (options) {
    this.setData({
        order_id: options.order_id
    })
    this.chushi();
    this.getorder(options.order_id);
  },
    chushi(){
        // wx.showLoading();
        let order_id = this.data.order_id;
        let token = wx.getStorageSync('token');
        let user_id = wx.getStorageSync('userdata').user_id;
        let json={token:token,user_id:user_id,order_id:order_id}
        app.request('book/user/expressInitial','POST',json,'chushib',this)
    },
    //初始回调，下单时的数据
    chushib(data){
//    console.log(data);
        if(data.code!=200){wx.hideLoading(); return false}
        var $key = data.data.shipper.length - 1;
        for(var key in data.data.shipper){
            if(data.data.shipper[key].code === this.data.code){
                $key = key;
                break;
            }
        }
        if (data.data.shipper[$key].code != "SF"){
            this.setData({ enddate : this.data.startdate});
        }
        this.setData({ shipper_code: data.data.shipper[$key].code,
            shipper_name: data.data.shipper[$key].name});
        if(data.data.sender_info.express_order_type == 'zizhu' && data.data.sender_info.prev_express){
            //设置为自己联系快递状态
            // this.setData({ orderType: 1, tabType:1 })
            this.setData({ shipper_type: data.data.sender_info.prev_express.name,
                courierName:data.data.sender_info.prev_express.name,
                express_no:data.data.sender_info.express_no
            })
        }
        if(data.data.sender_info.express_order_type == 'yuyue'){
            //设置为预约快递
            // this.setData({ orderType: 0, tabType:0 })
        }
        // if (data.data.sender_info.prev_express){//上次预约
        //     this.setData({ shipper_type: data.data.sender_info.prev_express.name,
        //         courierName:data.data.sender_info.prev_express.name,
        //         express_no:data.data.sender_info.express_no
        //     })
        // }
        // this.oneaddress(data.data.sender_info.address_id);
    },


  getorder(order_id) {//订单
      let token = wx.getStorageSync('token');
      let user_id = wx.getStorageSync('userdata').user_id;
      app.request('book/order/orderDetail', 'GET', { token: token, user_id: user_id, order_id: order_id },
          'getorderb', this);
  },
  getorderb(data) {
      if (data.code != 200) {
          app.tishi('提示', data.msg);
          return false
      }
      //czy新增鸟蛋逻辑开始
      var reclaim = data.data.reclaim
      if(reclaim != ''){
          this.setData({
              mailCheck: '我参与',
              order_sn: reclaim.order_sn,   //旧书回收订单号
              score: reclaim.score,       //旧书回收价值多少鸟蛋
              oldBook: reclaim.num,       //旧书回收多少本
              hasOrder: true,
              book_reclaim_order_id: reclaim.book_reclaim_order_id       //去订单详情的id
          })
      }
      console.log('66666666666660-------------->'+JSON.stringify(data.data.reclaim))

      //czy新增鸟蛋逻辑结束
      let bookids = new Array(), num = 0;
      for (let i = 0; i < data.data.books.length; i++) {
          bookids.push(data.data.books[i].book_id)
          data.data.books[i].img_medium = data.data.books[i].img_medium.split('@')[0];
          if (data.data.books[i].is_purchased == 0) {
              num++;
          }
      }
      this.setData({
          lists: data.data.books,
          total_num: num
      });
      wx.setStorageSync('bookorder', data.data.books);
  },
  gozhanshi(e) {
      if (app.repeat(e.timeStamp) == false) { return; }
      wx.navigateTo({ url: '/pages/shelf/zhanshi/zhanshi' })
  },
  toCheckCourier(){
      wx.navigateTo({
          url: '/pages/index/checkCourier/checkCourier'
      })
  },
    //输入订单号时触发
    changeInputText(e){
        console.log(e.detail.value)
        this.setData({
            express_no: e.detail.value
        })
    },
    submitOrder(e){
        this.setData({
            cformId: e.detail.formId
        })
        console.log(e.detail.formId)

        let token = wx.getStorageSync('token');
        let userId = wx.getStorageSync('userdata').user_id;
        let order_id = this.data.order_id;
        let  express_no = this.data.express_no;
        let type = this.data.courierCode;
        let json = { token: token, user_id: userId, order_id: order_id, type: type, express_no: express_no };
        if(this.data.express_no == ''){
            wx.showToast({
                title: '请填写您的运单号！',
                icon: 'none',
            });
            return false;
        }
        app.request('book/user/wxExpressOrder', 'POST', json,'submitOrderSuccess',this);
    },
    submitOrderSuccess(res){
        console.log(JSON.stringify(res))
        app.tishi('提示',res.msg)
        if(res.code!=200){
            return false
        }
        else if(res.code == 200){
            //预约成功后formid传给后台
            var form_id = this.data.cformId;
            var user_id = wx.getStorageSync('userdata').user_id;
            app.request('book/index/gather_form_id', 'POST', {user_id: user_id,form_id:form_id,platform:'weixin',type:'form'}, "jjSuccess", this)
            setTimeout(function () {
                // wx.navigateTo({
                //     url: '/pages/order/order?id='+4
                // })
                wx.redirectTo({
                    url: '/pages/order/order?id='+4
                })
                // wx.navigateBack({
                //     delta: 2
                // })
            },1000)
        }
    },
    jjSuccess(res){
      console.log('jjjjjjjjjjjjjjjj===============>'+JSON.stringify(res))
    },
})