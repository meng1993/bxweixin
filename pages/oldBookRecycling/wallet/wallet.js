var app = getApp();
var formData = require('../../../utils/util.js');
Page({
  data: {
    currentPage: 1,
    pagesize: 10,
    list: [],
    score: '',    //当前鸟蛋数
    emptyContent: '你当前鸟蛋0个，请去参加共享图书活动',
    emptyBtnText: '去参加'
  },
  onLoad: function (options) {
    this.getList(this.data.currentPage)
  },
  //  下拉刷新
  refresh: function () {
    console.log('下拉刷新')
    this.setData({
        currentPage: 1,
        list: []
    })
    this.getList(this.data.currentPage)
  },
  //  上拉触底加载更多
  loadMore: function () {
    console.log('加载更多')
    this.setData({
        currentPage: this.data.currentPage + 1
    });
    this.getList(this.data.currentPage)
  },

    getList(page){
        let token=wx.getStorageSync('token');
        let user_id=wx.getStorageSync('userdata').user_id;
        //书筐中书的总数
        app.request('book/reclaim/my_reclaim_record', 'POST', { token: token,user_id:user_id, page: page, pagesize: this.data.pagesize },
            'getListSuccess', this);
    },
    getListSuccess(res){
        let list = res.data.reclaim_list
        for(var i=0;i<list.length;i++){
            res.data.reclaim_list[i]['create_time'] = formData.dateTime2(list[i].create_time*1000)
        }
        console.log(JSON.stringify(res))
        this.setData({
            score: res.data.user_info.score,
            list: this.data.list.concat(res.data.reclaim_list)
        })
    },
    btn_add(){
        wx.navigateTo({url: '/pages/oldBookRecycling/checkList/checkList'})
    }
})