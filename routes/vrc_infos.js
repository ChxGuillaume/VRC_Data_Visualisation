const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', vrcInfosMiddleware, async (req, res, next) => {
    const {data: userInfos} = await axios.get(`https://vrchat.com/api/1/auth/user?apiKey=${req.apiKey}`, {headers: {cookie: req.body.cookie}})

    res.json({status: 'ok', userInfos});
});

router.post('/friends', vrcInfosMiddleware, async (req, res, next) => {
    if (req.body.friends && Array.isArray(req.body.friends)) {
        const friendsData = await getFriends(req.apiKey, req.body.cookie, req.body.friends);
        const worlds = friendsData.filter(e => e.worldId && !['offline', 'private'].includes(e.worldId)).map(e => e.worldId);
        const worldsData = await getWorlds(req.apiKey, req.body.cookie, worlds);

        res.json({status: 'ok', friends: friendsData, worlds: worldsData});
    } else {
        res.status(422).json({status: 'invalid_friends'});
    }
});

function vrcInfosMiddleware(req, res, next) {
    const apiKeyRegexResult = req.body.cookie.match(/apiKey=(.*?);/);
    const authKeyRegexResult = req.body.cookie.match(/auth=(.*?);/);

    if (!apiKeyRegexResult || !authKeyRegexResult) res.status(422).json({status: 'invalid_cookie'});
    else {
        req.apiKey = apiKeyRegexResult[1];
        next()
    }
}

async function getFriends(apiKey, cookie, friends) {
    return new Promise((resolve, reject) => {
        const allRequests = friends.map(async (friend) => {
            const {data: friendData} = await axios.get(`https://vrchat.com/api/1/users/${friend}?apiKey=${apiKey}&userId=${friend}`, {headers: {cookie: cookie}})
            return friendData;
        })

        Promise
            .all(allRequests)
            .then((friendsData) => {
                resolve(friendsData);
            });
    })
}

async function getWorlds(apiKey, cookie, worlds) {
    return new Promise((resolve, reject) => {
        const allRequests = worlds.map(async (world) => {
            const {data: friendData} = await axios.get(`https://vrchat.com/api/1/worlds/${world}?apiKey=${apiKey}`, {headers: {cookie: cookie}})
            return friendData;
        })

        Promise
            .all(allRequests)
            .then((worldsData) => {
                resolve(worldsData);
            });
    })
}

module.exports = router;
