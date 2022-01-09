const express = require('express')
const passport = require('passport')
const router = express.Router()
const request = require('request-promise');
const { ensureAuth } = require('../middleware/auth')
const User = require('../models/User');
const md5 = require('md5');
// @desc    Auth with Google
// @route   GET /auth/google
router.get('/discord', passport.authenticate('discord', { scope: ['identify', 'email'] }))

const lastFMAPiKey = 'ea81e6917706f4b0bc0da79e2e034591';
const lastFMSecret = '5eaf26daf94a88f33cf5fe5437bc0433';
// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  '/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/get-started')
  }
)


router.get('/lastfm/callback', ensureAuth, async (req, res) => {
  try {
    let user = req.user;
    const lastFMToken = req.query.token;
    if (!user) {
      return res.render('error/404')
    }
    let params = {
      api_key: lastFMAPiKey,
      token: lastFMToken,
      method: 'auth.getSession'
    }
    const api_sig = last_fm_sign(params);
    var options = {
        uri: `https://ws.audioscrobbler.com/2.0/?api_key=${lastFMAPiKey}&method=auth.getSession&format=json&token=${lastFMToken}&api_sig=${api_sig}`,
        method: "GET",
        json: true
    }

    try {
        var result = await request(options);
        console.log(result);
        if (result && result.session) {
            const lastFMUsername = result.session.name;
            user = await User.findOneAndUpdate({ _id: user.id }, {lastFMUsername})
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



function last_fm_sign(params){
  ss = "";
  st = [];
  so = {};
  so['api_key'] = params['api_key'];
  so['token'] = params['token'];
  so['method'] = 'auth.getSession';
  Object.keys(params).forEach(function(key){
      st.push(key); // Get list of object keys
  });
  st.sort(); // Alphabetise it 
  st.forEach(function(std){
      ss = ss + std + params[std]; // build string
  });
  ss += lastFMSecret;
      // console.log(ss + last_fm_data['secret']);
      // api_keyAPIKEY1323454formatjsonmethodauth.getSessiontokenTOKEN876234876SECRET348264386
  hashed_sec = md5(unescape(encodeURIComponent(ss)));
  return hashed_sec; // Returns signed POSTable object
}

// @desc    Logout user
// @route   /auth/logout
router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router
