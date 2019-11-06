
var mysql=require("mysql");

var connection=mysql.createConnection({
   host:'85.10.205.173',
   port:'3306',
   user:'uniklearner',
   password:'hus786110',
   database:'uniklearner',
  // socketPath:''
});
 
//console.log(connection);

connection.connect();



module.exports=connection;