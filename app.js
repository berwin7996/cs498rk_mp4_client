var express = require('express');
var app = express();

// $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";


app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 3000;
console.log("Express server running on " + port);
app.listen(process.env.PORT || port);
