var app = getApp();
Page({
    onLoad(params) {       
      let pages = getCurrentPages();//页面栈
      if (pages.length === 1) {//分享进入
        this.setData({ _from: "2" })
      }
        var tab = params.tab ? params.tab : 'year';
        if (tab !== 'quarter' && tab !== 'year') {
            tab = 'year';
        }
        this.setData({ tab: tab, attend: params.tab || '', group_id: params.group_id || ''});
        this.init();
        wx.showShareMenu({
            withShareTicket: true
        });
        this.zhima();
        this.timer();
    },
    data: {
        data: {},
        tab: 'year',
        time: 20000,
        jianyajin: 0,
        isShow: false,
        tsShow: false,
        first: true,
        attend: '',
        group_id: '',
        date: {
            day: '00',
            hour: '00',
            minute: '00',
            second: '00'
        }
    },
    first: true,
    onShow() {//进入即刷新页面
        if (!this.first) {
            this.init();
        }
    },
    onReady() {
        var _this = this;
        setTimeout(function () {
            _this.first = false;
        }, 50);
    },
    init() {//初始处理
        wx.showLoading();
        var group_id = 0;
        if (this.data.tab === this.data.attend && this.data.group_id){
          group_id = this.data.group_id;
        }
        let token = wx.getStorageSync('token');
        let user_id = wx.getStorageSync('userdata').user_id;
        let json = {token: token, user_id: user_id, group_id: group_id, type: this.data.tab};
        app.request('book/Group/group_info', 'POST', json, 'detail', this);
    },
    detail: function (data) {//获取详情回调
//        console.log(data);
        wx.hideLoading();
        if (data.code !== 200) {
            wx.showModal({
                title: '出错了！',
                content: data.msg || '数据异常',
                showCancel: false,
                success: function () {
                    wx.navigateTo({url: '/pages/shouye/shouye'});
                }
            });
        } else {
            var _data = this.data.data;
            _data[this.data.tab] = data.data.group_info;
            //_data.group_id = data.data.group_info;
            _data[this.data.tab].card = data.data.card_info;
            _data[this.data.tab].is_join_group = data.data.is_join_group;
            _data[this.data.tab].card.card_id = data.data.card_info.id;
            _data[this.data.tab].card.$old_price = data.data.card_info.price;
            _data[this.data.tab].card.olddeposit = data.data.card_info.deposit;
            _data[this.data.tab].isPay = data.data.pay_status == 1;
            if (data.data.show_group) {
              _data[this.data.tab].time = data.data.show_group.surplus_time;
                _data[this.data.tab].order = data.data.show_group;
            } else {
              _data[this.data.tab].time = data.data.group_info.surplus_time;
            }           
            this.setData({data: _data});
            this.toTab(this.data.tab);
        }
    },
    explain: function () {//查看说明
        wx.navigateTo({url: '/pages/group/explain/explain'});
    },
    buy: function (event) {//去购买
        if (this.data.data[this.data.tab].isPay) {
            let token = wx.getStorageSync('token');
            if (token === '') {
                wx.navigateTo({url: '/pages/login/login'});
                return false;
            } else {
                if (event.currentTarget.id === 'attend') {
                    this.data.data[this.data.tab].card.price = this.data.data[this.data.tab].price;
                } else {
                    this.data.data[this.data.tab].card.price = this.data.data[this.data.tab].card.$old_price;
                }
                wx.setStorageSync('buycard', this.data.data[this.data.tab].card);
                var params = ['jianyajin=' + this.data.jianyajin];
                params.push('from=pintuan')
                if (event.currentTarget.id === 'attend') {//拼团购买
                    params.push('type=group');
                    params.push('group_type=' + this.data.data[this.data.tab].id);
                    if (this.data.attend === this.data.tab && this.data.data[this.data.tab].order) {//参团
                        params.push('group_id=' + this.data.data[this.data.tab].order.id);
                    }
                }
                wx.navigateTo({url: '/pages/home/paycard/paycard?' + params.join('&')});
            }
        }
    },
    buy2: function (event) {//去购买
      if (this.data.data[this.data.tab].isPay) {
        let token = wx.getStorageSync('token');
        if (token === '') {
          wx.navigateTo({ url: '/pages/login/login' });
          return false;
        } else {
          if (event.currentTarget.id === 'attend2') {
            this.data.data[this.data.tab].card.price = this.data.data[this.data.tab].price;
          } else {
            this.data.data[this.data.tab].card.price = this.data.data[this.data.tab].card.$old_price;
          }
          wx.setStorageSync('buycard', this.data.data[this.data.tab].card);
          var params = ['jianyajin=' + this.data.jianyajin];
          params.push('from=pintuan')
          if (event.currentTarget.id === 'attend2') {//拼团购买
            params.push('type=group');
            params.push('group_type=' + this.data.data[this.data.tab].id);
            if (this.data.attend === this.data.tab && this.data.data[this.data.tab].order) {//参团
              params.push('group_id=' + this.data.data[this.data.tab].order.id);
            }
          }
          wx.navigateTo({ url: '/pages/home/paycard/paycard?' + params.join('&') });
        }
      }
    },
    toTab: function (event) {//换块
        var tab = event;
        if (typeof event !== 'string') {
            tab = event.target.id;
            if (!this.data.data[tab]) {
                this.setData({tab: tab});
                this.init();
                return;
            }
        }
        this.setData({
            time: this.data.data[tab].time,
            tab: tab
        });
        this.setDate(this.data.data[tab].time);
    },
    dateString: function (d) {//转时间数字
        var str = d.toString();
        if (str.length <= 1) {
            return '0'.repeat(2 - str.length) + str;
        } else {
            return str;
        }
    },
    timer: function () {//倒计时
        var _this = this;
        _this.t = setInterval(function () {
            if (!_this.data.data[_this.data.tab]) {
                return;
            }
            var time = _this.data.time--;
            if (time <= 0) {
                _this.setData({
                    time: 0
                });
                _this.data.data[_this.data.tab].over = true;
                _this.setData({data: _this.data.data});
            } else {
                _this.setDate(time);
                if (_this.data.data.year)
                    _this.data.data.year.time--;
                if (_this.data.data.quarter)
                    _this.data.data.quarter.time--;
                _this.setData({
                    data: _this.data.data
                });
            }
        }, 1000);
    },
    setDate: function (time) {//设置时间
        if(time <= 0){
            time = 0;
        }
        var date = {};
        date.day = this.dateString(Math.floor(time / 86400));
        time -= date.day * 86400;
        date.hour = this.dateString(time > 0 ? Math.floor(time / 3600) : 0);
        time -= date.hour * 3600;
        date.minute = this.dateString(time > 0 ? Math.floor(time / 60) : 0);
        time -= date.minute * 60;
        date.second = this.dateString(time > 0 ? time : 0);
        this.setData({
            date: date,
            time: this.data.time
        });
    },
    onUnload: function () {//清除倒计时
        clearInterval(this.t);
    },
    zhima() {//查看芝麻信用
        let user_id = wx.getStorageSync('userdata').user_id;
        if (user_id) {
            app.request('index/zhima/getUserZMScore', 'POST', {user_id: user_id}, 'zhimab', this)
        }
    },
    zhimab(data) {//芝麻信用回调
        if (data.data.status == 0 || data.data.status == 2) {
            this.setData({jianyajin: "0"});
        }
        if (data.data.zmscore >= 600) {
            this.setData({jianyajin: "1"});
        }
    },
    t: null,
    share: function () {
        this.setData({
            isShow: true
        });
    },
    hidden: function () {
        this.setData({
            isShow: false
        });
    },
    onShareAppMessage: function () {
      let imageUrl="";
      if(this.data.tab ==="year"){
        imageUrl ='https://m.zujiekeji.cn/img/share_year.jpg'
      }else{
        imageUrl ='https://m.zujiekeji.cn/img/share_quarter.jpg'
      }
      let group_id="";
      if (this.data.data[this.data.tab].order){
        group_id = this.data.data[this.data.tab].order.id;
      }
        return {
            title: this.data.data[this.data.tab].name,
            path: '/pages/group/detail/detail?tab=' + this.data.tab + '&group_id=' + group_id,
            imageUrl: imageUrl,
            success: function () {
                // 转发成功
            },
            fail: function () {
                // 转发失败
            }
        };
    },
    goshouye(){
      wx.reLaunch({
        url: '/pages/shouye/shouye',
      })
    },
    zhuanfa :function(){
      this.setData({
        tsShow: true
      })
    },
    savephoto(){
      // wx.showToast({
      //   title: '敬请期待~',duration:800,icon:'none'
      // })
      let group_id = "";
      if (this.data.data[this.data.tab].order) {
        group_id = this.data.data[this.data.tab].order.id;
      }
      wx.navigateTo({
        url: '/pages/group/savephoto/savephoto?tab=' + this.data.tab + '&group_id=' + group_id,
      })
    },
    tishi(){
      this.setData({
        tsShow: false
      })
    }
});