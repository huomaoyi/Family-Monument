// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "soybean-app-test-r8a21" })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  let openid = event.openid
  let missedPerson = event.missedPerson

  let result = {}
  await db.collection("mourning_missed").add({
    data: {
      name: missedPerson.name,
      creator_openid: openid,
      birthDate: new Date(missedPerson.birthDate),
      lostDate: new Date(missedPerson.lostDate),
      missWords: missedPerson.missWords,
      created_at: new Date(),
      updated_at: new Date()
    },
    success: res => {
      console.log("add missed succeed, ", res)
      result = res
    },
    fail: err => {
      console.log("add missed failed, ", err)
      result = err
    }
  })

  return result
}