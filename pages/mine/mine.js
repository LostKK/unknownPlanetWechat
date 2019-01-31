var videoUtil = require('../../utils/videoUtils.js')

const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    isMe: true,
    isFollow: false,

    videoSelClass:"video-info",
    isSelectedWork:"video-info-selected",
    isSelectedLike:"",
    isSelectedFollow:"",

    myVideoList:[],
    myVideoPage:1,
    myVideoTotal:1,

    likeVideoList:[],
    likeVideoPage:1,
    likeVideoTotal:1,

    followVideoList:[],
    followVideoPage:1,
    followVideoTotal:1,

    myWorkFlag:false,
    myLikeFlag:true,
    myFollowFlag:true,
  },

  onLoad: function(params) {
    var that = this;
    //var user = app.userInfo;
    //fixme 修改原有的全局对象为本地缓存
    var user = app.getGlobalUserInfo();
    var userId = user.id;


    var publisherId = params.publisherId;
    if (publisherId != null && publisherId != '' && publisherId != undefined) {
      if (userId != publisherId) {
        that.setData({
          isMe: false,
          publisherId: publisherId,
        })
      }
      if (that.data.isMe) {
        that.data.userId = userId;
      } else {
        that.data.userId = publisherId;
      }

    }else{
      that.setData({
        userId: userId
      })
    }
    

    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待...',
    })

    //调用后端
    wx.request({
      url: serverUrl + '/user/query?userId=' + that.data.userId + '&fanId=' + user.id,
      method: "POST",
      header: {
        'content-type': 'application/json', //默认值
        'userId': user.id,
        'userToken': user.userToken,
      },
      success: function(res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 200) {
          var userInfo = res.data.data;
          var faceUrl = "../resource/images/noneface.png";
          if (userInfo.faceImage != null && userInfo.faceImage != '' && userInfo.faceImage != undefined) {
            faceUrl = serverUrl + userInfo.faceImage;
          }

          that.setData({
            faceUrl: faceUrl,
            fansCounts: userInfo.fansCounts,
            followCounts: userInfo.followCounts,
            receiveLikeCounts: userInfo.receiveLikeCounts,
            nickname: userInfo.nickname,
            isFollow: userInfo.follow
          });

        } else if (res.data.status == 502) {
          wx.showToast({
            title: res.data.msg,
            duration: 3000,
            icon: "none",
            success: function() {
              wx.redirectTo({
                url: '../userLogin/login',
              })
            }
          })
        }
      }
    })
    that.getMyVideoList(1);
  },

  followMe: function(e) {
    var that = this;

    var user = app.getGlobalUserInfo();
    var userId = user.id;
    var publisherId = that.data.publisherId;

    var followType = e.currentTarget.dataset.followtype;

    //1:关注 0:取消关注
    var url = '';
    if (followType == '1') {
      url = '/user/becomeFans?userId=' + publisherId + '&fanId=' + userId;
    } else {
      url = '/user/cancelFans?userId=' + publisherId + '&fanId=' + userId;
    }

    wx.showLoading();
    wx.request({
      url: app.serverUrl + url,
      method: 'POST',
      header: {
        'content-type': 'application/json', //默认值
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function() {
        wx.hideLoading();
 
        if (followType == '1') {
          that.setData({
            isFollow: true,
            fansCounts: ++ that.data.fansCounts
          })
        } else {
          that.setData({
            isFollow: false,
            fansCounts: --that.data.fansCounts
          })
        }
      }
    })
  },

  logout: function() {
    //var user = app.userInfo;
    //fixme 修改原有的全局对象为本地缓存
    var user = app.getGlobalUserInfo();
    wx.showLoading({
      title: '正在注销',
    })
    var serverUrl = app.serverUrl;
    //调用后端
    wx.request({
      url: serverUrl + '/logout?userId=' + user.id,
      method: "POST",
      header: {
        'content-type': 'application/json' //默认值
      },
      success: function(res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 200) {
          //注销成功跳转
          wx.showToast({
            title: '注销成功',
            icon: 'success',
            duration: 3000
          });
          //app.userInfo = null;
          //注销以后，清空缓存
          wx.removeStorageSync('userInfo')
          //页面跳转
          wx.navigateTo({
            url: '../userLogin/login',
          })
        }
      }
    })
  },

  changeFace: function() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function(res) {
        var tempFilePaths = res.tempFilePaths;

        wx.showLoading({
          title: '上传ing',
        })
        var serverUrl = app.serverUrl;
        //var user = app.userInfo;
        //fixme 修改原有的全局对象为本地缓存
        var userInfo = app.getGlobalUserInfo();
        wx.uploadFile({
          url: serverUrl + '/user/uploadFace?userId=' + userInfo.id, //fixme app.userInfo.id,
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            'content-type': 'application/json', //默认值
            'userId': userInfo.id,
            'userToken': userInfo.userToken
          },
          success: function(res) {
            var data = JSON.parse(res.data);
            wx.hideLoading();
            if (data.status == 200) {
              wx.showToast({
                title: '上传成功~~',
                icon: 'success'
              });

              var imageUrl = data.data;
              that.setData({
                faceUrl: serverUrl + imageUrl
              })

            } else if (data.status == 500) {
              wx.showToast({
                title: data.msg
              })
            } else if (res.data.status == 502) {
              wx.showToast({
                title: res.data.msg,
                duration: 3000,
                icon: "none",
                success: function() {
                  wx.redirectTo({
                    url: '../userLogin/login',
                  })
                }
              });

            }
          }
        })
      },
    })
  },

  uploadVideo: function() {
    videoUtil.uploadVideo();
    // var that = this;

    // wx.chooseVideo({
    //   sourceType: ['album'],
    //   success: function(res) {
    //     console.log(res);

    //     var duration = res.duration;
    //     var tmpHeight = res.height;
    //     var tmpWidth = res.width;
    //     var tmpVideoUrl = res.tempFilePath;
    //     var tmpCoverUrl = res.thumbTempFilePath;

    //     if (duration > 21) {
    //       wx.showToast({
    //         title: '视频长度不能超过20秒...',
    //         icon: 'none',
    //         duration: 3000
    //       })
    //     } else if (duration < 1) {
    //       wx.showToast({
    //         title: '对不起，您太短了',
    //         icon: 'none',
    //         duration: 3000
    //       })
    //     } else {
    //       //打开选择背景音乐的页面
    //       wx.navigateTo({
    //         url: '../music/music?duration=' + duration +
    //           "&tmpHeight=" + tmpHeight +
    //           "&tmpWidth=" + tmpWidth +
    //           "&tmpVideoUrl=" + tmpVideoUrl +
    //           "&tmpCoverUrl=" + tmpCoverUrl,
    //       })
    //     }

    //   }
    // })
  },

  doSelectWork:function(){
    this.setData({
      isSelectedWork:"video-info-selected",
      isSelectedLike:"",
      isSelectedFollow:"",

      myWorkFlag: false,
      myLikeFlag: true,
      myFollowFlag: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });
    this.getMyVideoList(1);
  },

  doSelectLike: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",

      myWorkFlag: true,
      myLikeFlag: false,
      myFollowFlag: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });
    this.getMyLikeList(1);
  },

  doSelectFollow: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",

      myWorkFlag: true,
      myLikeFlag: true,
      myFollowFlag: false,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyFollowList(1);
  },
 
  getMyVideoList:function(page){
    var that = this;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showAll/?page=' + page,
      method: "POST",
      data: {
        userId: that.data.userId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var myVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = that.data.myVideoList;
        that.setData({
          myVideoPage: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  getMyLikeList: function (page) {
    var that = this;
    var userId = that.data.userId;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showMyLike/?userId=' + userId + '&page=' + page,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var likeVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = that.data.likeVideoList;
        that.setData({
          likeVideoPage: page,
          likeVideoList: newVideoList.concat(likeVideoList),
          likeVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  getMyFollowList: function (page) {
    var that = this;
    var userId = that.data.userId;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showMyFollow/?userId=' + userId + '&page=' + page,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var followVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = that.data.followVideoList;
        that.setData({
          followVideoPage: page,
          followVideoList: newVideoList.concat(followVideoList),
          followVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  //触底刷新
  onReachBottom: function () {
    var myWorkFlag = this.data.myWorkFlag;
    var myLikeFlag = this.data.MyLikeFlag;
    var myFollowFlag = this.data.myFollowFlag;

    if (!myWorkFlag) {
      var currentPage = this.data.myVideoPage;
      var totalPage = this.data.myVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyVideoList(page);
    } 
    else if (!myLikeFlag) {
      var currentPage = this.data.likeVideoPage;
      var totalPage = this.data.myLikeTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyLikeList(page);
    } 
    else if (!myFollowFlag) {
      var currentPage = this.data.followVideoPage;
      var totalPage = this.data.followVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyFollowList(page);
    }

  },

  // 点击跳转到视频详情页面
  showVideo: function (e) {

    console.log(e);

    var myWorkFlag = this.data.myWorkFlag;
    var myLikeFlag = this.data.myLikeFlag;
    var myFollowFlag = this.data.myFollowFlag;

    if (!myWorkFlag) {
      var videoList = this.data.myVideoList;
    } else if (!myLikeFlag) {
      var videoList = this.data.likeVideoList;
    } else if (!myFollowFlag) {
      var videoList = this.data.followVideoList;
    }

    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.redirectTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo
    })
  },

})