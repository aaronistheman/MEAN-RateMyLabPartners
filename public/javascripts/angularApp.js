/**
 * Much of this file's code was copied from this tutorial:
 * https://thinkster.io/tutorials/mean-stack/creating-an-angular-service-for-authentication
 */


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
    .state('login', {
      url: '/login',
      templateUrl: '/login.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        // redirect user to home state if already logged in
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    })
    .state('register', {
      url: '/register',
      templateUrl: '/register.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        // redirect user to home state if already logged in
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    });


	$urlRouterProvider.otherwise('home');
}]); // app.config()



app.factory('auth', [
'$http',
'$window',
function($http, $window) {
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
'auth',
function($scope, auth){

  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;

}]); // MainCtrl controller



app.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    })
  };
}]); // AuthCtrl controller