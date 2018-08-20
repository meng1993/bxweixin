var app = getApp();
Page({
  data:{
    cancelId: '',
    titles: [
        { a: '全部', b: "0" },
        { a: '待付款', b: "1" },
        { a: '待发货', b: "2" },
        { a: '已发货', b: "3" },
        { a: '订单完成', b: "4" }
        ],
    _index:0,
      pageNum:1,        //当前加载到第几页
      current: '',      // 当前页是选中模块（全部、待付款、已付款）
      orderList: [],  // 订单列表
      bottomload: true,//loading图标,默认不显示
      bottomend: false,//某一类搜索到最后了 默认不显示
      emptyContent: '该数据为空'
  },
    onLoad: function () {
      // this.getMessage()
    },
    onShow: function () {
      this.setData({
          pageNum: 1,
          orderList: []
      })
      this.getMessage(this.data.current,this.data.pageNum)
    },
    onPullDownRefresh: function () {
        //    监听用户下拉动作
        console.log(1111)
        this.setData({
            pageNum: 1,
            orderList: []
        })
        this.getMessage(this.data.current,this.data.pageNum)

    },
    onReachBottom: function () {
        //    监听用户上拉触底事件
        this.setData({
            pageNum: this.data.pageNum+1
        })
        this.getMessage(this.data.current,this.data.pageNum)
    },
    change:function (e) {
        let type = e.currentTarget.id;
        console.log(type)
        this.setData({
            _index: e.currentTarget.dataset.index,
            orderList: [],
            pageNum: 1,
            bottomend: false
        })
        if(type == 0){
              //全部
            this.setData({
                current: ''
            })
          this.getMessage('',1)
        }
        else if(type == 1){
            //待付款
            this.setData({
                current: 'wait'
            })
            this.getMessage('wait',1)
        }
        else if(type == 2){
            //已付款
            this.setData({
                current: 'pay'
            })
            this.getMessage('pay',1)
        }
        else if(type == 3){
            //已发货
            this.setData({
                current: 'delivery'
            })
            this.getMessage('delivery',1)
        }
        else if(type == 4){
            //订单完成
            this.setData({
                current: 'finish'
            })
            this.getMessage('finish',1)
        }
    },
    getMessage: function (type,pageNum) {
        var that = this
        let token=wx.getStorageSync('token');
        let userId=wx.getStorageSync('userdata').user_id;

        app.request('book/product/product_order_list', 'POST', {token: token, user_id: userId, page: pageNum, pagesize:5, order_status: type},
            'getMessageSuccess', that);
        // wx.request({
        //     url: app.data.http +'book/product/product_order_list',
        //     method:'post',
        //     header: {
        //         'content-type': 'application/x-www-form-urlencoded'
        //     },
        //     data: {token: token, user_id: userId, page: pageNum, pagesize:5, order_status: type},
        //     success(res){
        //       console.log(JSON.stringify(res))
        //         if(res.data.data.length == 0 && that.data.orderList.length !== 0){
        //           that.setData({
        //               // bottomload: false,
        //               bottomend: true
        //           })
        //         }
        //         that.setData({
        //             orderList: that.data.orderList.concat(res.data.data)
        //         });
        //         // 请求成功、关闭下拉刷新
        //         setTimeout(function(){
        //             wx.stopPullDownRefresh()
        //         },200)
        //     }
        // })
    },
    getMessageSuccess(res){
        console.log(JSON.stringify(res))
        if(res.data.length == 0 && this.data.orderList.length !== 0){
            that.setData({
                // bottomload: false,
                bottomend: true
            })
        }
        this.setData({
            orderList: this.data.orderList.concat(res.data)
        });
        // 请求成功、关闭下拉刷新
        setTimeout(function(){
            wx.stopPullDownRefresh()
        },200)
    },
    //    取消订单
    cancelOrder: function (e) {
        var that = this
        let token=wx.getStorageSync('token');
        let userId=wx.getStorageSync('userdata').user_id;
        let id = e.currentTarget.dataset.id;
        that.setData({
            cancelId: id
        });

        app.request('book/product/product_order_delete', 'POST', {token: token, user_id: userId, product_order_id: id},
            'cancelOrderSuccess', that);
        // wx.request({
        //     url: app.data.http +'book/product/product_order_delete',
        //     method:'post',
        //     header: {
        //         'content-type': 'application/x-www-form-urlencoded'
        //     },
        //     data: {token: token, user_id: userId, product_order_id: id},
        //     success(res){
        //         //取消订单成功后，改变orderList值，
        //         for(var i=0;i<that.data.orderList.length;i++){
        //             if(id == that.data.orderList[i].id){
        //                 that.data.orderList.splice(i,1)
        //             }
        //         }
        //         that.setData({
        //             orderList: that.data.orderList
        //         })
        //         console.log(that.data.orderList)
        //     }
        // })
    },
    cancelOrderSuccess(res){
        //取消订单成功后，改变orderList值，
        for(var i=0;i<this.data.orderList.length;i++){
            if(this.data.cancelId == this.data.orderList[i].id){
                this.data.orderList.splice(i,1)
            }
        }
        this.setData({
            orderList: this.data.orderList
        })
        wx.showToast({ title: '取消成功！', icon: 'success', mask: true, duration: 1000 });
    },
    //支付
    toPay: function (e) {
      console.log(e)
        var that = this
        let token=wx.getStorageSync('token');
        let userId=wx.getStorageSync('userdata').user_id;
        let openId = wx.getStorageSync('openid');
        let orderSn  = e.currentTarget.dataset.ordersn;

        app.request('book/product/productpay', 'POST', {token: token, user_id: userId, orderSn: orderSn,payMethod: 'weixin', openId: openId},
            'toPaySuccess', that);
        // wx.request({
        //     url: app.data.http +'book/product/productpay',
        //     method:'post',
        //     data: {token: token, user_id: userId, orderSn: orderSn,payMethod: 'weixin', openId: openId},
        //     success(res){
        //         console.log(JSON.stringify(res))
        //         let data = res.data;
        //         wx.requestPayment({
        //             'timeStamp': data.timeStamp,
        //             'nonceStr': data.nonceStr,
        //             'package': data.package,
        //             'signType': data.signType,
        //             'paySign': data.paySign,
        //             'success':function(res){
        //                 wx.showToast({ title: '购买成功！', icon: 'success', mask: true, duration: 1000 });
        //             },
        //             'fail':function(res){
        //                 wx.showToast({ title: '支付取消', mask: true, duration: 1000, icon: 'none' });
        //             }
        //         })
        //     }
        // })
    },
    toPaySuccess(res){
        wx.requestPayment({
            'timeStamp': res.timeStamp,
            'nonceStr': res.nonceStr,
            'package': res.package,
            'signType': res.signType,
            'paySign': res.paySign,
            'success':function(res){
                wx.showToast({ title: '购买成功！', icon: 'success', mask: true, duration: 1000 });
            },
            'fail':function(res){
                wx.showToast({ title: '支付取消', mask: true, duration: 1000, icon: 'none' });
            }
        })
    },
    //    退款
    refund: function (e) {
        var that = this
        let token=wx.getStorageSync('token');
        let userId=wx.getStorageSync('userdata').user_id;
        let id = e.currentTarget.dataset.id;
        wx.showModal({
            title: '退款提示',
            content: '您将提交退款申请，确认后资金将原路返回，请耐心等待！',
            success: function(res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                    //用户确定退款

                    app.request('book/product/product_order_refund', 'POST', {token: token, user_id: userId, product_order_id: id},
                        'refundSuccess', that);
                    // wx.request({
                    //     url: app.data.http +'book/product/product_order_refund',
                    //     method:'post',
                    //     header: {
                    //         'content-type': 'application/x-www-form-urlencoded'
                    //     },
                    //     data: {token: token, user_id: userId, product_order_id: id},
                    //     success(res){
                    //         console.log(res)
                    //         //退款成功，重新请求数据
                    //         that.setData({
                    //             orderList: [],
                    //             pageNum: 1
                    //         })
                    //         setTimeout(function(){
                    //             that.getMessage(that.data.current,that.data.pageNum)
                    //         },300)
                    //     }
                    // })
                }else {
                  console.log('用户点击了取消')
                }
            }
        })

    },
    refundSuccess(res){
        //退款成功，重新请求数据
        this.setData({
            orderList: [],
            pageNum: 1
        })
        this.getMessage(this.data.current,this.data.pageNum)
    },
    toDetail: function (e) {
      let message = e.currentTarget.dataset.id
      // console.log(id)
        wx.navigateTo({ url:"../../../pages/diandu/czyDetail/czyDetail?message=" + JSON.stringify(message)});
    },
    // 查看物流
    wuliu: function (e) {
        let a=e.currentTarget.dataset.a;
        let b = e.currentTarget.dataset.b;
        let c = e.currentTarget.dataset.c;
        let d = e.currentTarget.dataset.d;
        wx.navigateTo({url: '/pages/home/getwuliu/getwuliu?a='+a+'&b='+b+'&c='+c+'&d='+d})
    }

})