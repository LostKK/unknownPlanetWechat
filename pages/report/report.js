// pages/report/report.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    reasonType: "请选择原因",
    reportReasonArray: app.reportReasonArray,
    publishUserId: "",
    videoId: ""
  },

  onLoad: function(params) {
    var that = this;
    var videoId = params.videoId;
    var publishUserId = params.publishUserId;

    that.setData({
      publishUserId: publishUserId,
      videoId: videoId
    });
  },

  changeMe: function(e) {
    var that = this;

    var index = e.detail.value;
    var reasonType = app.reportReasonArray[index];

    that.setData({
      reasonType: reasonType
    })
  },

  submitReport: function(e) {
     var that = this;

     var reasonIndex = e.detail.value.reasonIndex;
     var reasonContent = e.detail.value.reasonContent;

     var user = app.getGlobalUserInfo();
     var currentUserId = user.id;

     if(reasonIndex == null || reasonIndex == '' || reasonIndex == undefined){
       wx.showToast({
         title: '选择举报理由',
         icon:'none'
       })
       return;
     }
     
     var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/user/reportUser',
      method:'POST',
      data:{
        dealUserId:that.data.publishUserId,
        dealVideoId:that.data.videoId,
        title:app.reportReasonArray[reasonIndex],
        content:reasonContent,
        userid:currentUserId
      },
      header: {
        'content-type': 'application/json', //默认值
        'userId': user.id,
        'userToken': user.userToken,
      },
      success:function(res){
        wx.showToast({
          title: res.data.msg,
          duration:3000,
          icon:'none',
          success:function(){
            wx.navigateBack();
          }
        })
      }
    })

  }
})