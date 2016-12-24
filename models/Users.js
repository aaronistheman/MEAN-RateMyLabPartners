var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');


var PasswordNumIterations = 1000;
var PasswordKeyLength = 64;



var UserSchema = new mongoose.Schema({
  username: {type: String, unique: true},
	hash: String,
	salt: String
});



UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  
  this.hash = crypto.pbkdf2Sync(password, this.salt,
    PasswordNumIterations, PasswordKeyLength).toString('hex');
};



UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt,
    PasswordNumIterations, PasswordKeyLength).toString('hex');

  return this.hash === hash;
};


UserSchema.methods.generateJWT = function() {

  // set expiration to 60 days from today
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, 'SECRET');
};


mongoose.model('User', UserSchema);