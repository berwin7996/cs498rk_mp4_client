var app = angular.module('mp4', ['ngRoute', 'mp4Controllers', 'mp4Services']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/tasklist', {
    templateUrl: 'partials/tasklist.html',
    controller: 'TaskController'
  }).
  when('/edittask/:id', {
    templateUrl: 'partials/edittask.html',
    controller: 'TaskController'
  }).
  when('/tasklist/:id', {
    templateUrl: 'partials/taskdetails.html',
    controller: 'TaskController'
  }).
  when('/addtask', {
    templateUrl: 'partials/addtask.html',
    controller: 'TaskController'
  }).
  when('/settings', {
    templateUrl: 'partials/settings.html',
    controller: 'SettingsController'
  }).
  when('/userlist', {
    templateUrl: 'partials/userlist.html',
    controller: 'UsersController'
  }).
  when('/userlist/:id', {
    templateUrl: 'partials/userdetails.html',
    controller: 'UsersController'
  }).
  when('/adduser', {
    templateUrl: 'partials/adduser.html',
    controller: 'UsersController'
  }).
  otherwise({
    redirectTo: '/settings'
  });
}]);
