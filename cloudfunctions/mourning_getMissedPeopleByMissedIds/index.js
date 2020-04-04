// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "soybean-app-test-r8a21" })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

async function getOperatedCountByMissedId(missedId) {
  const res = await cloud.callFunction({
    name: 'mourning_getOperatedCountByMissedId',
    data: {
      missedId: missedId
    }
  })

  return res.result
}


// 云函数入口函数
exports.main = async (event, context) => {

  let missedIds = event.missedIds

   let res = await db.collection('mourning_missed').aggregate()
    .match(
      {
        _id: _.in(missedIds)
      }
    )
    .lookup({
      from: "mourning_operated",
      localField: "_id",
      foreignField: "missedId",
      as: "operatedData"
    })
    .replaceRoot({
      newRoot: $.mergeObjects([ $.arrayElemAt(['$operatedData', 0]), '$$ROOT' ])
    })
    .project({
      operatedData: 0
    })
    .end()

  console.log("res ", res)

  for(let index = 0; index < res.list.length; index ++) {
    let current = res.list[index]
    let missedCount = await getOperatedCountByMissedId(current.missedId)
    if (missedCount.length == 0) {
      continue
    }
    current.flower = missedCount[0].flower;
    current.candle = missedCount[0].candle;
    current.incense = missedCount[0].incense;
    current.tribute = missedCount[0].tribute;
    current.total = missedCount[0].total;
  }

  return res.list
}