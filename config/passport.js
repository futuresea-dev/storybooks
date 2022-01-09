const DiscordStrategy = require('passport-discord').Strategy
const mongoose = require('mongoose')
const User = require('../models/User')

module.exports = function (passport) {
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: '/auth/discord/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          discordID: profile.id,
          discordUsername: profile.username,
          discordAvatar: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
          discordDiscriminator: profile.discriminator,
          email: profile.email,
          accessToken: accessToken,
          refreshToken: refreshToken
        }

        try {
          let user = await User.findOne({ discordUsername: profile.username })

          if (user) {
            done(null, user)
          } else {
            user = await User.create(newUser)
            done(null, user)
          }
        } catch (err) {
          console.error(err)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user))
  })
}
