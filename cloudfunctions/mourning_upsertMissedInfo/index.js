// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "soybean-app-test-r8a21" })
const db = cloud.database()

async function getMissedInfo(openid, name) {
  const res = await cloud.callFunction({
    name: 'mourning_getMissedInfo',
    data: {
      openid: openid,
      name: name
    }
  })
  
  return res.result
}

async function addMissedInfo(openid, missedPerson) {
  const res = await cloud.callFunction({
    name: 'mourning_addMissedInfo',
    data: {
      openid: openid,
      missedPerson: missedPerson
    }
  })

  return res.result
}

async function updateMissedInfo(missedId, missedPerson) {
  const res = await cloud.callFunction({
    name: 'mourning_updateMissedInfo',
    data: {
      missedId: missedId,
      missedPerson: missedPerson
    }
  })

  return res.result
}

async function upsertOperated(openid, missedId, operatedData) {
  const res = await cloud.callFunction({
    name: 'mourning_upsertOperated',
    data: {
      openid: openid,
      missedId: missedId,
      operatedData: operatedData
    }
  })
  
  return res.result
}

exports.main = async (event, context) => {
  let openid = event.openid
  let missedPerson = event.missedPerson
  let operatedData = {
      _openid: openid,
      missedId: "",
      flower: 0,
      incense: 0,
      candle: 0,
      tribute: 0,
  }
  
  let misseds = await getMissedInfo(openid, missedPerson.name)
  if (misseds.length == 0) {
    await addMissedInfo(openid, missedPerson)
    misseds = await getMissedInfo(openid, missedPerson.name)
    operatedData.missedId = misseds[0]._id
    await upsertOperated(openid, misseds[0]._id, operatedData)
  } else {
    await updateMissedInfo(misseds[0]._id, missedPerson)
    operatedData.missedId = misseds[0]._id
    await upsertOperated(openid, misseds[0]._id, operatedData)
  }
}