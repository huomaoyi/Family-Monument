// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "soybean-app-test-r8a21" })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  
  let openid = event.openid
  let name = event.name

  let dbData = await db.collection('mourning_missed').where({
    creator_openid: openid,
    name: name
  }).get()

  console.log("dbData ", dbData)

  return dbData.data
}