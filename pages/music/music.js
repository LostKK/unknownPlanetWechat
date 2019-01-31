const app = getApp()

Page({
  data: {
    bgmList: [],
    serverUrl: '',
    videoParams: {},
  },

  onLoad: function(e) {
    var that = this;
    console.log(e);
    that.setData({
      videoParams: e
    });

    wx.showLoading({
      title: '请等待...',
    });
    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    console.info("haha" + app.getGlobalUserInfo());
    //调用后端
    wx.request({
      url: serverUrl + '/bgms/list',
      method: "POST",
      header: {
        'content-type': 'application/json', //默认值
        'userId':user.id,
        'userToken':user.userToken
      },
      success: function(res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 200) {
          var bgmList = res.data.data;
          that.setData({
            bgmList: bgmList,
            serverUrl: serverUrl,
          });
        }
      }
    })
  },

  upload: function(e) {
    var that = this;

    var bgmId = e.detail.value.bgmId;
    var desc = e.detail.value.desc

    console.log("bgmId:" + bgmId);
    console.log("desc:" + desc);


    var duration = that.data.videoParams.duration;
    var tmpHeight = that.data.videoParams.tmpHeight;
    var tmpWidth = that.data.videoParams.tmpWidth;
    var tmpVideoUrl = that.data.videoParams.tmpVideoUrl;
    var tmpCoverUrl = that.data.videoParams.tmpCoverUrl;



    //上传视频
    wx.showLoading({
      title: '上传ing',
    })
    var serverUrl = app.serverUrl;
    var userInfo = app.getGlobalUserInfo(); //fixme 修改原有的全局对象为本地缓存
    console.log("get you:" + userInfo);
    wx.uploadFile({
      url: serverUrl + '/video/uploadVideo',
      formData: {
        userId: userInfo.id, //fixme app.userInfo.id,
        bgmId: bgmId,
        videoSeconds: duration,
        videoHeight: tmpHeight,
        videoWidth: tmpWidth,
        desc: desc,
      },
      filePath: tmpVideoUrl,
      name: 'file',
      header: {
        'content-type': 'application/json', //默认值
      },
      success: function(res) {
        var data = JSON.parse(res.data);
        console.log(data);
        wx.hideLoading();
        if (data.status == 200) {

          wx.showToast({
            title: '上传成功~~',
            icon: 'success'
          });
          wx.navigateBack({
            delta: 1,
          })
          // var videoId = data.data;

          //       wx.showLoading({
          //         title: '上传ing',
          //       })
          //       var serverUrl = app.serverUrl;
          //       wx.uploadFile({
          //         url: serverUrl + '/video/uploadCover',
          //         formData: {
          //           userId: app.userInfo.id,
          //           videoId: videoId,
          //         },
          //         filePath: tmpCoverUrl,
          //         name: 'file',
          //         header: {
          //           'content-type': 'application/json' //默认值
          //         },
          //             success: function(res) {
          //               var data = JSON.parse(res.data);
          //               wx.hideLoading();
          //               if (data.status == 200) {
          //                 wx.showToast({
          //                   title: '上传成功~~',
          //                   icon: 'success'
          //                 });
          //                 wx.navigateBack({
          //                   delta: 1,
          //                 })
          //               } else {
          //                 wx.showToast({
          //                   title: '上传失败...',
          //                 });
          //               }
          //             }
          //       })

        } else if (res.data.status == 502) {
          wx.showToast({
            title: res.data.msg,
            duration: 3000,
            icon: "none"
          });
          wx.redirectTo({
            url: '../userLogin/login',
          })
        } else {
          wx.showToast({
            title: '上传失败...',
          });
        }
      }
    })
  }
})