// pages/more/more.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    serverUrl: '',
    picPathUrl: '',
    wordsUrl: '',
    writterUrl: '',
    wordId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.info("kk");
    console.info(options);
    var wordId = options.wordId;
    var that = this;
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: 'loading..',
    })
    wx.request({
      url: serverUrl + '/word/getOne',
      method: "POST",
      data: {
        id: wordId
      },
      header: {
        'content-type': 'application/json', //默认值
      },
      success: function(res) {
        wx.hideLoading();
        console.info(res.data);
        that.setData({
          picPathUrl: res.data.data.picPath,
          wordsUrl: res.data.data.words,
          writterUrl: res.data.data.writter,
          serverUrl: serverUrl,
          wordId: res.data.data.id
        });
      }
    })
  },

  onReachBottom: function() {
     var that = this;
     console.log(that.data.wordId-1);
    var wordId = that.data.wordId - 1;
    if(that.data.wordId != 1000){
      wx.navigateTo({
        url: '../more/more?wordId=' + wordId,
      })
    }else{
      wx.showToast({
        title: '讨厌，人家已经挤不出来了啦~~,没有文章了嘤嘤嘤',
        icon: 'none',
      })
      return;
    }
     
  },

  onShareAppMessage:function(res){
    var that = this;
    var wordId = that.data.wordId;

    return{
      title:'来自未知星球',
      path:"pages/more/more?wordId=" + wordId
    }
  }

})