var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});


var College = mongoose.model('College');
var LabPartner = mongoose.model('LabPartner');




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// attempt to register
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  // Check if the username is taken
  User.findOne({ username: req.body.username}).exec()
    .then(function(foundUser) {
      if (foundUser) // if found a user with the given name
        return res.status(400).json({message: 'Username already taken'});
      else
      {
        var user = new User();

        user.username = req.body.username;

        user.setPassword(req.body.password);

        user.save(function (err){
          if(err){ return next(err); }

          return res.json({token: user.generateJWT()})
        });
      }
    });
}); // register route


// attempt to login
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
}); // login route



// Gets all College instances
router.get('/colleges', function(req, res, next) {
  College.find(function(err, colleges) {
    if (err) {
      return next(err);
    }

    res.json(colleges);
  });
});



// Add new College instance
router.post('/colleges', auth, function(req, res, next) {
  var college = new College(req.body);

  college.save(function(err, college) {
    if(err){ return next(err); }

    res.json(college);
  });
});


// load the college parameter
router.param('college', function(req, res, next, id) {
  var query = College.findById(id);

  query.exec(function(err, college) {
    if (err) { return next(err); }
    if (!college) { return next(new Error("can't find college")); }

    req.college = college;
    return next();
  });
});


router.get('/colleges/:college', function(req, res, next) {
  // Load the lab partners of that college as well
  req.college.populate('labPartners', function(err, college) {
    if (err) return next(err);

    res.json(college);
  });
});



// Gets all LabPartner instances
router.get('/partners', function(req, res, next) {
  LabPartner.find(function(err, partners) {
    if (err) {
      return next(err);
    }

    res.json(partners);
  });
});



// Add new LabPartner instance
router.post('/colleges/:college/partners', auth, function(req, res, next) {
  var partner = new LabPartner(req.body);
  partner.college = req.college;

  // Save the lab partner to the database
  partner.save(function(err, partner) {
    if(err) return next(err);

    // Update the college
    req.college.labPartners.push(partner);
    req.college.save(function(err, college) {
      if(err) return next(err);

      res.json(partner);
    });
  });
});


module.exports = router;
