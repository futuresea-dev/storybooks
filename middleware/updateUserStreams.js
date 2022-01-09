'use strict';

const User = require('../models/User')
const request = require('request-promise-native')

const SONG_NAME = 'SOS (feat. Travis Barker)'
const lastFMAPiKey = 'ea81e6917706f4b0bc0da79e2e034591';


module.exports.updateUserStreams = async function (userID) {
    const users = await User.find({lastFMUsername: {$ne: null}}).sort({streamCount: 'descending'}).lean().limit(25);
    for (const user of users) {
        const lastFMUsername = user.lastFMUsername;
        var options = {
            uri: `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&format=json&username=${lastFMUsername}&api_key=${lastFMAPiKey}&artist=sueco&track=paralyzed`,
            method: "GET",
            json: true
        }
    
        try {
            var result = await request(options);
            if (result && result.track) {
                const streamCount = parseInt(result.track.userplaycount || 0);
                await User.findOneAndUpdate({ _id: user._id }, { streamCount })
            } else {
                return res.render('error/404')
            }
        } catch (err) {
            console.error(err);
        }
      }
}


module.exports.updateSignedinUserStreams = async function (userID) {
    const user = await User.findOne({_id: userID});
    const lastFMUsername = user.lastFMUsername;
    var options = {
        uri: `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&format=json&username=${lastFMUsername}&api_key=${lastFMAPiKey}&artist=sueco&track=paralyzed`,
        method: "GET",
        json: true
    }

    try {
        var result = await request(options);
        if (result && result.track) {
            const streamCount = parseInt(result.track.userplaycount || 0);
            const tickets = exports.calculatUserTickets(user);
            await User.findOneAndUpdate({ _id: user._id }, { streamCount, tickets })
        } else {
            return res.render('error/404')
        }
    } catch (err) {
        console.error(err);
    }

}


module.exports.mapUserRanks = async function (users) {
    let rank = 1;
    for (const user of users) {
        const userRank = ordinal_suffix_of(rank);
        const tickets = exports.calculatUserTickets(user);
        rank++;
        await User.findOneAndUpdate({ _id: user._id}, {rank: userRank, tickets})
    }
    return await User.find({}).sort({streamCount: 'descending'}).lean().limit(25);

}

module.exports.calculatUserTickets = function (user) {
    const streamCount = user.streamCount || 0;
    const tickets = Math.trunc(streamCount / 500);
    return tickets;
}

function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}