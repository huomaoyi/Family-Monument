// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "soybean-app-test-r8a21" })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  let openid = event.openid
  let operatedData = event.operatedData

  let result = {}
  await db.collection("mourning_operated").add({
    data: {
      _openid: openid,
      missedId: operatedData.missedId,
      flower: operatedData.flower,
      incense: operatedData.incense,
      candle: operatedData.candle,
      tribute: operatedData.tribute,
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