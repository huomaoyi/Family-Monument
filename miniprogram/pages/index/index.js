//index.js
const app = getApp()
const db = wx.cloud.database()

const timeZero = " 00:00:00"

var startX, endX;
var moveFlag = true;

Page({
  data: {
    index: 0,
    avatarUrl: './user-unlogin.png',
    userInfoFlagYes: true,
    person: {},
    peopleData: [],
    title:"",
    copyright: "",
    show: false,
    coverTitle: "",
    coverContent: "",

    currentName: "",
    currentBirthDate: "",
    currentLostDate: "",
    currentMissWords: ""
  },

  touchStart: function (e) {
    startX = e.touches[0].pageX;
    moveFlag = true;
  },

  touchMove: function (e) {
    endX = e.touches[0].pageX;
    if (moveFlag) {
      if (endX - startX > 30) {
        console.log("move right");
        this.move2right();
        moveFlag = false;
      }
      if (startX - endX > 30) {
        console.log("move left");
        this.move2left();
        moveFlag = false;
      }
    }

  },

  touchEnd: function (e) {
    moveFlag = true; // 回复滑动事件
  },

  move2left: function () {
    let currentIndex = this.data.index
    if (currentIndex > 0) {
      currentIndex = currentIndex - 1
      let person = this.data.peopleData[currentIndex % this.data.peopleData.length]
      this.setCurrentPerson(person, currentIndex)
    }
  },

  move2right: function () {
    let currentIndex = this.data.index + 1
    let person = this.data.peopleData[currentIndex % this.data.peopleData.length]
    this.setCurrentPerson(person, currentIndex)
  },

  getDayString: function (date) {
    let seperator1 = "-";
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    let currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
  },

  getPeople: function (data) {
    let that = this
    let peopleData = []

    wx.cloud.callFunction({
      name: "mourning_getMissedPeopleByOpenIds",
      data: {
        openids: [app.globalData.openid]
      },
      success: res => {
        console.log("mourning_getMissedPeopleByOpenIds result: ", res.result)

        if (res.result.length == 0 && (data.missedId == undefined || data.missedId == "")) {
          that.addEmptyMissed()
          return
        }

        for (let index = 0; index < res.result.length; index++) {
          let missed = res.result[index]
          peopleData.push({
            id: missed.missedId,
            name: missed.name,
            birthDate: that.getDayString(new Date(missed.birthDate)),
            lostDate: that.getDayString(new Date(missed.lostDate)),
            missWords: missed.missWords,
            flower: missed.flower,
            candle: missed.candle,
            incense: missed.incense,
            tribute: missed.tribute,
            newFlower: 0,
            newCandle: 0,
            newIncense: 0,
            newTribute: 0,
            disabled: missed.creator_openid != app.globalData.openid,
          })
        }
        if (peopleData.length > 0) {
          let index = that.data.index
          that.setData({
            peopleData: peopleData,
          })

          that.setCurrentPerson(peopleData[index], index)
        }

        if (data.missedId != undefined && data.missedId != "") {
          that.setSharedMissedPeople(data.missedId)
        }

        if (that.data.peopleData.length == 0) {
          that.addEmptyMissed()
        }
      },
      fail: err => {
        console.log("error: ", err)
      }
    })
  },

  setCurrentPerson(person, index) {
    this.setData({
      index: index,
      person: person,
      currentName: person.name,
      currentBirthDate: person.birthDate,
      currentLostDate: person.lostDate,
      currentMissWords: person.missWords
    })
  },

  setSharedMissedPeople: function (missedId) {
    wx.cloud.callFunction({
      name: "mourning_getMissedPeopleByMissedIds",
      data: {
        missedIds: [missedId]
      },
      success: res => {
        console.log("mourning_getMissedPeopleByMissedIds result: ", res.result)
        if (res.result.length == 0) {
          return
        }

        let missed = res.result[0]
        let missedPerson = {
          id: missed.missedId,
          name: missed.name,
          birthDate: this.getDayString(new Date(missed.birthDate)),
          lostDate: this.getDayString(new Date(missed.lostDate)),
          missWords: missed.missWords,
          flower: missed.flower,
          candle: missed.candle,
          incense: missed.incense,
          tribute: missed.tribute,
          newFlower: 0,
          newCandle: 0,
          newIncense: 0,
          newTribute: 0,
          disabled: missed.creator_openid != app.globalData.openid
        }

        for (let index = 0; index < this.data.peopleData.length; index ++) {
          if (missedPerson.id == this.data.peopleData[index].id) {
            this.setCurrentPerson(missedPerson, index)
            return
          }
        }

        let personData = this.data.peopleData
        personData.push(missedPerson)
        this.setData({
          peopleData: personData
        })

        this.setCurrentPerson(missedPerson, personData.length - 1)
      },
      fail: err => {
        console.log("error: ", err)
      }
    })
  },

  getTitle: function() {
    let that = this
    wx.cloud.callFunction({
      name: "mourning_getContent",
      data: {},
      success: res => {
        console.log("mourning_getContent result: ", res.result)
        let title = "一起来为新冠病毒逝世者默哀！"

        if (res.result.length == 1){
          title = `截止目前，中国逝世${res.result[0].chinaMissed}人，海外逝世${res.result[0].worldMissed}人，让我们为逝者默哀！`
        }

        that.setData({
          title: title,
          copyright: res.result[0].copyright,
          show: res.result[0].show,
          coverTitle: res.result[0].coverTitle,
          coverContent: res.result[0].coverContent,
        })
      },
      fail: err => {
        console.log("error: ", err)
      }
    })
  },

  getEmptyPerson: function () {
    return {
      id: "",
      name: "",
      birthDate: "",
      lostDate: "",
      missWords: "",
      flower: 0,
      candle: 0,
      incense: 0,
      tribute: 0,
      newFlower: 0,
      newCandle: 0,
      newIncense: 0,
      newTribute: 0,
      disabled: false,
    }
  },

  bindBirthDateChange: function (e) {
    let that = this
    let date = e.detail.value
    if (!that.checkTime(date)) {
      return
    }

    this.setData({
      currentBirthDate: date
    })
  },

  bindLostDateChange: function (e) {
    let date = e.detail.value
    if (!this.checkTime(date)) {
      return
    }

    this.setData({
      currentLostDate: date
    })
  },

  sendFlower: function () {
    let person = this.data.person
    person.newFlower = person.newFlower + 1
    this.setData({
      person: person
    })
  },

  sendIncense: function () {
    let person = this.data.person
    person.newIncense = person.newIncense + 1
    this.setData({
      person: person
    })
  },

  sendCandle: function () {
    let person = this.data.person
    person.newCandle = person.newCandle + 1
    this.setData({
      person: person
    })
  },

  sendTribute: function () {
    let person = this.data.person
    person.newTribute = person.newTribute + 1
    this.setData({
      person: person
    })
  },

  sendMissOperate: function () {
    let that = this
    let person = that.data.person

    if (person.id == undefined || person.id == "") {
      wx.showModal({
        title: '提示',
        content: "请您先填写好逝者信息！"
      })

      return
    }

    person.flower = person.flower + person.newFlower
    person.incense = person.incense + person.newIncense
    person.candle = person.candle + person.newCandle
    person.tribute = person.tribute + person.newTribute

    that.setData({
      person: person
    })

    wx.showLoading({
      title: '发送中...',
    })

    let userInfo = app.globalData.userInfo

    wx.cloud.callFunction({
      name: "mourning_sendOperated",
      data: {
        openid: app.globalData.openid,
        userInfo: {
          nickName: userInfo.nickName,
          gender: userInfo.gender,
          language: userInfo.language,
          city: userInfo.city,
          province: userInfo.province,
          country: userInfo.country,
          avatarUrl: userInfo.avatarUrl
        },
        missedId: person.id,
        operatedData: {
          missedId: person.id,
          flower: person.newFlower,
          incense: person.newIncense,
          candle: person.newCandle,
          tribute: person.newTribute
        }
      },

      success: res => {
        console.log("mourning_sendOperated result: ", res.result)

        let person = that.data.person
        person.newFlower = 0
        person.newIncense = 0
        person.newCandle = 0
        person.newTribute = 0

        that.setData({
          person: person
        })
        
        wx.hideLoading()
      },

      fail: err => {
        console.log("error: ", err)
        wx.hideLoading()
      }
    })

  },

  addEmptyMissed: function () {
    let that = this
    let missed = that.getEmptyPerson()
    let peopleData = that.data.peopleData

    peopleData.push(missed)
    that.setCurrentPerson(missed, that.data.index + 1)
    that.setData({
      peopleData: peopleData
    })
  },

  goSquare: function () {

  },

  goShare: function () {
    this.onShareAppMessage()
  },

  verify: function () {
    let that = this
    let warn = ""
    if (that.data.person.name == undefined || that.data.person.name == "") {
      warn = "请输入姓名"
    } else if (that.data.person.birthDate == undefined || that.data.person.birthDate == "" || that.data.person.birthDate.indexOf("请输入") != -1) {
      warn = "请输入出生时间"
    } else if (that.data.person.lostDate == undefined || that.data.person.lostDate == "" || that.data.person.lostDate.indexOf("请输入") != -1) {
      warn = "请输入离去时间"
    } else if (that.data.person.missWords == undefined || that.data.person.missWords == "" || that.data.person.missWords.length > 280) {
      warn = "您的吊唁词过长，请保持在280字内"
    }

    if (warn != "") {
      wx.showModal({
        title: '提示',
        content: warn
      })

      return false
    }

    return true
  },

  submitPersonInfo: function (e) {
    let that = this

    let person = that.data.person
    person.name = e.detail.value.name
    person.birthDate = e.detail.value.birthDate
    person.lostDate = e.detail.value.lostDate
    person.missWords = e.detail.value.missWords

    that.setCurrentPerson(person, that.data.index)

    if (!that.verify()) {
      return
    }

    wx.showLoading({
      title: '发送中...',
    })

    let userInfo = app.globalData.userInfo

    wx.cloud.callFunction({
      name: "mourning_submitPersonInfo",
      data: {
        openid: app.globalData.openid,
        userInfo: {
          nickName: userInfo.nickName,
          gender: userInfo.gender,
          language: userInfo.language,
          city: userInfo.city,
          province: userInfo.province,
          country: userInfo.country,
          avatarUrl: userInfo.avatarUrl,
        },
        missedPerson: that.data.person
      },

      success: res => {
        console.log("mourning_submitPersonInfo result: ", res.result)
        that.getMissedPerson()
        wx.hideLoading()
      },

      fail: err => {
        console.log("error: ", err)
        wx.hideLoading()
      }
    })
  },

  getMissedPerson: function () {
    let that = this
    let missedPerson = {}

    wx.cloud.callFunction({
      name: "mourning_getMissedInfo",
      data: {
        openid: app.globalData.openid,
        name: that.data.person.name
      },
      success: res => {
        if (res.result.length == 0) {
          return missedPerson
        } else {
          missedPerson = res.result[0]
          let person = that.data.person
          person.id = missedPerson._id

          that.setCurrentPerson(person, that.data.index)
        }
      },
      fail: err => {
        console.log("error: ", err)
      }
    })
  },

  checkTime: function (date) {
    var selectedDate = new Date(date)
    var current = new Date()
    var diffTime = selectedDate.getTime() - current.getTime()

    if (diffTime > 43200000) {
      wx.showModal({
        title: '提示',
        content: "亲, 还没到时间!"
      })

      return false
    }

    return true
  },

  onLoad: function (option) {
    this.getSessionCode();
    let that = this
    let missedId = option.missedId
    console.log("missedId: ", missedId)

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
              console.info("用户信息为：" + JSON.stringify(res.userInfo, null, 2));
              app.globalData.userInfo = res.userInfo
              app.globalData.nickName = res.userInfo.nickName
              app.globalData.avatarUrl = res.userInfo.avatarUrl
            }
          })
        } else {
          this.setData({
            userInfoFlagYes: false,
          })
        }
      }
    })

    this.onGetOpenid(that.getPeople, { missedId: missedId })
    this.getTitle()
  },

  onGetUserInfo: function (e) {
    let that = this;
    // 获取用户信息
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success(res) {

              console.log("获取用户信息成功", res)
              app.globalData.userInfo = res.userInfo
              app.globalData.nickName = res.userInfo.nickName
              app.globalData.avatarUrl = res.userInfo.avatarUrl

              that.setData({
                userInfoFlagYes: true
              })
              // wx.reLaunch({
              //   url: 'index',
              // })
            },
            fail(res) {
              console.log("获取用户信息失败", res)
            }
          })
        } else {
          console.log("未授权=====")
        }
      }
    })
  },

  getSessionCode: function (e) {
    wx.login({
      success(res) {
        if (res.code) {
          console.log(res)
          app.globalData.sessionCode = res.code
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },

  onGetOpenid: function (action, data) {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid

        if (action != undefined) {
          action(data)
        }
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  onShareAppMessage: function (options) {
    var that = this;

    if (!that.data.show) {
      return
    }

    var shareObj = {
      title: "为逝去者" + that.data.person.name + "送上您的怀恋",
      path: '/pages/index/index?missedId=' + that.data.person.id,
      success: function (res) {
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
        }
      },
      fail: function () {
        // 转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          // 用户取消转发
        } else if (res.errMsg == 'shareAppMessage:fail') {
          // 转发失败，其中 detail message 为详细失败信息
        }
      },
      complete: function () {
        // 转发结束之后的回调（转发成不成功都会执行）
      }
    }
    console.log("shareObj, ", shareObj)
    return shareObj;
  },
})
