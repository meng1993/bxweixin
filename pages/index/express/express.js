var app = getApp();
Page({
    onLoad(params) {
        this.init();
        var url = params.url ? decodeURIComponent(params.url) : '/pages/shouye/shouye';
        this.setData({url: url.replace(/type=\w+&/, '')});
    },
    data: {
        url: '',
        lists: []
    },
    choice(index) {
      let pages = getCurrentPages();//页面栈      
      var prevPage = pages[pages.length - 2];
      prevPage.change(this.data.lists[index.currentTarget.id]);
      wx.navigateBack({delta : 1});
    },
    init() {
        wx.showLoading();
        let token = wx.getStorageSync('token');
        let user_id = wx.getStorageSync('userdata').user_id;
        let json = {token: token, user_id: user_id};
        app.request('book/user/expressList', 'POST', json, 'lists', this);
    },
    lists: function (data) {
        wx.hideLoading();
        this.setData({lists: data.data});
    }
});