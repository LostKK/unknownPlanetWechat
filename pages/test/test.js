Page({
  onReady: function (e) {
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    this.audioCtx = wx.createAudioContext('myAudio')
  },
  data: {
    poster: 'https://captainkk.cn/k/../pic/captain.jpg',
    name: '此时此刻',
    author: '许巍',
    src: 'https://captainkk.cn/k/../kk_video_dev/bgm/9277.mp3',
  },

  onReady: function () {
    this.audioCtx = wx.createAudioContext('myAudio');
    this.audioCtx.play()
  },


  autoMusic: function (e) {
    var that = this;
    that.setData({
      auto: !that.data.auto
    });
    if (that.data.auto) {
      this.audioCtx.pause()
    } else {
      this.audioCtx.play()
    }
  },

  audioPlay: function () {
    this.audioCtx.play()
  },
 
  audioPause: function () {
    this.audioCtx.pause()
  },
  audio14: function () {
    this.audioCtx.seek(14)
  },
  audioStart: function () {
    this.audioCtx.seek(0)
  },
  funplay: function () {
    console.log("audio play");
  },
  funpause: function () {
    console.log("audio pause");
  },
  funtimeupdate: function (u) {
    console.log(u.detail.currentTime);
    console.log(u.detail.duration);
  },
  funended: function () {
    console.log("audio end");
  },
  funerror: function (u) {
    console.log(u.detail.errMsg);
  }
})