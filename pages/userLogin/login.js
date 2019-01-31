const app = getApp()

// pages/userLogin/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var redirectUrl = options.redirectUrl;
    //debugger;
    if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
      redirectUrl = redirectUrl.replace(/#/g, "?");
      redirectUrl = redirectUrl.replace(/@/g, "=");
      that.redirectUrl = redirectUrl;
      console.info("kk");
      console.info(redirectUrl);
    }
  },

  //登录
  doLogin: function(e) {
    var that = this;
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;
    //简单验证
    if (username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名或密码不能为空',
        icon: 'none',
        duration: 3000
      })
    } else {
      wx.showLoading({
        title: '等等人家',
      })
      var serverUrl = app.serverUrl;
      //调用后端
      wx.request({
        url: serverUrl + '/login',
        method: "POST",
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json' //默认值
        },
        success: function(res) {
          console.log(res.data);
          wx.hideLoading();
          if (res.data.status == 200) {
            //注册成功跳转
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 3000
            });
            // app.userInfo = res.data.data;
            //fixme 修改原有的全局对象为本地缓存
            app.setGlobalUserInfo(res.data.data);
            //页面跳转

            var redirectUrl = that.redirectUrl;
            if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
              wx.redirectTo({
                url: redirectUrl,
              })
            } else {
              wx.redirectTo({
                url: '../index/index',
              })
            }

          } else if (res.data.status == 500) {
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

  goRegistPage: function() {
    wx.navigateTo({
      url: '../userRegist/regist',
    })
  }


})