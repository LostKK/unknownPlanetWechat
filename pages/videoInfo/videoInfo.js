// pages/videoInfo/videoInfo.js
var videoUtil = require('../../utils/videoUtils.js')

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cover: "cover",
    videoId: "",
    src: "",
    videoInfo: {},

    userLikeVideo: false,

    commentsPage: 1,
    commentsTotalPage: 1,
    commentsList: [],

    placeholder: "说点什么吧",
  },

  myVideoContext: {},

  onLoad: function(params) {
    var that = this;

    that.myVideoContext = wx.createVideoContext("myVideo", that);
    // console.info(params);
    //获取从上一个页面传过来的参数
    var videoInfo = JSON.parse(params.videoInfo);

    //横向视频设置为不拉伸
    var height = videoInfo.videoHeight;
    var width = videoInfo.videoWidth;
    var cover = "cover";
    if (width >= height) {
      cover = "";
    }

    that.setData({
      videoId: videoInfo.id,
      src: app.serverUrl + videoInfo.videoPath,
      videoInfo: videoInfo,
      cover: cover
    });

    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    var loginUserId = "";
    if (user != null && user != undefined && user != '') {
      loginUserId = user.id;
    }

    wx.request({
      url: serverUrl + '/user/queryPublisher?loginUserId=' + loginUserId + '&videoId=' +
        videoInfo.id + '&publisherUserId=' + videoInfo.userId,
      method: 'POST',
      success: function(res) {
        console.log(res.data);

        var publisher = res.data.data.publisher;
        var userLikeVideo = res.data.data.userLikeVideo;

        that.setData({
          serverUrl: serverUrl,
          publisher: publisher,
          userLikeVideo: userLikeVideo
        });
      }
    })
    that.getCommentsList(1);

  },

  onShow: function() {
    var that = this;
    that.myVideoContext.play();
  },

  onHide: function() {
    var that = this;
    that.myVideoContext.pause();
  },

  showSearch: function() {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },

  showPublisher: function() {
    var that = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = that.data.videoInfo;
    var realUrl = '../mine/mine#publisherId@' + videoInfo.userId;
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + videoInfo.userId,
      })
    }
  },

  upload: function() {
    var that = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(that.data.videoInfo);
    var realUrl = '../videoInfo/videoInfo#videoInfo@' + videoInfo;
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      videoUtil.uploadVideo();

    }
  },

  showIndex: function() {
    wx.redirectTo({
      url: '../index/index',
    })
  },

  seeMore:function(){
    var that = this;
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/word/newest',
      method: "POST",
      header: {
        'content-type': 'application/json', //默认值
      },
      success: function (res) {
        wx.hideLoading();
        var wordId = res.data.data.id;
        wx.navigateTo({
          url: '../more/more?wordId=' + wordId,
        })
      }
    })
  },

  showMine: function() {
    var user = app.getGlobalUserInfo();

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },

  likeVideoOrNot: function() {
    var that = this;
    var videoInfo = that.data.videoInfo;
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    } else {
      var userLikeVideo = that.data.userLikeVideo;
      var url = '/video/userLike?userId=' + user.id + '&videoId=' + videoInfo.id +
        '&videoCreaterId=' + videoInfo.userId;
      if (userLikeVideo) {
        url = '/video/userUnLike?userId=' + user.id + '&videoId=' + videoInfo.id +
          '&videoCreaterId=' + videoInfo.userId;
      }

      //调用后端
      wx.request({
        url: serverUrl + url,
        method: "POST",
        header: {
          'content-type': 'application/json', //默认值
          'userId': user.id,
          'userToken': user.userToken,
        },
        success: function(res) {
          wx.hideLoading();
          that.setData({
            userLikeVideo: !userLikeVideo
          });
        }
      })

    }
  },

  shareMe: function() {
    var that = this;
    var user = app.getGlobalUserInfo();
    wx.showActionSheet({
      itemList: ['下载到本地', '举报用户', '分享到朋友圈', '分享到QQ空间', '分享到微博'],
      success: function(res) {
        if (res.tapIndex == 0) {
          //下载
          wx.showLoading({
            title: '下载中...',
          })
          wx.downloadFile({
            url: app.serverUrl + that.data.videoInfo.videoPath,
            success: function(res) {
              if (res.statusCode === 200) {
                console.info(res.tempFilePath);

                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function(res) {
                    console.info(res.errMsg)
                    wx.hideLoading();
                  }
                })
              }
            }
          })
        } else if (res.tapIndex == 1) {
          //举报
          var videoInfo = JSON.stringify(that.data.videoInfo);
          var realUrl = '../videoInfo/videoInfo#videoInfo@' + videoInfo;
          if (user == null || user == undefined || user == '') {
            wx.navigateTo({
              url: '../userLogin/login?redirectUrl=' + realUrl,
            })
          } else {
            var publishUserId = that.data.videoInfo.publishUserId;
            var videoId = that.data.videoInfo.id;
            var currentUserId = user.id;
            wx.navigateTo({
              url: '../report/report?videoId=' + videoId + '&publishUserId=' + publishUserId
            })
          }
        } else {
          wx.showToast({
            title: '官方暂未开放...'
          })
        }
      }
    })
  },

  onShareAppMessage: function(res) {

    var that = this;
    var videoInfo = that.data.videoInfo;

    return {
      title: 'Captain KK的练习作',
      path: 'pages/videoInfo/videoInfo/videoInfo=' + JSON.stringify(videoInfo)
    }
  },

  leaveComment: function() {
    this.setData({
      commentFocus: true
    });
  },

  replyFocus: function(e) {
    var fatherCommentId = e.currentTarget.dataset.fathercommentid;
    var toUserId = e.currentTarget.dataset.touserid;
    var toNickname = e.currentTarget.dataset.tonickname;

    this.setData({
      placeholder: "回复  " + toNickname,
      replyFatherCommentId: fatherCommentId,
      replyToUserId: toUserId,
      commentFocus: true
    });
  },

  saveComment: function(e) {
    var that = this;
    var content = e.detail.value;

    //获取评论回复的fatherCommentId和toUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;

    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(that.data.videoInfo);
    var realUrl = '../videoInfo/videoInfo#videoInfo@' + videoInfo;
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.showLoading({
        title: '请等等...',
      })
      wx.request({
        url: app.serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId + "&toUserId=" + toUserId,
        method: 'POST',
        header: {
          'content-type': 'application/json', //默认值
          'userId': user.id,
          'userToken': user.userToken,
        },
        data: {
          fromUserId: user.id,
          videoId: that.data.videoInfo.id,
          comment: content
        },
        success: function(res) {
          console.info(res.data);
          wx.hideLoading();

          that.setData({
            contentValue: "",
            commentsList: []
          })

          that.getCommentsList(1);
        },

      })
    }
  },

  // commentsPage: 1,
  // commentsTotalPage: 1,
  // commentsList: []
  getCommentsList: function(page) {
    var that = this;
    var videoId = that.data.videoInfo.id;

    wx.request({
      url: app.serverUrl + '/video/getVideoComments?videoId=' + videoId + '&page=' + page,
      method: 'POST',
      success: function(res) {
        console.info(res.data);

        var commentsList = res.data.data.rows;
        var newCommentsList = that.data.commentsList;

        that.setData({
          commentsList: newCommentsList.concat(commentsList),
          commentsPage: page,
          commentsTotalPage: res.data.data.total
        })
      }
    })
  },

  onReachBottom: function() {
    var that = this;
    var currentPage = that.data.commentsPage;
    var totalPage = that.data.commentsTotalPage;
    if (currentPage === totalPage) {
      return;
    }
    var page = currentPage + 1;
    that.getCommentsList(page);
  },

  showAbout:function(){
    wx.navigateTo({
      url: '../about/about',
    })
  }

})