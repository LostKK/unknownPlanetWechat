function uploadVideo() {
  var that = this;

  wx.chooseVideo({
    sourceType: ['album'],
    success: function(res) {
      console.log(res);

      var duration = res.duration;
      var tmpHeight = res.height;
      var tmpWidth = res.width;
      var tmpVideoUrl = res.tempFilePath;
      var tmpCoverUrl = res.thumbTempFilePath;

      if (duration > 61) {
        wx.showToast({
          title: '视频长度不能超过60秒...',
          icon: 'none',
          duration: 3000
        })
      } else if (duration < 1) {
        wx.showToast({
          title: '对不起，您太短了',
          icon: 'none',
          duration: 3000
        })
      } else {
        //打开选择背景音乐的页面
        wx.navigateTo({
          url: '../music/music?duration=' + duration +
            "&tmpHeight=" + tmpHeight +
            "&tmpWidth=" + tmpWidth +
            "&tmpVideoUrl=" + tmpVideoUrl +
            "&tmpCoverUrl=" + tmpCoverUrl,
        })
      }

    }
  })
}

module.exports = {
  uploadVideo:uploadVideo
}