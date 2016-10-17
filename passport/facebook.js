var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var fbConfig = require('../fb.js');

module.exports = function(passport) {

    passport.use('facebook', new FacebookStrategy({
        clientID        : fbConfig.appID,
        clientSecret    : fbConfig.appSecret,
        callbackURL     : fbConfig.callbackUrl,
        profileFields: 
          ['emails', 'displayName', 'name', 'photos', 
          'gender', 'profileUrl']
    },

    // facebook will send back the tokens and profile
    function(access_token, refresh_token, profile, done) {

    	//console.log('profile', profile);
      console.log('retrieving facebook information');
      //console.log('this is the end of profile\n');

		// asynchronous
		process.nextTick(function() {

			// find the user in the database based on their facebook id

          //var query = User.where({"fb":{id: profile.id}});
	        User.findOne({ 'fb.id': profile.id}, function(err, user) {
          // User.findOne({ 'id' : profile.id }, function(err, user) {
            console.log("looking for ", profile.id);
            console.log(user);

	        	// if there is an error, stop everything and return that
	        	// ie an error connecting to the database
	            if (err)
	                return done(err);

				// if the user is found, then log them in
	            if (user) {
                  console.log('found the user in the database');
	                return done(null, user); // user found, return that user

	            } else {
	                // if there is no user found with that facebook id, create them
                  console.log('this is a new user. Saving in database');

	                var newUser = new User();

					// set all of the facebook information in our user model
	                	                
	                newUser.fb.access_token = access_token; // we will save the token that facebook provides to the user	                
	                newUser.fb.firstName  = profile.name.givenName;
	                newUser.fb.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned
	                newUser.fb.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                  newUser.fb.displayName = profile.displayName;
                  newUser.fb.gender = profile.gender;
                  newUser.fb.accUrl = profile.profileUrl;
                  newUser.fb.photos = profile.photos[0].value;
                  newUser.fb.id    = profile.id; // set the users facebook id
					// save our user to the database
	                newUser.save(function(err) {
	                    if (err)
	                        throw err;

	                    // if successful, return the new user
	                    return done(null, newUser);
	                });
	            }
	        });
        });
    }));
};
