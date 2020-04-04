
// slide.js
//获取应用实例
const app = getApp();
var startX, endX;
var moveFlag = true;// 判断执行滑动事件

Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: "可以试试左右滑动了"
  },
  
  touchStart: function (e) {
    startX = e.touches[0].pageX; // 获取触摸时的原点
    moveFlag = true;
  },
  // 触摸移动事件
  touchMove: function (e) {
    endX = e.touches[0].pageX; // 获取触摸时的原点
    if (moveFlag) {
      if (endX - startX > 50) {
        console.log("move right");
        this.move2right();
        moveFlag = false;
      }
      if (startX - endX > 50) {
        console.log("move left");
        this.move2left();
        moveFlag = false;
      }
    }

  },
  // 触摸结束事件
  touchEnd: function (e) {
    moveFlag = true; // 回复滑动事件
  },

  move2left() {
    var that = this;

    that.setData({
      content: "move2left"
    });
  },
  move2right() {
    var that = this;
    that.setData({
      content: "move2right"
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})