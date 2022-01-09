const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const { updateUserStreams, mapUserRanks, updateSignedinUserStreams } = require('../middleware/updateUserStreams');
const Story = require('../models/Story')
const User = require('../models/User')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  })
})


router.post('/handle-spin', ensureAuth, async (req, res) => {
  try {
    const userID = req.user._id;
    const winningTickets = parseInt(req.body.winnings.match(/\d+/)[0]);
    let userUpdates = {};
    if (winningTickets === 0) {
      userUpdates.negativeTickets = (req.user.negativeTickets || 0) + 1;
    } else {
      userUpdates.winningTickets = (req.user.winningTickets || 0) + winningTickets;
    }
    await User.findOneAndUpdate({ _id: userID}, userUpdates);
    await updateUserStreams();
    const users = await User.find({}).sort({streamCount: 'descending'}).lean().limit(15);
    const rankedUsers = await mapUserRanks(users);
    const user = await User.findOne({_id: userID}).lean()
    const winner = users[0];
    res.render('dashboard', {
      user,
      winner,
      users: rankedUsers
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


router.get('/prizes', ensureAuth, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.user.id}).lean()
    res.render('prizes/index', {
      user
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})



// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    await updateUserStreams();
    const users = await User.find({}).sort({streamCount: 'descending'}).lean().limit(25);
    const rankedUsers = await mapUserRanks(users);
    await updateSignedinUserStreams(req.user.id);
    const user = await User.findOne({_id: req.user.id}).lean();
    const winner = users[0];
    res.render('dashboard', {
      user,
      winner,
      users: rankedUsers
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


router.get('/get-started', ensureAuth, async (req, res) => {
  try {
    if (req.user && req.user.lastFMUsername) {
      return res.redirect('/dashboard')
    }
    const stories = await Story.find({ user: req.user.id }).lean()
    res.render('getStarted', {
      name: req.user.firstName,
      stories,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router
