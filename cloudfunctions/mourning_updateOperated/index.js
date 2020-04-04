// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "soybean-app-test-r8a21" })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let operatedId = event.operatedId
  let operatedData = event.operatedData

  let result = {}
  await db.collection("mourning_operated").doc(operatedId).update({
    data: {
      flower: operatedData.flower,
      incense: operatedData.incense,
      candle: operatedData.candle,
      tribute: operatedData.tribute,
      updated_at: new Date()
    },
    success: res => {
      console.log("update mourning_operated succeed, ", res)
      result = res
    },
    fail: err => {
      console.log("update mourning_operated failed, ", err)
      result = err
    }
  })

  return result
}