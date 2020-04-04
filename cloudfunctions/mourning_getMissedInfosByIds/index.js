// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "soybean-app-test-r8a21" })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  let missedIds = event.missedIds

  let dbData = await db.collection('mourning_missed').where({
    _id: _.in(missedIds)
  }).get()

  console.log("dbData ", dbData)

  return dbData.data
}