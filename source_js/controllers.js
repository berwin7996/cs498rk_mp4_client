var mp4Controllers = angular.module('mp4Controllers', []);

mp4Controllers.controller('FirstController', ['$scope', 'CommonData'  , function($scope, CommonData) {
  $scope.data = "";
  $scope.displayText = ""

  $scope.setData = function(){
    CommonData.setData($scope.data);
    $scope.displayText = "Data set"

  };

}]);

mp4Controllers.controller('TaskController', ['$scope', '$routeParams', '$http', 'Users', 'UserID', 'Tasks', 'TaskID', '$window', '$location' , function($scope, $routeParams, $http, Users, UserID, Tasks, TaskID, $window, $location) {
  $scope.users = [];
  $scope.curtaskname = '';
  $scope.curtaskdescription = '';
  $scope.curtaskdeadline = '';
  $scope.curtaskdeadline_date = '';
  $scope.curtaskid = $routeParams.id;
  $scope.curtaskuser = '';
  // this holds the prev for when we edit (if different, then we have to remove from orig)
  $scope.curtaskuser_prev = '';
  $scope.curtaskuserid = '';
  $scope.hasUser = false;

  // for prev/next buttons
  $scope.curskip = 0;
  $scope.curlimit = 10;
  $scope.curcount = 0;

  $scope.responsetext = '';


  /*
  getting the $scope.curtasknam if it exists
  */
  if ($scope.curtaskid) {
    console.log($scope.curtaskid);

    TaskID.get($scope.curtaskid).then(function(data){
      // lolwat
      var task = data.data.data;
      console.log(task);
      $scope.curtaskname = task.name;
      $scope.curtaskdescription = task.description;
      $scope.curtaskdeadline = task.deadline;
      $scope.curtaskdeadline_date = new Date($scope.curtaskdeadline);
      $scope.curtaskuser = task.assignedUser;
      $scope.curtaskuser_prev = task.assignedUser;
      $scope.curtaskusername = task.assignedUserName;
      $scope.curtaskcompleted = task.completed;

      if ($scope.curtaskuser !== 'unassigned'){
        UserID.get($scope.curtaskuser).then(function(user_data){
          $scope.curtaskuserdata = user_data.data.data;
        });  
      }
      
      if($scope.curtaskuser === 'unassigned'){
        $scope.hasUser = false;
      }
      else {
        $scope.hasUser = true;
      }
    });
  }


  // filter tasks object that we do a $scope.$watch on for getting the tasks
  $scope.filters = {
    completed: 'pending',
    orderby: 'desc',
    sortby: 'deadline'
  }

  // watching the filters for change
  // if we have a change, we must do a new get request for tasks
  // using the filters that we have specified
  // deep watch
  $scope.$watch('filters', function() {

    // reset the params if we change filters
    $scope.curskip = 0;
    $scope.curlimit = 10;
    $scope.curcount = 0;

    $scope.getTasks();
  }, true);

  // retrieving users for the tasks to get the assignednames from
  Users.get().success(function(data){
    $scope.users = data.data;
  });


  // getting the tasks 
  $scope.tasks = [];

  // get the tasks based on query
  $scope.getTasks = function() {
    // build the filters query

    // completed/not completed/all
    var whereQuery = {};
    switch($scope.filters['completed']) {
      case 'pending':
        whereQuery['completed'] = false;
        break;
      case 'completed':
        whereQuery['completed'] = true;
        break;
      default:
        break;
    }
    var sortQuery = {};
    var sortName = ''
    var sortDir = 0;

    // what to sort by
    switch($scope.filters['sortby']) {
      case 'name':
        sortName = 'name';
        break;
      case 'username':
        sortName = 'assignedUserName';
        break;
      case 'dateCreated':
        sortName = 'dateCreated';
        break;
      case 'deadline':
        sortName = 'deadline';
        break;
    }

    sortDir = ($scope.filters['orderby'] == 'asc') ? 1 : -1;

    sortQuery[sortName] = sortDir;

    // code
    var getQuery = {}
    getQuery['where'] = whereQuery;
    getQuery['sort'] = sortQuery;
    getQuery['limit'] = $scope.curlimit;
    getQuery['skip'] = $scope.curskip;
    // console.log(getQuery);

    console.log(getQuery);
    getQuery['count'] = false;

    Tasks.get(getQuery).success(function(data){
      $scope.tasks = data.data;
      // next query gets count
      getQuery['count'] = 'true';
      delete getQuery['limit'];
      delete getQuery['skip'];
      // get the count which makes pagination possible
      console.log(getQuery);
      Tasks.get(getQuery).success(function(data){
        console.log(data.data);
        $scope.curcount = data.data;
        console.log($scope.curcount);
      });
    });

    
  }

  $scope.addTask = function() {
    var task = {}
    task.name = $scope.addtask_name;
    task.description = $scope.addtask_description;
    task.deadline = $scope.addtask_deadline;
    task.assignedUser = $scope.addtask_assignedUser;
    task.completed = false;

    if (task.assignedUser === undefined) {
      task.assignedUser = 'unassigned';
      task.assignedUserName = 'unassigned';
    }
    else {
      // since we can only get the userid from the form, find the username from iterating through $scope.users
      for (var k = 0; k < $scope.users.length; k++) {
        if ($scope.users[k]['_id'] === task.assignedUser) {
          task.assignedUserName = $scope.users[k]['name'];

        }
      }
    }
    
    
    // clear inputs
    $scope.addtask_name = '';
    $scope.addtask_description = '';
    console.log(task);
    Tasks.post(task).then(function(data){
      // on success
      // add the task to respective user
      var userid = data.data.data['assignedUser'];
      var taskid = data.data.data['_id'];
      var task = data.data.data;

      console.log('hi');
      if (userid !== 'unassigned'){
        UserID.get(userid).then(function(user) {
          console.log(user);
          user = user.data.data;
          user.pendingTasks.push(task._id);
          UserID.put(userid, user).then(function(user_data){
            //success
            // console.log(userid + ' has ' + taskid + 'added');
            $scope.responsetext = user_data.data.message;

          });
        });
      }
    },
    function(data){
      // on failure
    });

  }

  // if($scope.curskip == 0) {
  //   $scope.paginateLeft = false;
  // }
  // if($scope.curskip )

  // pagination, onyl be able to skip until we are at the end
  // only able to prev until the beginning
  $scope.paginateNext = function() {

    if ($scope.curskip + $scope.curlimit < $scope.curcount){
      $scope.curskip = $scope.curskip + $scope.curlimit;
      $scope.getTasks();
    }
  }
  $scope.paginatePrev = function() {
    if ($scope.curskip - $scope.curlimit >= 0){
      $scope.curskip = $scope.curskip - $scope.curlimit;
      $scope.getTasks();
    }
  }

  $scope.editTask = function() {
    var task = {}
    task._id = $scope.curtaskid;
    task.name = $scope.curtaskname;
    task.description = $scope.curtaskdescription;
    task.deadline = $scope.curtaskdeadline_date;
    task.assignedUser = $scope.curtaskuser;
    task.completed = $scope.curtaskcompleted;

    
    // since we can only get the userid from the form, find the username from iterating through $scope.users
    for (var k = 0; k < $scope.users.length; k++) {
      if ($scope.users[k]['_id'] == task.assignedUser) {
        task.assignedUserName = $scope.users[k]['name'];

      }
    }

    if (task.assignedUser === undefined) {
      task.assignedUser = 'unassigned';
      task.assignedUserName = 'unassigned';
    }


    if (task.assignedUser !== 'unassigned'){
      TaskID.put($scope.curtaskid, task).then(function(data){
        // on success
        console.log('edited task');
        console.log(data);
        var userid = data.data.data['assignedUser'];
        var taskid = data.data.data['_id'];
        var completed = data.data.data['completed'];

        var olduser = {};
        UserID.get($scope.curtaskuser_prev).then(function(user) {
          olduser = user.data.data;
          console.log('olduser');
          console.log(olduser);

          // have to remove from old if userid is different
          UserID.get($scope.curtaskuser).then(function(user) {
            curuser = user.data.data;
            console.log('curuser');
            console.log(curuser);

            if (olduser._id !== curuser._id) {
              console.log('changed user!!!');
              if(task.completed){
                var index = olduser.pendingTasks.indexOf(task._id);
                olduser.pendingTasks.splice(index, 1);
                var index = curuser.pendingTasks.indexOf(task._id);
                curuser.pendingTasks.splice(index, 1);
                UserID.put(olduser._id, olduser).then(function(user_data){
                  //success
                  UserID.put(curuser._id, curuser).then(function(user_data){
                    //success
                    $scope.responsetext = user_data.data.message;
                  });
                });
              }
              else{
                // set to not complete
                var index = olduser.pendingTasks.indexOf(task._id);
                olduser.pendingTasks.splice(index, 1);
                curuser.pendingTasks.push(task._id);
                UserID.put(olduser._id, olduser).then(function(user_data){
                  //success
                  UserID.put(curuser._id, curuser).then(function(user_data){
                    //success
                    $scope.responsetext = user_data.data.message;
                  });
                });
              }
            }
            else{
              console.log('didn\'t change user');
              var index = olduser.pendingTasks.indexOf(task._id);
              olduser.pendingTasks.splice(index, 1);
              UserID.put(olduser._id, olduser).then(function(user_data){
                //success
                olduser.pendingTasks.push(task._id);
                UserID.put(olduser._id, olduser).then(function(user_data){
                  $scope.responsetext = user_data.data.message;
                }); 
              });
            }
          
            
          });
        });
        
        
        
      },
      function(data){
        // on failure
      });
    }
    else {
      TaskID.put(task.assignedUser, task).then(function(data){
        console.log('task edited');
        var userid = data.data.data['assignedUser'];
        console.log(userid);
        var taskid = data.data.data['_id'];
        var olduser = {};
        UserID.get($scope.curtaskuser_prev).then(function(user) {
          olduser = user.data.data;
          var index = olduser.pendingTasks.indexOf(task._id);
          olduser.pendingTasks.splice(index, 1);
          // have to remove from old if userid is different
          UserID.put($scope.curtaskuser_prev, olduser).then(function(user_data){
            //success
            $scope.responsetext = user_data.data.message;
          });
        });
        
        
        
      },
      function(data){
        // on failure
      });
    }
    

  }
  $scope.delete = function(task) {
    console.log('attemping delete for ' + task._id);
    var userid = ''; //store user id to remove from
    TaskID.get(task._id).then(function(data){
      console.log(data.data.data);
      userid = data.data.data.assignedUser;
        // first delete the task
        // then delete the taskid from the task's user's pending tasks
        TaskID.delete(task._id).then(
          function(data) {
            // success
            if (userid !== 'unassigned'){
              UserID.get(userid).then(function(data) {
                user = data.data.data;
                var index = user.pendingTasks.indexOf(task._id);
                user.pendingTasks.splice(index, 1);
                // console.log(data);
                UserID.put(userid, user).then(function(user_data){
                  $scope.getTasks();
                  console.log('deleted a task!');
                });
              });
              
            }
            else{
              $scope.getTasks();
            }
            
          },
          function(data) {
            // failure
            $scope.getTasks();
            res.json({message:'Not found', data:[]});
          }
      );
    });

    
  }

}]);



























mp4Controllers.controller('UsersController', ['$scope', '$routeParams', '$http', 'Users', 'UserID', 'Tasks', 'TaskID', '$window', '$location' , function($scope, $routeParams, $http, Users, UserID, Tasks, TaskID, $window, $location) {
  $scope.users = [];
  $scope.curuserid = $routeParams.id;
  $scope.curuser = {};

  // store current and completed tasks separately
  $scope.curtasks = [];
  $scope.comptasks = [];
  // this changes to show that a new user was added
  $scope.responsetext = '';

  $scope.getUsers = function() {
    Users.get().success(function(data){
      $scope.users = data.data;
    });
  }
  $scope.getUsers();


  $scope.getTasks = function(userid) {
    $scope.curtasks = [];
    if (userid !== 'unassigned'){
      UserID.get(userid).then(function(data){
        $scope.curuser = data.data.data;

        // iterate to fill curtasks
        for (var i = 0; i < $scope.curuser['pendingTasks'].length; i++) {
          TaskID.get($scope.curuser['pendingTasks'][i]).then(function(task){
            // success
            $scope.curtasks.push(task.data.data);
          });
        }
      });
    }
  }

  /*
  getting the $scope.curuser if we have it in the routeparams
  */
  if ($scope.curuserid) {
    $scope.getTasks($scope.curuserid);
  }

  

  /* 
  adding a user from the add user page
  */
  $scope.addUser = function() {
    var user = {};
    user.name = $scope.adduser_name;
    user.email = $scope.adduser_email;



    var user_data = $.param({
      name: user.name,
      email: user.email
    });
    
    // clear inputs
    $scope.adduser_name = '';
    $scope.adduser_email = '';

    // validate what angular cant
    if (typeof user.email === undefined) {
      $scope.responsetext = 'Invalid Email';
      return;
    }

    Users.post(user).then(function(data){
      console.log(data);        
      // if successful, show that new user added 
      if (data.data.message === 'OK'){
        $scope.responsetext = user.name + ' was added.';
      }
      else {
        $scope.responsetext = data.data.message;
      }

    });

  }

  // http://stackoverflow.com/questions/18344569/setting-ng-href-in-tr-elements
  $scope.showUser = function(user) {
    $location.path('#/users/' + user._id);
  };

  $scope.completeTask = function(task) {
    task.completed = true;
    TaskID.put(task._id, task).then(function(data) {
      console.log(data);
      // remove task from pending
      var task = data.data.data;
      if (task.assignedUser !== 'unassigned'){
        UserID.get(task.assignedUser).then(function(user){
          user = user.data.data;
          var index = user.pendingTasks.indexOf(task._id);
          console.log(user.pendingTasks);
          console.log(index);
          user.pendingTasks.splice(index, 1);
          console.log(user.pendingTasks);
          console.log(user);
          UserID.put(user._id, user).then(function(data) {
            // console.log(data.data.pendingTasks);
            $scope.getTasks(user._id);

          });
        });
      }
      
    });

    
    
  };

  $scope.uncompleteTask = function(task) {
    task.completed = false;
    TaskID.put(task._id, task).then(function(data) {
      // add task from pending
      var task = data.data.data
      console.log(task);
      if (task.assignedUser !== 'unassigned'){
        UserID.get(task.assignedUser).then(function(user){
          user = user.data.data;
          console.log(user.pendingTasks);
          user.pendingTasks.push(task._id);
          console.log(user.pendingTasks);
          UserID.put(user._id, user).then(function(data) {
            console.log(data);
            $scope.getTasks(user._id);
            $scope.showCompleted();
          });
        });
      }
      
    });

    
    
  };

  $scope.showCompleted = function() {
    Tasks.get({ 'where' :{'completed':true, 'assignedUser':$scope.curuserid} }).then(function(data) {
      $scope.comptasks = data.data.data;
    });
  }

  // needs to delete the user and change the task assigned user to unassigned
  $scope.delete = function(user) {
    console.log('attempting delete for ' + user._id);

    UserID.delete(user._id).then(
      function(data) {
        // success
        // get the pending tasks
        // var user = data.data.data;
        var userid = user['assignedUser'];
        Tasks.get({'where':{'assignedUser':user._id}}).then(function(tasks) {
          tasks = tasks.data.data;
          console.log(tasks);
          for (var i = 0; i < tasks.length; i++){
            console.log(tasks[i]['_id']);
            var task = tasks[i];
            task.assignedUser = 'unassigned';
            task.assignedUserName = 'unassigned';
            TaskID.put(tasks[i]['_id'], task).then(function(task){
              console.log('removed user from task');
            }); 
          }
        });
        console.log('deleted a user!');
        if (data.data.message === 'OK'){
          $scope.responsetext = user.name + ' was deleted.';
        }
        $scope.getUsers();
      },
      function(data) {
        // fail
      }
  );
  }

}]);

mp4Controllers.controller('SettingsController', ['$scope' , '$window' , function($scope, $window) {
  $scope.url = $window.sessionStorage.baseurl;

  $scope.setUrl = function(){
    $window.sessionStorage.baseurl = $scope.url;
    $scope.displayText = "URL set";

  };

}]);
