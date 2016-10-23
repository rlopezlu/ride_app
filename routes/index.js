var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var dbConfig = require('../db');
var User = require('../models/user');
var Ride = require('../models/ride');

//the mongoUrl
//var manualUrl = 'mongodb://localhost:27017/facebook';
var url = dbConfig.url;

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/fblogin');
}

router.get('/', function(req, res){
	res.redirect('home');
});


router.get('/fblogin', function(req, res){
	res.render('fblogin');
});

module.exports = function(passport){


	/* GET login page. */
	router.get('/home', isAuthenticated, function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('home', { message: req.flash('message') });
	});



	router.get('/ridelist', isAuthenticated, function(req, res){
		Ride.find({})
		.populate('user_ref')
		.exec(function(err, rides){
			if(err){
				console.log("there was an error populting ", err);
			} else if(rides.length){
				console.log("reading all rides ", rides);
				res.render('ridelist', {"ridelist": rides});
			} else{
				res.send('no documents');
			}
		});
		Ride.find({}, function(err, result){
			if(err){
				console.log("Unable to find users ", err);
			} else if(result.length){
				console.log("connected to mongo\nReading all ride posts");
				console.log(result);
				res.render('ridelist', {"ridelist": result});
			} else{
				res.send('no documents');
			}
		});
	});

	router.post('/editTrip', function(req, res){
		Ride.findByIdAndUpdate({_id:req.body._id}, {$set:{
			person : req.body.person,
			email : req.body.email,
			date : req.body.date,
			time : req.body.time,
			departing : req.body.departing,
			arriving : req.body.arriving,
			returning : req.body.returning,
			notes : req.body.notes,
			price : req.body.price,
			posterID : req.user.id,
			user_ref : req.user.id,
			}}, function(err,ride){
				if(err){
					console.log('unable to update ride ', err);
				} else{
					console.log('upated ride ', ride);
					res.redirect('home');
				}
		});


		newRide.save(function(err){
			if(err)
				console.log("ride was not saved, ", err);

			console.log("successfully saved using mongoose");
		});

		Ride.remove({_id:req.body._id}, function(err){
			if(err){
				console.log("unable to remove ",err);
			} else{
				console.log("removed ride with id " + req.body._id);
				res.redirect('/home');
			}
		});
	});


	router.get('/myPosts',  isAuthenticated, function(req, res){

		Ride.find({email: req.user.fb.email}, function(err, rides){
			console.log("my user id: ", req.user.id);
			console.log("my email: ", req.user.fb.email);
	    	if(err){
		      console.log("could not find ride", err);
		    } else if(rides.length){
		    	console.log('conencted to mongo\nlisting my all rides');
		    	console.log(rides);
		      res.render("myPosts", 
		      			{'myPosts': rides}
		      );
		    } else{
		      res.send('no documents');
		    }
	  });
	});


	router.get('/giveRide',  isAuthenticated, function(req, res){
		console.log(req.user);
		res.render('giveRide', {user: req.user});
	})

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true  
	}));

	router.post('/addtrip',  isAuthenticated, function(req, res){

		var newRide = new Ride();

		newRide.person = req.body.person;
		newRide.email = req.body.email;
		newRide.date = req.body.date;
		newRide.time = req.body.time;
		newRide.departing = req.body.departing;
		newRide.arriving = req.body.arriving;
		newRide.returning = req.body.returning;
		newRide.notes = req.body.notes;
		newRide.price = req.body.price,
		newRide.posterID = req.user.id;
		newRide.user_ref = req.user.id;

		console.log(newRide);
		newRide.save(function(err){
			if(err)
				console.log("user was not saved, ", err);

			console.log("successfully saved using mongoose");
			res.redirect("/home");
		});
});

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true  
	}));

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
		console.log(req, user);
		res.render('home', { user: req.user });
	});

	router.get('/account', isAuthenticated, function(req, res){
		res.render('account', {user: req.user});
	});


	//FIX THIS ASAP
	router.get('/deleteUserVerify', isAuthenticated, function(req, res){
		res.render('deleteUserVerify', {user: req.user});
	});

	router.get('/deleteUser', isAuthenticated, function(req, res){
		//console.log({user : req.user});
		console.log(req.user);
		User.remove({'fb.id': req.user.fb.id}, function(err){
			if(err){
				console.log("could not removed", err);
			}
			console.log("removed ", req.user.fb.id);
			res.redirect('/signout');
		});
	});

	/* Handle Logout */
	router.get('/signout',  isAuthenticated, function(req, res) {
		console.log('signing out user')
		req.logout();
		res.redirect('/');
	});

	router.get('/about', function(req, res){
		res.render('about');
	});

	// route for facebook authentication and login
	// different scopes while logging in
	//go here after clicking 'Login with facebook' button
	router.get('/login/facebook', 
		passport.authenticate('facebook', { scope : 'email' }
	));

	// handle the callback after facebook has authenticated the user
	router.get('/login/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/home',
			failureRedirect : '/home'
		})
	);

	router.get('/rides/:ride_id', function(req, res){
		console.log("looking for ride "+ req.params.ride_id);
		Ride.find({'_id': req.params.ride_id}, function(err, ride){
			if(err){
				console.log("unable to find ride :", err);
			} else{
				console.log('here is a ride', ride);
				res.render('rides', {ride});
			}
		})
	});

	router.get('/api/users/:user', function(req, res){
		console.log(req.params.user);
		User.findById(req.params.user, function(err, user){
			if(err){
				console.log("unable to access user " + req.params.user + " " + err);
			} else{
				console.log(user);
				res.json(user);
			}
		});
	});

	router.get('/api/rides/:ride_id', function(req, res){
		console.log(req.params.ride_id);
		Ride.find({'_id': req.params.ride_id}, function(err, ride){
			if(err){
				console.log("unable to find ride :", err);
			} else{
				console.log(ride);
				res.json(ride)
			}
		})
	});

	return router;
}





