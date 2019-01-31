//app.js
App({
  //serverUrl:"http://127.0.0.1:8081",
  //serverUrl: "http://23093ra661.imwork.net:57547",
  //serverUrl:"http://23093ra661.imwork.net:14747",
  serverUrl:"https://captainkk.cn/k",
  userInfo: null,

  setGlobalUserInfo:function(user){
    wx.setStorageSync("userInfo", user);
  },

  getGlobalUserInfo:function(){
    return wx.getStorageSync("userInfo");
  },

  reportReasonArray:[
    "色情低俗",
    "政治敏感",
    "涉嫌诈骗",
    "辱骂谩骂",
    "广告垃圾",
    "诱导分享",
    "引人不适",
    "过于暴力",
    "违法违纪",
    "其他原因"
  ]

})