var app=getApp();
var formData = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookid: '',
    messageType:1,
    leaveMessageList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
        bookid: options.bookid
    })
    this.leaveMessageList()
  },
  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
  
  },
  // 页面上拉触底事件的处理函数
  onReachBottom: function () {
  
  },
  //评价列表
  leaveMessageList(){
    let book_id = this.data.bookid;
    app.request('book/index/comment', 'get', { book_id: book_id },
        'leaveMessageListSuccess', this);
  },
  leaveMessageListSuccess(res){
    var data = res.data
    for(var i=0;i<data.length;i++){
        data[i]['czyTime'] = formData.dateTime2(data[i].comment_create_time*1000)
    }
    this.setData({
        leaveMessageList: data
    })
    console.log(JSON.stringify(this.data.leaveMessageList));
  },
})