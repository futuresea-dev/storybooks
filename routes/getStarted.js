const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const request = require('request-promise');
const User = require('../models/User')


const lastFMAPiKey = 'ea81e6917706f4b0bc0da79e2e034591';
// @desc    Show add page
// @route   GET /stories/add

// @desc    Update story
// @route   PUT /stories/:id
router.post('/', ensureAuth, async (req, res) => {
  try {
    let user = req.user;
    const username = req.body.username;
    if (!user) {
      return res.render('error/404')
    }
    var options = {
        uri: `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${username}&api_key=${lastFMAPiKey}&format=json`,
        method: "GET",
        json: true
    }

    try {
        var result = await request(options);
        console.log(result);
        if (result && result.user) {
            user = await User.findOneAndUpdate({ _id: user.id }, {lastFMUsername: username})
            res.redirect('/dashboard')
        } else {
            return res.render('error/404')
        }
    } catch (err) {
        console.error(err);
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})


module.exports = router
