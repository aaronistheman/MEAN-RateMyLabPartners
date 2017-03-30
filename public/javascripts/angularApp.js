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
			url: '/home', // the url shown in the search bar
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
    // .state('login', {
    //   url: '/login',
    //   templateUrl: '/login.html',
    //   controller: 'AuthCtrl',
    //   onEnter: ['$state', 'auth', function($state, auth){
    //     // redirect user to home state if already logged in
    //     if(auth.isLoggedIn()){
    //       $state.go('home');
    //     }
    //   }]
    // })
    // .state('register', {
    //   url: '/register',
    //   templateUrl: '/register.html',
    //   controller: 'AuthCtrl',
    //   onEnter: ['$state', 'auth', function($state, auth){
    //     // redirect user to home state if already logged in
    //     if(auth.isLoggedIn()){
    //       $state.go('home');
    //     }
    //   }]
    // })
    .state('colleges', { // state for showing one college
      url: '/colleges/{id}',
      templateUrl: '/colleges.html',
      controller: 'CollegesCtrl',
      resolve: {
        college: ['$stateParams', 'colleges',
          function($stateParams, colleges) {
            // Use the 'colleges' service to retrieve the college
            // object
            return colleges.get($stateParams.id);
          }]
      }
    })
    .state('partners', { // state for showing one lab partner
      url: '/colleges/{collegeId}/partners/{partnerId}',
      templateUrl: '/lab-partners.html',
      controller: 'PartnersCtrl',
      resolve: {
        college: ['$stateParams', 'colleges',
          function($stateParams, colleges) {
            // Use the 'colleges' service to retrieve the college
            // object
            return colleges.get($stateParams.collegeId);
          }],
        labPartner: ['$stateParams', 'colleges',
          function($stateParams, colleges) {
            return colleges.getPartner($stateParams.collegeId,
              $stateParams.partnerId);
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

  // Create college
  c.create = function(college) {
    return $http.post('/colleges', college, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      // So Angular's data matches database's (that is, so
      // a back-end update will be instantly met with a front-end
      // update without having to fresh the page)
      c.colleges.push(data);
    });
  }; // create()

  c.getPartner = function(collegeId, partnerId) {
    return $http.get('/colleges/' + collegeId
      + '/partners/' + partnerId).then(function(res) {
        return res.data;
      });
  }; // getPartner()

  c.addPartner = function(collegeId, partner) {
    return $http.post('/colleges/' + collegeId
      + '/partners', partner, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    });
  }; // addPartner()

  c.addReviewForPartner = function(collegeId, partnerId, review) {
    return $http.post('/colleges/' + collegeId
      + '/partners/' + partnerId + '/reviews', review, {
        headers: {Authorization: 'Bearer '+auth.getToken()}
      });
  }; // addReviewForPartner()

  return c;
}]); // colleges factory




app.controller('MainCtrl', [
'$scope',
'$state',
'auth',
'colleges',
function($scope, $state, auth, colleges){

  $scope.colleges = colleges.colleges;

  $scope.isLoggedIn = auth.isLoggedIn;

  $scope.register = function(){
    auth.register($scope.newUser).error(function(error){
      $scope.errorRegistration = error;
    }).then(function(){
      // Erase the form
      $scope.newUser = {};

      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.returningUser).error(function(error){
      $scope.errorLogin = error;
    }).then(function(){
      // Erase the form
      $scope.returningUser = {};

      $state.go('home');
    })
  };

  $scope.addCollege = function(){
    if (!$scope.name || $scope.name === '') { return; }

    colleges.create({
      name: $scope.name
    })

    // Erase the form
    $scope.name = '';
  }; // addCollege()


  // Takes the user to the college page he searched for, if
  // he entered a valid college; else, gives error message
  $scope.showCollegePage = function() {
    if ($scope.collegeName != "") { // if the user entered a college name
      // Check if user entered valid college by attempting to find
      // corresponding <option> tag of the college.
      // (This jQuery selector is awkward because I had to use one
      // that would be friendly to ids that have spaces.)
      var collegeTag = $("option[id='" + $scope.collegeName + "']");

      if (collegeTag.length == 0) { // if user didn't enter valid college
        // return error message
        $scope.errorCollegeSearch = { message: "Dude, pick a valid college." };
      } else { // if user entered valid college
        $state.go('colleges', { id: collegeTag.data("database-id") });
      }
    }
  }; // showCollegePage()

}]); // MainCtrl controller



// app.controller('AuthCtrl', [
// '$scope',
// '$state',
// 'auth',
// function($scope, $state, auth){
//   $scope.user = {};

//   $scope.register = function(){
//     auth.register($scope.newUser).error(function(error){
//       $scope.error = error;
//     }).then(function(){
//       $state.go('home');
//     });
//   };

//   $scope.logIn = function(){
//     alert("Hullo");
//     auth.logIn($scope.returningUser).error(function(error){
//       $scope.error = error;
//     }).then(function(){
//       $state.go('home');
//     })
//   };
// }]); // AuthCtrl controller



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
'$state',
'colleges',
'college',
'auth',
function($scope, $state, colleges, college, auth){
  $scope.college = college;

  $scope.isLoggedIn = auth.isLoggedIn;

  $scope.addPartner = function() {
    if (!$scope.firstName || $scope.firstName === ''
      || !$scope.lastName || $scope.lastName === '') {
      $("#add-partner-form-error > span").text("Fill out all fields");
      return;
    }

    colleges.addPartner(college._id, {
      firstName: $scope.firstName,
      lastName: $scope.lastName,
    }).success(function(partner) {
      // Update front-end copy of the list of lab partners
      $scope.college.labPartners.push(partner);
    });

    // Erase the form
    $scope.firstName = $scope.lastName = '';
  }; // addPartner()

  // Takes the user to the lab partner page he searched for, if
  // he entered a valid lab partner; else, gives error message
  $scope.showLabPartnerPage = function() {
    if ($scope.partnerName != "") { // only proceed if user entered something
      // Check if user entered valid lab partner by attempting to find
      // the datalist (<option>) entry.
      // Use a jQuery selector that is friendly to ids with spaces.
      var partnerTag = $("option[id='" + $scope.partnerName + "']");

      if (partnerTag.length === 0) { // if invalid college
        // return error message
        $scope.error = { message: "Bruh, pick a valid lab partner."};
      } else { // if valid college
        // Go to that lab partner's page
        $state.go('partners', {
          collegeId: $scope.college._id,
          partnerId: partnerTag.data("database-id"),
        });
      }
    }
  }; // showLabPartnerPage()


}]); // CollegesCtrl controller



app.controller("PartnersCtrl", [
'$scope',
'colleges',
'college',
'labPartner',
'auth',
function($scope, colleges, college, labPartner, auth){
  $scope.isLoggedIn = auth.isLoggedIn;

  $scope.college = college;
  $scope.labPartner = labPartner;

  // For ratings, the number of digits to show after the decimal point
  $scope.ratingsPrecision = 1;

  $scope.updateAverageRating = function() {
    // Find average rating by dividing the sum of the ratings
    // (obtained with reduce()) by the number of ratings
    var sum = labPartner.reviews.reduce(function(acc, review) {
      return acc + review.rating;
    }, 0);
    $scope.averageRating = sum / labPartner.reviews.length;
  }

  $scope.averageRating = 0;
  $scope.updateAverageRating();

  $scope.addReview = function() {
    if (!$scope.class || $scope.class === ''
      || !$scope.rating || $scope.rating === ''
      || !$scope.body || $scope.body === '') { // if incomplete form
      $("#add-review-form-error > span").text("Fill out all fields");
    }
    else { // if complete form

      // Contact the Factory to get the review stored server-side
      colleges.addReviewForPartner(college._id, labPartner._id,
      {
        class: $scope.class,
        rating: $scope.rating,
        body: $scope.body,
      }).error(function(error){
        $scope.error = error;
      }).success(function(review) {
        // Update front-end reviews data
        $scope.labPartner.reviews.push(review);
        $scope.updateAverageRating();

        // Remove server-side error message (if any)
        $scope.error = "";
      });

      // Erase the form
      $scope.class = $scope.rating = $scope.body = '';
    }
  }; // addReview()

}]); // PartnersCtrl controller
