// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "soybean-app-test-r8a21" })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let missedId = event.missedId
  let missedPerson = event.missedPerson

  let result = {}
  await db.collection("mourning_missed").doc(missedId).update({
    data: {
      name: missedPerson.name,
      birthDate: new Date(missedPerson.birthDate),
      lostDate: new Date(missedPerson.lostDate),
      missWords: missedPerson.missWords,
      updated_at: new Date(),
    },
    success: res => {
      console.log("update missed succeed, ", res)
      result = res
    },
    fail: err => {
      console.log("update missed failed, ", err)
      result = err
    }
  })

  return result
}