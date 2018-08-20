//app.js
App({ 
  onLaunch: function (e) {
      console.log(e)
      this.globalData.activity_id = e.query.activity_id
    if (wx.getUpdateManager){//判断基础库是否支持该接口
      const updateManager = wx.getUpdateManager();//全局唯一版本更细管理器
      updateManager.onUpdateReady(function () {//新版下载完成
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })
      })
    }
  },
  onShow(e){
    this.czyGetCookie()
    // 登录
    let _this = this;
    wx.login({
      success(e) {
        _this.request('wechat/index/getUserOpenid', 'get', {code: e.code},
            'loginSuccess', _this);
        // wx.request({
        //   url: _this.data.http + 'wechat/index/getUserOpenid',
        //   data: {
        //     code: e.code
        //   },
        //   success(e) {
        //     wx.setStorageSync('openid', e.data.openid);
        //     wx.setStorageSync('session_key', e.data.session_key);
        //   },
        //   fail(e) {
        //   }
        // })
      }
    })
    let date = wx.getStorageSync('date');//选中的日期    
    let jystartdate = this.setdate(5);
    let _date = this.checkday(date, jystartdate);//判断本地日期是否可用    
//    console.log(_date)
    if (_date != date) {//旧时间不可用,_date==jystartdate;
      wx.setStorageSync('date', _date)
    }
    let token = wx.getStorageSync('token');
    if (token===""){return false}
    let user_id = wx.getStorageSync('userdata').user_id;
    //判断登陆态和书架数量
    //  如果已经登录，直接赠送优惠券
    this.czyCoupons()
    this.request('book/user/myPlan', 'POST', { token: token, user_id: user_id }, 'denglutai', this) 
    this.getshelfnum();
  },
  //生成64位cookie开始
  czyGetCookie(){
    let cookie = wx.getStorageSync("zujiekeji-uid");
    if (cookie && cookie.data) {
        return;
    }
    var chars = '7410852963qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM', uid = '', num = 64, size = chars.length;
    for (num; num > 0; num--) {
        uid += chars[Math.floor(Math.random() * 100000) % size];
    }
    wx.setStorageSync("zujiekeji-uid", uid);
    console.log('测试缓存----------》'+wx.getStorageSync("ZU-JIE-KE-JI-UID"))
  },
  //生成64位cookie结束
  loginSuccess(res){
    wx.setStorageSync('openid', res.openid);
    wx.setStorageSync('session_key', res.session_key);
  },
  data: {
   http:'https://testapi.zujiekeji.cn/',
    // http: 'https://appapi.zujiekeji.cn/',
   activity_id:'21',
    t: ''
  },
  getshelfnum(t=''){//获取书架数量
    if (wx.getStorageSync('token')==""){//未登录
      return false
    }
    let _this=this;
    let json = { token: wx.getStorageSync('token'), user_id: wx.getStorageSync('userdata').user_id }

    _this.request('book/user/bookShelfNum', 'POST', json,
        'getshelfnumSuccess', _this);
  },
  getshelfnumSuccess(res){
    let data=res.data;
    if (res.code == 200) {
        // if(t!=''){
        //     t.setData({ num: data.data.book_num});//二级页面的借书架设置书架数量
        // }
        this.globalData.box_num = data.book_num
        console.log('box_num--------->'+this.globalData.box_num)
        wx.setStorageSync('shelfnum', data.book_num);//书架数量存储
        if (data.book_num <= 0) {
            wx.removeTabBarBadge({ index: 2 });
            return false;
        }
        let book_num = data.book_num.toString();
        wx.setTabBarBadge({ index: 2, text: book_num });
        var pages = getCurrentPages(), page = pages[pages.length-1];
      if (page.data.currshelfnum !== undefined){
          page.setData({
            currshelfnum: data.book_num
          })
        }
    }
  },
  shelfnum(data) {//获取书架数量
    if (data.code == 200) {
      wx.setStorageSync('shelfnum', data.data.book_num);//书架数量存储
      if (data.data.book_num <= 0) {
        wx.removeTabBarBadge({ index: 2 });
        return false;
      }
      let book_num = data.data.book_num.toString();
      wx.setTabBarBadge({ index: 2, text: book_num });
    }
  },
  denglutai(data){
    if(data.code==300){//登陆态失效
      wx.removeStorageSync('token');
      wx.removeStorageSync('userdata');
      // wx.showModal({
      //   title: '提示',
      //   content: '登录状态失效，重新登录？',
      //   cancelText:'暂不',
      //   confirmText:'去登录',
      //   success(res){
      //     if(res.confirm){
      //       wx.reLaunch({url:'/pages/my/my'})
      //     }
      //   }
      // })
    }
  },
  setdate(days) {//日期选择器
    let date = new Date();
    date.setDate(date.getDate() + days);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) { month = "0" + month };
    if (day < 10) { day = "0" + day };
    return year + '-' + month + '-' + day;
  },
  setdate1(days) {//日期选择器
      let date = new Date();
      date.setDate(date.getDate() + days);
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      if (month < 10) { month = "0" + month };
      if (day < 10) { day = "0" + day };
      return month + '-' + day;
  },
  tishi(t,e){
    wx.showModal({
      title: t,
      content: e,
      showCancel:false
    })
  },
  //接口('地址','方式','参数','回调名','this')
  request(url, method,data,cb="",_this){
    let app=this;
    wx.request({
      url: app.data.http + url,
      header:{
        // 'cookie': wx.getStorageSync("zujiekeji-cookie"),//读取cookie
        'platform': 'weixin_min',
        'cookie': 'ZU-JIE-KE-JI-UID='+wx.getStorageSync("zujiekeji-uid"),//读取cookie
      },
      method:method,
      data:data,
      success(e){
        // wx.setStorageSync("zujiekeji-cookie", e.header["Set-Cookie"])
        // wx.setStorageSync("zujiekeji-uid", _this.czyGetCookie())

        if(cb===""){
          return false;
        }
        _this[cb](e.data);
      }
    })
  },
  // payrequest(url, method, data, cb, _this) {//支付接口
  //   let app = this;
  //
  //   wx.request({
  //     url: app.data.http + url,
  //     method: method,
  //     data: data,
  //     success(e) {
  //       _this[cb](e.data);
  //     }
  //   })
  // },
  shelftabbat(e){//设置tabbar
    let shelfnum = wx.getStorageSync('shelfnum');
    shelfnum = parseInt(shelfnum) + parseInt(e);
    wx.setStorageSync('shelfnum', shelfnum);
    if (shelfnum<=0){
      wx.removeTabBarBadge({index:2});
      return false;
    }
    wx.setTabBarBadge({ index: 2, text: shelfnum.toString() });
  },
  checkday(storage,start){//判断日期是否可用
    let storagem = Date.parse(storage);
    let startm = Date.parse(start);
    if (storagem - startm<0){//本地日期小于最小可选日期
      return start;//返回最小可选日期
    }else{
      return storage;//返回存储的日期
    }
  },
  couponttype(e){
    switch(e){
      case 0 :
        return '通用';
      case 1 :
        return '绘本单买';
      case 2:
        return '小博士计划季度';
      case 3:
        return '小博士计划年度';
      case 4:
        return '小状元计划季度';
      case 5:
        return '小状元计划年度';
      case 10:
        return '其他';
    }
  },
  repeat(e) {//防止重复点击
    let br = wx.getStorageSync('bindrepeat');
    wx.setStorageSync('bindrepeat', e);
    if (e - br < 600 && e - br > 0) {
      return false;
    } else {
      return true;
    }
  },
  relogin(e){//重新登陆
    wx.removeStorageSync('token');
    wx.removeStorageSync('userdata');
    wx.startPullDownRefresh();
    wx.showModal({
      title: '提示',
      content: '登录信息过期，请重新登录',
      success(res) {
        if (res.confirm) {           
          wx.navigateTo({ url: '/pages/login/login' });
        }
      }
    })
  },
  shijianchuo(time){
    let a = new Date(parseInt(time) * 1000);
    return a.getFullYear() + '-' + (a.getMonth() + 1) + '-' + a.getDate();
  },
  shijianchuo2(time) {
    let a = new Date(parseInt(time) * 1000);
    return a.getFullYear() + '-' + (a.getMonth() + 1) + '-' + a.getDate() + '   ' + a.getHours() + ':'+a.getMinutes();
  },
  shijianchuo3(time) {
    let a = new Date(parseInt(time) * 1000);
    return a.getFullYear() + '-' + (a.getMonth() + 1) + '-' + a.getDate() + '   ' + a.getHours() + ':' + a.getMinutes() + ':' + a.getSeconds();
  },
  zhima() {//芝麻信用
    let user_id = wx.getStorageSync('userdata').user_id;
    this.request('index/zhima/getUserZMScore', 'POST', { user_id: user_id }, 'zhimab', this)
  },
  zhimab(data) {//芝麻信用
    if (data.data.status == 0 || data.data.status == 2) {
      wx.setStorageSync('zhimasq', {status:'0',erdu:0})
    }else{
      let erdu=0;
      if (data.data.zmscore < 600) {} 
      else if (data.data.zmscore >= 600 && data.data.zmscore <= 700) {
        erdu=2000;
      } else if (data.data.zmscore > 700 && data.data.zmscore < 751) {
        erdu = 4000;
      } else if (data.data.zmscore >= 751 && data.data.zmscore <= 800) {
        erdu = 8000;
      } else if (data.data.zmscore > 800) {
        erdu = 12000;
      }
      wx.setStorageSync('zhimasq', { status: '1', erdu: erdu })
    }
  },
  judgelogin(){
    let token = wx.getStorageSync('token');
    if (token === "") {//判断登陆状态
      wx.navigateTo({ url: '/pages/login/login' })
    }
  },
  token(e){
    e.token = wx.getStorageSync('token') || "";
    e.user_id = (wx.getStorageSync('userdata') || "") === "" ? "" : wx.getStorageSync('userdata').user_id;
    return e;
  },
  formid(form_id, order_sn, _type, kind, card_id="") {
    let json = this.token({
      form_id: form_id,
      order_sn: order_sn,
      "type": _type,
      kind: kind,
      card_id: card_id
    })
    this.request('book/card/send_wx_template', 'POST', json, "");
  },
    // czy新增领取优惠券
    czyCoupons(){
      console.log('送券activity_id---------'+this.globalData.activity_id)
        let json = { activity_id: this.globalData.activity_id, token: wx.getStorageSync('token'), user_id: wx.getStorageSync('userdata').user_id }

        this.request('book/bargain/active_coupon', 'POST', json,
            'czyCouponsSuccess', this);
        // wx.request({
        //     url: this.data.http +'book/bargain/active_coupon',
        //     method:'POST',
        //     data:json,
        //     success(res){
        //         console.log(res)
        //     }
        // })
    },
    czyCouponsSuccess(res){
        console.log(res)
    },
    globalData: {
        activity_id: '',
        box_num: 0
    }
})