// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "soybean-app-test-r8a21" })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  let openid = event.openid
  let userInfo = event.userInfo

  let result = {}
  await db.collection("user_info").add({
    data: {
      _openid: openid,
      nickName: userInfo.nickName,
      gender: userInfo.gender,
      language: userInfo.language,
      city: userInfo.city,
      province: userInfo.province,
      country: userInfo.country,
      avatarUrl: userInfo.avatarUrl,
      created_at: new Date(),
      updated_at: new Date()
    },
    success: res => {
      console.log("data ", res)
      result = res
    },
    fail: err => {
      console.log(err)
      result = err
    }
  })

  return result
}