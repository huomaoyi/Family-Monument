// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "soybean-app-test-r8a21" })
const db = cloud.database()
const _ = db.command

async function getMissedInfosByIds(missedIds) {
  const res = await cloud.callFunction({
    name: 'mourning_getMissedInfosByIds',
    data: {
      missedIds: missedIds
    }
  })

  return res.result
}

// 云函数入口函数
exports.main = async (event, context) => {
  
  let openids = event.openids

  let operateds = await db.collection('mourning_operated').where({
    _openid: _.in(openids)
  }).get()

  console.log("operateds ", operateds)

  let missedIds = []

  for (let index = 0; index < operateds.data.length; index ++) {
    missedIds.push(operateds.data[index].missedId)
  }

  if (missedIds.length == 0) {
    return []
  }

  let res = await getMissedInfosByIds(missedIds)
  console.log("res ", res)

  return res
}