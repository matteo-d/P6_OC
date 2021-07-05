exports.doUserExist = (DbUsers, userId)=> {
 const User = require('../models/User')
DbUsers.exists(
    // User.exist renvoi Boolean
    { _id: userId},
    (error,userExist) => {
      // Verification que l'user Existe bien, Sauce heat -10 et requete contient une image
      if (
        userExist) {
            return true }
            else {
                return error
        }
    })
}

exports.doJwtEgalUserId = (tokenUserId, userId) => {
  if (tokenUserId == userId) {
    return true
}
}

exports.isValidPassword = (password) => {
  return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/.test(password)
}
