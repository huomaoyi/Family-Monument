// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "soybean-app-test-r8a21" })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  let openid = event.openid

  let res = await db.collection('user_info').where({
    _openid: _.eq(openid)
  }).get()

  console.log("res ", res)

  return res.data
}