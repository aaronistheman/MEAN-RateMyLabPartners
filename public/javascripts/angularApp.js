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
			controller: 'MainCtrl',
      resolve: {
        // Whenever this state is entered, query all colleges from
        // the backend before state finishes loading. The colleges
        // are given to collegesPromise, but we don't care about
        // that, we just need the colleges loaded.
        collegesPromise: ['colleges', function(colleges) {
          return colleges.getAll();
        }]
      }
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
    })
    .state('colleges', { // state for showing one college
      url: '/colleges/{id}',
      templateUrl: '/colleges.html',
      controller: 'CollegesCtrl',
      resolve: {
        // Whenever this state is entered, query all lab partners from
        // the backend before state finishes loading, JUST
        // to get them loaded. The 'labPartners' refers to
        // the factory
        partnersPromise: ['labPartners', function(partners) {
          return partners.getAll();
        }],
        college: ['$stateParams', 'colleges',
          function($stateParams, colleges) {
            // Use the 'colleges' service to retrieve the college
            // object
            return colleges.get($stateParams.id);
          }]
      }
    });


	$urlRouterProvider.otherwise('home');
}]); // app.config()



var LocalStorageTokenName = 'rate-token';
app.factory('auth', [
'$http',
'$window',
function($http, $window) {
	var auth = {};

  auth.saveToken = function(token){
    $window.localStorage[LocalStorageTokenName] = token;
  };

  auth.getToken = function(){
    return $window.localStorage[LocalStorageTokenName];
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
    $window.localStorage.removeItem(LocalStorageTokenName);
  };

  return auth;
}]); // auth factory





app.factory('colleges', ['$http', 'auth', function($http, auth) {
  var c = {
    colleges: []
  };

  c.get = function(id) {
    return $http.get('/colleges/' + id).then(function(res) {
      return res.data;
    });
  }

  c.getAll = function() {
    return $http.get('/colleges').success(function(data){
      // create deep--not shallow--copy
      angular.copy(data, c.colleges);
    })
  };

  c.create = function(college) {
    return $http.post('/colleges', college).success(function(data){
      // So Angular's data matches database's
      c.colleges.push(data);
    });
  }; // create()

  return c;
}]); // colleges factory




app.factory('labPartners', ['$http', 'auth', function($http, auth) {
  var l = {
    labPartners: []
  };

  l.getAll = function() {
    return $http.get('/partners').success(function(data){
      // create deep--not shallow--copy
      angular.copy(data, l.labPartners);
    })
  };

  l.create = function(labPartner) {
    return $http.post('/partners', labPartner).success(function(data){
      // So Angular's data matches database's
      l.labPartners.push(data); 
    });
  }; // create()

  return l;
}]); // labPartners factory




app.controller('MainCtrl', [
'$scope',
'$state',
'auth',
'colleges',
function($scope, $state, auth, colleges){

  $scope.colleges = colleges.colleges;

  $scope.isLoggedIn = auth.isLoggedIn;

  $scope.addCollege = function(){
    if (!$scope.name || $scope.name === '') { return; }

    colleges.create({
      name: $scope.name
    })

    // Erase the form
    $scope.name = '';
  }; // addCollege()


  $scope.showCollegePage = function() {
    if ($scope.collegeName != "") { // if the user entered a college name
      // Check if user entered valid college by attempting to find
      // corresponding <option> tag of the college.
      // (This jQuery selector is awkward because I had to use one
      // that would be friendly to ids that have spaces.)
      var collegeTag = $("option[id='" + $scope.collegeName + "']");

      if (collegeTag.length == 0) { // if user didn't enter valid college
        // return error message
        $scope.error = { message: "Dude, pick a valid college." };
      } else { // if user entered valid college
        $state.go('colleges', { id: collegeTag.data("database-id") });
      }
    }
  }; // showCollegePage()

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



app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth) {
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]); // NavCtrl controller



app.controller("CollegesCtrl", [
'$scope',
'college',
'auth',
'labPartners',
function($scope, college, auth, labPartners){
  $scope.college = college;
  $scope.partners = labPartners.labPartners;

  $scope.isLoggedIn = auth.isLoggedIn;

  $scope.addPartner = function() {
    if (!$scope.firstName || $scope.firstName === ''
      || !$scope.lastName || $scope.lastName === '') {
      $("#add-partner-form-error > span").text("Fill out all fields");
      return;
    }

    labPartners.create({
      firstName: $scope.firstName,
      lastName: $scope.lastName
    });

    // Erase the form
    $scope.firstName = $scope.lastName = '';
  }; // addPartner()

  $scope.showLabPartnerSearchForm = function() {
    alert("Sup");
  }; // showLabPartnerSearchForm()


}]); // CollegesCtrl controller
