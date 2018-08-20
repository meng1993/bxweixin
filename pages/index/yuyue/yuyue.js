// 别怪我逻辑乱、产品需求变动节奏太快，跟不上节奏
var app=getApp()
Page({
  onLoad(e){
    this.setData({ order_id: e.order_id})
    this.chushi();
    this.oneaddress('','1');
    this.ccw();
    let date = app.setdate(0);
    let date_1 = app.setdate1(0)
    let dateDay = '星期'+"天一二三四五六 ".charAt(new Date(date).getDay())

      let arr1 = [
          {
              name: app.setdate1(0) + " (" +  "今天" + ")",
              name2: app.setdate(0) + " 09:00",
              name3: app.setdate(0) + " 09:00-10:00",

          },
          {
              name: app.setdate1(1) + " (" +  "明天" + ")",
              name2: app.setdate(1) + " 09:00",
              name3: app.setdate(1) + " 09:00-10:00",
          },
          {
              name: app.setdate1(2) + " (" +  '周'+"日一二三四五六 ".charAt(new Date(app.setdate(2)).getDay()) + ")",
              name2: app.setdate(2) + " 09:00",
              name3: app.setdate(2) + " 09:00-10:00",
          }
      ];

    let startdate = app.setdate(0);
    let enddate = app.setdate(4);
    if(new Date().getHours()>=17){
      date = app.setdate(1);
      date_1 = app.setdate1(1)
      startdate = app.setdate(1);
      enddate = app.setdate(5);
      dateDay = '星期'+"天一二三四五六".charAt(new Date(date).getDay())

        arr1 = [
            {
                name: app.setdate1(1) + " (" +  "明天" + ")",
                name2: app.setdate(1) + " 09:00",
                name3: app.setdate(1) + " 09:00-10:00",
            },
            {
                name: app.setdate1(2) + " (" +  '周'+"日一二三四五六 ".charAt(new Date(app.setdate(2)).getDay()) + ")",
                name2: app.setdate(2) + " 09:00",
                name3: app.setdate(2) + " 09:00-10:00",
            }
            ,
            {
                name: app.setdate1(3) + " (" +  '周'+"日一二三四五六 ".charAt(new Date(app.setdate(3)).getDay()) + ")",
                name2: app.setdate(3) + " 09:00",
                name3: app.setdate(3) + " 09:00-10:00",
            }
        ];
    }

      //jjjjjjjjjjjjjjjjjj开始
      var letArr = [
          {name: '9:00-10:00',name2: '09:00',id: 9},
          {name: '10:00-11:00',name2: '10:00',id: 10},
          {name: '11:00-12:00',name2: '11:00',id: 11},
          {name: '12:00-13:00',name2: '12:00',id: 12},
          {name: '13:00-14:00',name2: '13:00',id: 13},
          {name: '14:00-15:00',name2: '14:00',id: 14},
          {name: '15:00-16:00',name2: '15:00',id: 15},
          {name: '16:00-17:00',name2: '16:00',id: 16},
          {name: '17:00-18:00',name2: '17:00',id: 17},
      ];
      var arr2 = []
      var cc = new Date().getHours();
      console.log('cc------------------>>>>>>'+cc)
      if(cc >= 17){
        arr2 = letArr
      }
      else{
        for(var i=0;i<letArr.length;i++){
            if(cc <= letArr[i].id){
                arr2.push(letArr[i])
            }
        }
      }
      console.log(arr2)
      this.setData({
          dateTimeArr_2: arr2
      })

      let dateTimeArr = [
          arr1,
          arr2
      ]
      //{{dateTimeArr[0][dateTime[0]].name}} {{dateTimeArr[1][dateTime[1]].name}}
      this.setData({
          dateTimeArr: dateTimeArr,
      })

      console.log(this.data.dateTimeArr)

      //jjjjjjjjjjjjjjjjjj结束

      console.log('星期'+"天一二三四五六 ".charAt(new Date(date).getDay()))
    this.getorder(e.order_id);
    this.setData({ date: date, time: "09:00", startdate: startdate, enddate: enddate,dateDay: dateDay });
    if(e.from&&e.from=='zhong'){
      this.setData({text:"重新预约"})
      let guihuanzhong=wx.getStorageSync('guihuanzhong');
      console.log('guihuanzhong--------->'+guihuanzhong)




      guihuanzhong = guihuanzhong.split(" ");
      let date = guihuanzhong[0];
      let time = guihuanzhong[1].split('~')[0];

      this.setData({olddate:guihuanzhong,orderDate: date,orderTime:time})
    }
    //this.xiangqing();
      this.bindDateTimeChange({detail:{value: [0,0]}})
  },
    onShow(){
      console.log('5555555555555-------------->'+this.data.courierCode)
    },
  data:{
    addressid: 0,//收货地址id
    address: {},
    date:"2018-2-1",
    time:'12:00',
    code:'JD',
    text:'预约快递',
    array: ['我参与', '我不参与'],
    mailCheck: '我不参与',
    order_sn: '',   //旧书回收订单号
    score: '',       //旧书回收价值多少鸟蛋
    book_reclaim_order_id: '',    //旧书回收的订单号
    hasOrder: false,   //false还没预约过，true为预约过，不能重新选旧书回收订单
    oldBook: 0,     //选择的旧书订单有几本书
    waitOrderNumber: 0,     //status=‘wait’的订单数
    dateDay: '',

    start_time: '',
    start_time2: '',
    dateTime: [0, 0],       //日期时间选中数组
    dateTimeArr: [
          [
              {
                  // id: 0,
                  name: '8月6日(周一)',
                  name2: '2018-08-06 09:00',
                  name3: '2018-08-06 09:00-10:00'
              },
              {
                  // id: 1,
                  name: '8月7日(周二)',
                  name2: '2018-08-06 09:00'
              },
              {
                  // id: 2,
                  name: '周三(8月8日)',
                  name2: '2018-08-06 09:00'
              },
              {
                  // id: 3,
                  name: '周四(8月9日)',
                  name2: '2018-08-06 09:00'
              },
              {
                  // id: 4,
                  name: '周五(8月10日)',
                  name2: '2018-08-06 09:00'
              },
          ],
          [
              {
                  // id: 0,
                  name: '9:00-10:00',
                  name2: '9:00'
              },
              {
                  // id: 1,
                  name: '10:00-11:00',
                  name2: '10:00'
              },
              {
                  // id: 2,
                  name: '11:00-12:00',
                  name2: '11:00'
              },
              {
                  // id: 3,
                  name: '12:00-13:00',
                  name2: '12:00'
              },
              {
                  // id: 4,
                  name: '13:00-14:00',
                  name2: '13:00'
              },
              {
                  // id: 5,
                  name: '14:00-15:00',
                  name2: '14:00'
              },
              {
                  // id: 6,
                  name: '15:00-16:00',
                  name2: '15:00'
              },
              {
                  // id: 7,
                  name: '16:00-17:00',
                  name2: '16:00'
              }
          ]
      ],
    dateTimeArr_2: [],       //用于保存今天能选几点--几点
    tabType: 0,             //tab切换，0为自主预约、1为自主练习
    courierName: '顺丰',    //快递名字
    courierCode: 'SF',            //快递code
    express_no: '',          //自主预约时的订单号
    orderDate: '',          //自主预约日期
    orderTime: '',          //自主预约时间
    orderType: 0,           //0为预约快递，1为自己联系快递
  },
  bindDateChange(e){
    this.setData({ date:e.detail.value})
    var s = e.detail.value;
    var dateDay = '星期'+"天一二三四五六 ".charAt(new Date(s).getDay())
    this.setData({
        dateDay: dateDay
    })
  },
  bindTimeChange(e){
    this.setData({ time:e.detail.value})
  },

  //  jjjjjjjjjjjjjj开始
    bindDateTimeChange(e){
      console.log(e)
      console.log(e.detail.value)
        let checkArr = e.detail.value
        this.setData({
            dateTime: e.detail.value
        })
        let dateTimeArr = this.data.dateTimeArr
        if(new Date().getHours()<17){
            dateTimeArr[0][checkArr[0]].name2 = app.setdate(checkArr[0]) + ' ' + dateTimeArr[1][checkArr[1]].name
            dateTimeArr[0][checkArr[0]].name3 = app.setdate(checkArr[0]) + ' ' + dateTimeArr[1][checkArr[1]].name2
        }
        else if(new Date().getHours()>=17){
            dateTimeArr[0][checkArr[0]].name2 = app.setdate(checkArr[0]+1) + ' ' + dateTimeArr[1][checkArr[1]].name
            dateTimeArr[0][checkArr[0]].name3 = app.setdate(checkArr[0]+1) + ' ' + dateTimeArr[1][checkArr[1]].name2
        }

        console.log(dateTimeArr)
        console.log(dateTimeArr[0][checkArr[0]].name2)

        this.setData({
            start_time: dateTimeArr[0][checkArr[0]].name2,
            start_time2: dateTimeArr[0][checkArr[0]].name3,
        })
        console.log(this.data.dateTimeArr)
        console.log('jjjjjjjjjj------------->'+this.data.start_time)
    },
    bindColumnChange(e){
        console.log(e.detail)
        var dateTimeArr = this.data.dateTimeArr
        if(e.detail.column == 0 && e.detail.value != 0){
            dateTimeArr[1] = [
                {name: '9:00-10:00',name2: '09:00',id: 9},
                {name: '10:00-11:00',name2: '10:00',id: 10},
                {name: '11:00-12:00',name2: '11:00',id: 11},
                {name: '12:00-13:00',name2: '12:00',id: 12},
                {name: '13:00-14:00',name2: '13:00',id: 13},
                {name: '14:00-15:00',name2: '14:00',id: 14},
                {name: '15:00-16:00',name2: '15:00',id: 15},
                {name: '16:00-17:00',name2: '16:00',id: 16},
                {name: '17:00-18:00',name2: '17:00',id: 17},
            ];
        }
        else if(e.detail.column == 0 && e.detail.value == 0){
            dateTimeArr[1] = this.data.dateTimeArr_2
        }
        this.setData({
            dateTimeArr: dateTimeArr
        })
        console.log(this.data.dateTimeArr)
    },
  //  jjjjjjjjjjjjjj结束
  bindMailChange(e){
    if(e.detail.value == 0){
        // this.setData({ mailCheck:'我要寄' });
        console.log('mmp------------->'+this.data.hasOrder)
        wx.navigateTo({
            url: '/pages/oldBookRecycling/orderList/orderList?type=1'
        })
    }
    else if(e.detail.value == 1){
        this.setData({
            mailCheck:'我不参与',
            book_reclaim_order_id: ''
        })
    }

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
  change(data){
    this.setData({
      shipper_name: data.name,
      shipper_code: data.code,
    })
    if (data.code === 'SF') {
      if (new Date().getHours() >= 17) {
        this.setData({ enddate: app.setdate(2)})
      }else{
        this.setData({ enddate: app.setdate(1) })
      }
    }
    else {
      this.setData({
        date: this.data.startdate,
        enddate: this.data.startdate
      })
    }
  },

  xiangqing(){
    let orderId = this.data.order_id;
    let token = wx.getStorageSync('token');
    let userId = wx.getStorageSync('userdata').user_id;
    let json = { token: token, userId: userId, orderId: orderId }
    app.request('index/order/orderfind', 'POST', json,'xiangqingb',this);
  },
  xiangqingb(data){
//    console.log(data);
  },
  chushi(){
    wx.showLoading();
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
    if(data.data.sender_info.express_order_type == 'zizhu'){
        //设置为自己联系快递状态
        // this.setData({ orderType: 1, tabType:1 })
    }
    if(data.data.sender_info.express_order_type == 'yuyue'){
        //设置为预约快递
        // this.setData({ orderType: 0, tabType:0 })
    }
    if (data.data.sender_info.prev_express){//上次预约
      this.setData({ shipper_type: data.data.sender_info.prev_express.name,
          courierName:data.data.sender_info.prev_express.name,
          express_no:data.data.sender_info.express_no
      })
    }
    this.oneaddress(data.data.sender_info.address_id);
  },
  oneaddress(id = '', moren = '0') {//收获地址
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { token: token, userId: user_id, id: id, is_default: moren }
    app.request('index/User/userAddressInfo', 'POST', json, 'oneaddressb', this);
  },
  oneaddressb(data) {//地址回调
    wx.hideLoading();
    if (data.code != 200) {
      return false;
    }
    this.setData({ address: data.data.addressList, addressid: data.data.addressList.id });
  },
  checkaddress(e) {//跳到地址列表
    if (app.repeat(e.timeStamp) == false) { return; }
    let id = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/home/addresslist/addresslist?id=' + id })
  },
    jjSuccess(res){
      console.log('jjjjjjjjj======>'+JSON.stringify(res))
    },
  yuyue(e){
        this.setData({
            cformId: e.detail.formId
        })
      // var form_id = e.detail.formId;
      // var user_id = wx.getStorageSync('userdata').user_id;
      // app.request('book/index/gather_form_id', 'POST', {user_id: user_id,form_id:form_id,platform:'weixin',type:'form'}, "jjSuccess", this)
    if (this.data.addressid==0){
      app.tishi('提示','请设置取件地址');
      return false;
    }
    let _this=this;
    //  如果还没预约过且还未选旧书订单
    if(!_this.data.hasOrder && !_this.data.order_sn && this.data.waitOrderNumber != 0) {
        wx.showModal({
            title: '提示',
            content: '你有共享图书订单，是否选择寄出?',
            confirmText:'是',
            cancelText:'否',
            success(res){
              if(res.confirm){
                wx.navigateTo({
                    url: '/pages/oldBookRecycling/orderList/orderList?type=1'
                })
              }
              else if(res.cancel){
                  wx.showModal({
                      title: '提示',
                      content: '取件时间为' + _this.data.start_time,
                      confirmText:'是的',
                      cancelText:'再想想',
                      success(res){
                          if(res.confirm){
                              let token = wx.getStorageSync('token');
                              let user_id = wx.getStorageSync('userdata').user_id;
                              let order_id = _this.data.order_id;
                              let shipper_code = _this.data.shipper_code;
                              let address_id = _this.data.addressid;
                              //console.log('start_time---------->'+start_time)
                              let json = {
                                  token: token, user_id: user_id, order_id: order_id, shipper_code: shipper_code,
                                  address_id: address_id, start_time: _this.data.start_time2, book_reclaim_order_id: _this.data.book_reclaim_order_id
                              }
                              app.request('book/user/expressOrder', 'POST', json, "yuyueb", _this)
                          }
                      }
                  })
              }
            }
        })
    }
    //如果没预约过，但已经选过旧书订单
    else {
        wx.showModal({
            title: '提示',
            content: '取件时间为' + _this.data.start_time,
            confirmText:'是的',
            cancelText:'再想想',
            success(res){
                if(res.confirm){
                    let token = wx.getStorageSync('token');
                    let user_id = wx.getStorageSync('userdata').user_id;
                    let order_id = _this.data.order_id;
                    let shipper_code = _this.data.shipper_code;
                    let address_id = _this.data.addressid;
                    console.log('start_time2---------->'+_this.data.start_time2)
                    let json = {
                        token: token, user_id: user_id, order_id: order_id, shipper_code: shipper_code,
                        address_id: address_id, start_time: _this.data.start_time2, book_reclaim_order_id: _this.data.book_reclaim_order_id
                    }
                    app.request('book/user/expressOrder', 'POST', json, "yuyueb", _this)
                }
            }
        })
    }

    
  },
  yuyueb(data){
    if(data.code!=200){
      app.tishi('提示',data.msg)
      return false
    }
    //预约成功后formid传给后台
    var form_id = this.data.cformId;
    var user_id = wx.getStorageSync('userdata').user_id;
    app.request('book/index/gather_form_id', 'POST', {user_id: user_id,form_id:form_id,platform:'weixin',type:'form'}, "jjSuccess", this)
    wx.showModal({
      title: '提示',
      content: '预约成功，请在约定时间配合取件',
      showCancel:false,
      success(){
        let pages = getCurrentPages();//页面栈
        var prevPage = pages[pages.length - 2];//上一页Page对象
        prevPage.setData({ lists: [], page: 1 })
        prevPage.getorder();
        wx.navigateBack({ delta: 1 })
      }
    })  
  },
  editExpress:function(){
      var page = getCurrentPages().pop(),url = page.route,params = [];
      for(var key in page.options){
          params.push(key + '=' + page.options[key]);
      }
      wx.navigateTo({url:'/pages/index/express/express?url=' + encodeURIComponent('/' + url + '?' + params.join('&'))});
  },
    //获取能够使用的订单（状态为wait的订单）
    ccw(page){
        let token=wx.getStorageSync('token');
        let user_id=wx.getStorageSync('userdata').user_id;
        app.request('book/reclaim/reclaim_order_list', 'POST', { token: token, user_id: user_id,page: 1, pagesize: 2,status: 'wait' },
            'ccwSuccess', this);
    },
    ccwSuccess(res){
        this.setData({
            waitOrderNumber: res.data.length
        })
        console.log('waitOrderNumber--------------->'+this.data.waitOrderNumber)
    },
    toOrderDetail(e){
        let id = this.data.book_reclaim_order_id
        wx.navigateTo({
            url: '/pages/oldBookRecycling/orderDetail/orderDetail?id='+id
        })
    },
    autoCourier(e){
        let type = e.currentTarget.dataset.id
        console.log(type)
        if(type == 0){
            this.setData({
                tabType: 0,
            })
        }
        else if(type == 1){
            this.setData({
                tabType: 1,
            })
        }
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
    submitOrder(){
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
            setTimeout(function () {
                wx.navigateTo({
                    url: '/pages/order/order?id='+4
                })
            },1000)
        }

    },

    toOneself(){
        var order_id = this.data.order_id
        wx.navigateTo({
            url: '/pages/index/yuyueOneself/yuyueOneself?order_id=' + order_id
        })
    }
})