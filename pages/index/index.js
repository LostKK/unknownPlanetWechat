//index.js
//获取应用实例
const app = getApp()

Page({
  data: {

    //用于分页的属性
    totalPage: 1,
    page: 1,
    videoList: [],
    screenWidth: 350,
    serverUrl: "",

    searchContent: ""
  },

  onLoad: function(params) {
    var that = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    that.setData({
      screenWidth: screenWidth,
    })

    var searchContent = params.search;
    var isSaveRecord = params.isSaveRecord;

    if (isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined) {
      isSaveRecord = 0;
    }

    that.setData({
      searchContent: searchContent
    });

    //获取当前的分页数
    var page = that.data.page;
    that.getAllVideoList(page, isSaveRecord);
  },

  getAllVideoList: function (page, isSaveRecord) {
    var that = this;
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待，数据加载中',
    });

    var searchContent = that.data.searchContent;

    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + '&isSaveRecord=' + isSaveRecord,
      method: "POST",
      data: {
        videoDesc: searchContent
      },
      success: function(res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        console.log(res.data);

        //判断当前页page是否是第一页，如果是第一页，那么设置videolist为空
        if (page === 1) {
          that.setData({
            videoList: []
          });
        }

        var videoList = res.data.data.rows;
        var newVideoList = that.data.videoList;

        that.setData({
          videoList: newVideoList.concat(videoList),
          page: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl
        });
      }
    })
  },

  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    this.getAllVideoList(1, 0);
  },

  onReachBottom: function() {
    var that = this;
    var currentPage = that.data.page;
    var totalPage = that.data.totalPage;

    //判断当前页数和总页数是否相等，如果是的话则无需查询
    if (currentPage === totalPage) {
      wx.showToast({
        title: '讨厌，人家已经挤不出来了啦~~,没有视频了嘤嘤嘤',
        icon: 'none',
      })
      return;
    }
    var page = currentPage + 1;

    that.getAllVideoList(page, 0);

  },

  showVideoInfo:function(e){
     var that = this;
    var videoList = that.data.videoList;
     var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);
     
     wx.redirectTo({
       url: '../videoInfo/videoInfo?videoInfo=' + videoInfo,
     })

    
  }


})