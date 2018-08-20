var app = getApp();
var formData = require('../../../utils/util.js');
Page({
  data: {
    checkType: false,

    orderListType: true,    //为true则不可编辑（传到模板oldBook.wxml中）
    pagesize: 4,            //一页展示多少条数据
    currentPage: 1,         //当前展示到第几页
    list: [],
    emptyContent: '当前没有要寄出的共享图书订单，去添加',       //
    emptyBtnText: '去下单',       //
  },
  onLoad: function (options) {
      // 如果是从预约里进入订单列表的话，设置orderListType为false，传入oldBook中
      if(options.type == 1){
          this.setData({
              orderListType: false,
          })

      }else {
          //如果从我的列表中进入，变为true，传入模板中，不显示选中按钮
          this.setData({
              orderListType: true
          })
      }
  },
    onShow:function () {
      this.setData({
          currentPage:1,
          list: []
      })
        //如果从我的列表中进，不可编辑
        if(this.data.orderListType){
            this.getMessage(this.data.currentPage)
        }
        //如果从预约里进，可编辑
        else{
            this.ccw(this.data.currentPage)
        }
    },
  onPullDownRefresh: function () {
      this.setData({
          currentPage: 1,
          list: []
      })

      //如果从我的列表中进，不可编辑
      if(this.data.orderListType){
          this.getMessage(this.data.currentPage)
      }
      //如果从预约里进，可编辑
      else{
          this.ccw(this.data.currentPage)
      }
      // this.getMessage(this.data.currentPage)
  },
   // * 页面上拉触底事件的处理函数
  onReachBottom: function () {
    this.setData({
        currentPage: this.data.currentPage + 1
    })
    // this.getMessage(this.data.currentPage)

      //如果从我的列表中进，不可编辑
      if(this.data.orderListType){
          this.getMessage(this.data.currentPage)
      }
      //如果从预约里进，可编辑
      else{
          this.ccw(this.data.currentPage)
      }
  },

    getMessage(page){
        let token=wx.getStorageSync('token');
        let user_id=wx.getStorageSync('userdata').user_id;
        app.request('book/reclaim/reclaim_order_list', 'POST', { token: token, user_id: user_id,page: page, pagesize: this.data.pagesize },
            'getMessageSuccess', this);
    },
    getMessageSuccess(res){
        // 请求成功、关闭下拉刷新
        console.log('cccccccccc----------->'+JSON.stringify(res))
        setTimeout(function(){
            wx.stopPullDownRefresh()
        },200)
        for(let i=0;i<res.data.length;i++){
            res.data[i]['start_time'] = formData.dateTime2(res.data[i].create_time*1000)
            res.data[i]['checkType'] = false
        }
        this.setData({
            list: this.data.list.concat(res.data)
        })
    },
    cancelOrder(e){
        let book_reclaim_order_id = e.currentTarget.dataset.id
        let token=wx.getStorageSync('token');
        let user_id=wx.getStorageSync('userdata').user_id;
        app.request('book/reclaim/reclaim_order_delete', 'POST', { token: token, user_id: user_id,book_reclaim_order_id: book_reclaim_order_id },
            'cancelOrderSuccess', this);
    },
    cancelOrderSuccess(res){
      console.log(res)
        wx.showToast({ title: res.msg,icon: 'none', mask: true, duration: 1000 });
      this.setData({
          currentPage: 1,
          list: []
      })
        this.getMessage(this.data.currentPage)
    },
    send(e){
        var that = this
        wx.showModal({
            title: '提示',
            content: '共享图书寄出务必和借的书一并预约归还。每次只能选择一个共享图书订单。',
            showCancel: false,
            success: function(res) {
                if (res.confirm) {
                    if(that.data.orderListType){
                        //如果是从我的列表进入的
                        wx.navigateTo({url: '/pages/order/order?id=4'})
                    }
                    else {
                        //如果是从预约进去的(模拟触发check事件)
                        that.check({currentTarget: {dataset: {message: e.currentTarget.dataset.message}}});
                    }
                }
            }
        })
    },
    toOrderDetail(e){
        let id = e.currentTarget.dataset.id
        console.log(id)
        wx.navigateTo({
            url: '/pages/oldBookRecycling/orderDetail/orderDetail?id='+id
        })
    },
    check(e){
        console.log(e)
        let list = this.data.list
        let id = e.currentTarget.dataset.message.id
        let order_sn = e.currentTarget.dataset.message.order_sn
        let score = e.currentTarget.dataset.message.score
        let oldBook = e.currentTarget.dataset.message.num
        let pages = getCurrentPages()       //当前页面
        let prevPage = pages[pages.length - 2]      //上一页面
        prevPage.setData({
            order_sn: order_sn,
            score: score,
            book_reclaim_order_id: id,
            oldBook: oldBook,
            mailCheck:'我参与'
        })
        wx.navigateBack()
        // for(var i=0;i<list.length;i++){
        //     if(id == list[i].id){
        //         if(!list[i].checkType){
        //             list[i].checkType = true
        //         }
        //         else {
        //             list[i].checkType = false
        //         }
        //     }
        // }
        // this.setData({
        //     list: list
        // })
  },
    ccw(page){
        let token=wx.getStorageSync('token');
        let user_id=wx.getStorageSync('userdata').user_id;
        app.request('book/reclaim/reclaim_order_list', 'POST', { token: token, user_id: user_id,page: page, pagesize: this.data.pagesize,status: 'wait' },
            'ccwSuccess', this);
    },
    ccwSuccess(res){
        console.log('jjjjjjjjj-------------->'+JSON.stringify(res))
        setTimeout(function(){
            wx.stopPullDownRefresh()
        },200)
        for(let i=0;i<res.data.length;i++){
            res.data[i]['start_time'] = formData.dateTime2(res.data[i].create_time*1000)
            res.data[i]['checkType'] = false
        }
        this.setData({
            list: this.data.list.concat(res.data)
        })
    },
    btn_add(){
        wx.navigateTo({url: '/pages/oldBookRecycling/checkList/checkList'})
    }
})