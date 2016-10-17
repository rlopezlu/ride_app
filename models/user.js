var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  fb: {
    id: String,
    access_token: String,
    firstName: String,
    lastName: String,
    email: String,
    displayName: String, 
    gender: String, 
    accUrl: String, 
    photos: String, 
  }
});

module.exports = mongoose.model('User', userSchema);