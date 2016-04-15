var mp4Services = angular.module('mp4Services', []);

mp4Services.factory('CommonData', function(){
    var data = "";
    return{
        getData : function(){
            return data;
        },
        setData : function(newData){
            data = newData;
        }
    }
});

mp4Services.factory('Users', function($http, $window) {
    return {
        get : function() {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http({
                method : 'GET',
                url : baseUrl+'/api/users'
            });
        },
        
        post : function(user) {
            var baseUrl = $window.sessionStorage.baseurl;
            var user = $.param(user);
            return $http({
                method : 'POST',
                url : baseUrl+'/api/users',
                data : user,
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
        }
    }
});

mp4Services.factory('UserID', function($http, $window) {
    return {
        // takes userid as input
        get : function(userid) {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.get(baseUrl+'/api/users/'+userid)
        },
        put : function(userid, params) {
            var baseUrl = $window.sessionStorage.baseurl;
            console.log($.param(params))
            return $http({
                method : 'PUT',
                url : baseUrl+'/api/users/'+userid,
                data : $.param(params),
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
        },
        delete : function(userid) {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.delete(baseUrl+'/api/users/'+userid)
        }
    }
});

mp4Services.factory('Tasks', function($http, $window) {
    return {
        get : function(param) {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http({
                method : 'GET',
                url: baseUrl+'/api/tasks',
                params : param
            });
        },
        post : function(task) {
            var baseUrl = $window.sessionStorage.baseurl;

            var task = $.param(task);
            return $http({
                method : 'POST',
                url : baseUrl+'/api/tasks',
                data : task,
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
        }
    }
});

mp4Services.factory('TaskID', function($http, $window) {
    return {
        // takes userid as input
        get : function(taskid) {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.get(baseUrl+'/api/tasks/'+taskid)
        },
        put : function(taskid, params) {
            var baseUrl = $window.sessionStorage.baseurl;
            params = $.param(params)
            console.log(params);
            return $http({
                method : 'PUT',
                url : baseUrl+'/api/tasks/'+taskid,
                data : params,
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
        },
        delete : function(taskid) {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.delete(baseUrl+'/api/tasks/'+taskid)
        },
        deleteFromUser : function(taskid, userid) {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http({
                method : 'PUT',
                url : baseUrl+'/api/users/'+userid,
                data: {'pendingTasks': taskid, 'method': 'pull'},
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
        }
    }
});
