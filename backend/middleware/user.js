

exports.doJwtEgalUserId = (tokenUserId, userId) => {
  if (tokenUserId == userId) {
    return true
}
}

exports.isValidPassword = (password) => {
  return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/.test(password)
}


exports.isValidEmail = (email) => {
    return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
        email)
  }
  