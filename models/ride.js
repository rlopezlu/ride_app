var mongoose = require('mongoose');

var rideSchema = mongoose.Schema({
  person: String, 
  posterID: String, 
  email: String,
  date: String, 
  time: String, 
  price: String,
  departing: String, 
  arriving: String, 
  returning: String, 
  notes: String,
  user_ref: { type: String, ref: 'User' }
});

module.exports = mongoose.model('Ride', rideSchema);