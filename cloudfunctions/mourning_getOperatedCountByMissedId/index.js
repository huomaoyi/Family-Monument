// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "soybean-app-test-r8a21" })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  let missedId = event.missedId

  let res = await db.collection('mourning_operated').where({
    missedId: missedId
  }).get()

  console.log("res ", res)

  if (res.data.length == 0) {
    return res.data
  }

  let flower = 0;
  let candle = 0;
  let incense = 0;
  let tribute = 0;
  for (let index = 0; index < res.data.length; index ++) {
    flower = flower + res.data[index].flower
    candle = candle + res.data[index].candle
    incense = incense + res.data[index].incense
    tribute = tribute + res.data[index].tribute
  }

  let data = res.data[0]
  data.flower = flower;
  data.candle = candle;
  data.incense = incense;
  data.tribute = tribute
  data.total = flower + candle + incense + tribute

  return [data]
}