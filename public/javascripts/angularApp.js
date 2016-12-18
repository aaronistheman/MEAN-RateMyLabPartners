var app = angular.module('rateMyLabPartners', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl'
		})


	$urlRouterProvider.otherwise('home');
}]); // app.config()



/**
 * The below factory is copied from:
 * https://thinkster.io/tutorials/mean-stack/creating-an-angular-service-for-authentication
 */
app.factory('auth', [
'$http',
'$window',
function($htpp, $window) {
	var auth = {};

  auth.saveToken = function(token){
    $window.localStorage['rate-token'] = token;
  };

  auth.getToken = function(){
    return $window.localStorage['rate-token'];
  };

  // Returns true if the user is logged in
  auth.isLoggedIn = function(){
    var token = auth.getToken();

    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      // check if the payload expired
      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  // Returns username of the user that's logged in
  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.username;
    }
  };

  auth.register = function(user){
    return $http.post('/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  }

  auth.logIn = function(user){
    return $http.post('/login', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.logOut = function(){
    $window.localStorage.removeItem('rate-token');
  };

  return auth;
}]); // auth factory



app.controller('MainCtrl', [
'$scope',
function($scope){
	$scope.teehee = 'blake';



}]); // MainCtrl controller