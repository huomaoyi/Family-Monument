// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "soybean-app-test-r8a21" })
const db = cloud.database()

async function getOperated(openid, missedId) {
  const res = await cloud.callFunction({
    name: 'mourning_getOperated',
    data: {
      openid: openid,
      missedId: missedId
    }
  })

  return res.result
}

async function addOperated(openid, operatedData) {
  const res = await cloud.callFunction({
    name: 'mourning_addOperated',
    data: {
      openid: openid,
      operatedData: operatedData
    }
  })

  return res.result
}

async function updateOperated(operatedId, operatedData) {
  const res = await cloud.callFunction({
    name: 'mourning_updateOperated',
    data: {
      operatedId: operatedId,
      operatedData: operatedData
    }
  })

  return res.result
}

exports.main = async (event, context) => {
  let openid = event.openid
  let missedId = event.missedId
  let operatedData = event.operatedData

  let operated = await getOperated(openid, missedId)
  if (operated.length == 0) {
    return await addOperated(openid, operatedData)
  } else {
    operatedData.flower = operated[0].flower + operatedData.flower
    operatedData.candle = operated[0].candle + operatedData.candle
    operatedData.incense = operated[0].incense + operatedData.incense
    operatedData.tribute = operated[0].tribute + operatedData.tribute
    return await updateOperated(operated[0]._id, operatedData)
  }
}