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

async function upsertMissedInfo(openid, missedPerson) {
  const res = await cloud.callFunction({
    name: 'mourning_upsertMissedInfo',
    data: {
      openid: openid,
      missedPerson: missedPerson
    }
  })
  
  return res.result
}

exports.main = async (event, context) => {
  let openid = event.openid
  let userInfo = event.userInfo
  let missedPerson = event.missedPerson

  let userData = await getUserInfo(openid)
  if (userData.length == 0) {
    await addUserInfo(openid, userInfo)
  }

  return await upsertMissedInfo(openid, missedPerson)
}

