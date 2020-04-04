// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "soybean-app-test-r8a21" })

async function getUserInfo(openid) {
  const res = await cloud.callFunction({
    name: 'getUserInfo',
    data: {
      openid: openid
    }
  })
  
  return res.result
}

async function addUserInfo(openid, userInfo) {
  const res = await cloud.callFunction({
    name: 'addUserInfo',
    data: {
      openid: openid,
      userInfo: userInfo
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
  let userInfo = event.userInfo
  let missedId = event.missedId
  let operatedData = event.operatedData

  let userData = await getUserInfo(openid)
  if (userData.length == 0) {
    await addUserInfo(openid, userInfo)
  }

  return await upsertOperated(openid, missedId, operatedData)
}

