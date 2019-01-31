const app = getApp()

Page({
  data: {

  },

  doRegist: function(e) {
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;

    //简单验证
    if (username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名♂或密码不能为空',
        icon: 'none',
        duration: 3000
      })
    } else {
      wx.showLoading({
        title: '等等人家🐴',
      })
      var serverUrl = app.serverUrl;
      wx.request({
        url: serverUrl + '/regist',
        method: "POST",
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json' //默认值
        },
        success: function(res) {
          wx.hideLoading();
          console.log(res.data);
          var status = res.data.status;
          if (status == 200) {
            wx.showToast({
                title: "欢迎加入kk_video大家庭~",
                icon: 'none',
                duration: 3000
              }),
              // app.userInfo = res.data.data;
              //fixme 修改原有的全局对象为本地缓存
              app.setGlobalUserInfo(res.data.data);
              wx.navigateTo({
                url: '../userLogin/login',
              })
          } else if (status == 500) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
    }
  },

  goLoginPage:function(){
    wx.redirectTo({
      url: '../userLogin/login',
    })
  }
})