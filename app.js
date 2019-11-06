var express=require("express"),
     app=express(),
     passport=require("passport"),
     passportsetup=require("./config/ps"),
     db=require("./data/data.js"),
     mongoose=require("mongoose"),
     cookies=require("cookie-session"),
     methodOver=require("method-override"),
     nodemailer=require("nodemailer"),
     xoauth2=require("xoauth2"),
     bodyParser = require('body-parser'),
     mysql=require("mysql"),
     helper = require('sendgrid').mail,
     sg = require('sendgrid')(''),//your secret from sendgrid application
     ageCalculator = require('age-calculator');
     let {AgeFromDateString, AgeFromDate} = require('age-calculator');;
    


app.set("view engine","ejs");

//for nodemailer
//VIP FOR RETRIVING DATA FROM FORM
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOver("_method"));


//mail body part goes here.
/*
//
app.use(require("express-session")({
     secret:"USPvgIG5BMKoyGkWXDkLTvq1",
     resave:false,
     saveUninitialized:false
}));
var sql = "SELECT LAST (username) FROM user;  ";
connection.query(sql,function(error, result)
{
      if (error) throw error;
      
     console.log("inserted");
});*/


//to show the data
app.get("/book/:id1/:id2",function(req,res)
{
      var id1=req.params.id1;
      var id2=req.params.id2;
   var sql='SELECT * FROM customer,professional WHERE customerid = ? and professionalid = ?';   
     db.query(sql,[id1,id2],function(error,result)
    {
        if(error)
        {
             console.log(error);
        }else
        {
            console.log(result);
            let ageFromString = new AgeFromDateString(result[0].professionaldob).age;
             res.render("profile",{result:result,id:result[0].customerid,age:ageFromString});
        }
    });
});


//initial comment
app.get("/last/:id",function(req,res)
{
    //change the query  
    var id=req.params.id;
    var sql = 'SELECT * FROM professionalreviews where professionalid = ?  ORDER BY professionalratings DESC  LIMIT 1';
db.query(sql,[id],function(error, result)
{
      if (error) {throw error;}
      else
      {
          res.json(result);
      }
     
});
});

//add more comment
app.get("/last/:id/:count",function(req,res)
{
    //change the query  
    var count=req.params.count;
    var id=req.params.id;
    var sql = 'SELECT * FROM professionalreviews where professionalid =? ORDER BY professionalratings DESC  LIMIT 1 OFFSET '+count;
    db.query(sql,[id],function(error, result)
    {
      if (error) {throw error;}
      else
      {
          res.json(result);
      }
     
});
});


//booking route(left)
app.post("/book/:id1/:id2",function(req,res)
{
     var fromEmail ;
     var toEmail;
    //booking route comes here
    var id1=req.params.id1;
    var id2=req.params.id2;
    var customer=[];
    var professional=[];
    //find the customer  id and filter table
    var sql='SELECT * FROM filtertable,professional WHERE  fcustomerid = ? and professionalid = ? ';
    db.query(sql,[id1,id2],function(error,result)
    {
        if(error)
        {
             console.log(error);
        }else
        {
             console.log(result);
             var cid=result[0].customerid;
             var pid=result[0].professionalid;
             var sdate=result[0].fstartdate;
             var edate=result[0].fenddate;
             
            // adding to insert query into booking detail
            
     var sql1="INSERT INTO bookingdetails (customerid, professionalid, startdate, enddate) VALUES ?";
     var add=[[id1,id2,result[0].fstartdate,result[0].fenddate]];
     
     db.query(sql1,[add],function(error, result){
        if (error) {throw error;}
        else
        {
             //deleting from temp table
             console.log('data/entered');
             console.log(result);
           //  sql1='DELETE FROM filtertable WHERE fcustomerid = '+ mysql.escape(id1);
             db.query(`DELETE FROM filtertable WHERE fcustomerid=?`,id1,function (err, result) {
    if (err){ throw err;}
    else
    {     
        console.log(result);
        console.log('Data/Deleted');
        //get the emailid of professional and customer both
         sql1='SELECT customeremailid,professionalemailid FROM customer,professional WHERE  customerid = '+ mysql.escape(id1)+'and professionalid = '+ mysql.escape(id2);
            db.query(sql1,function(error, result)
        {
      if (error) {throw error;}
      else
      {
           console.log(result);
          console.log('message/sent');
           //mailing the person now
      var helper = require('sendgrid').mail;
var fromEmail = new helper.Email(result[0].professionalemailid);
var toEmail = new helper.Email(result[0].customeremailid);
var sg = require('sendgrid')('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');
    // var sg = require('sendgrid')('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');
      var subject = 'Mail from bookmyservice';
      var content = new helper.Content('text/plain', 'finally thanks for choosing our service');
      var mail = new helper.Mail(fromEmail, subject, toEmail, content);

       var request = sg.emptyRequest({
                   method: 'POST',
                   path: '/v3/mail/send',
                   body: mail.toJSON()
                });
 
    sg.API(request, function (error, response) {
    if (error) {
    console.log('Error response received');
  }
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
    });
    //update the calender table  *(left)
    //redirect to home.php
    res.redirect("http://jinitmehta.000webhostapp.com/");
      }
         });  
    }
  });
        }
     });
        }
    });

});


//submit button ajax(left)
app.post("/last/:id1/:id2",function(req,res)
{
 //change the query  
 //posting the query by logged in user.
    var ucount=req.body.uc;
    var id1=req.params.id1;
    var id2=req.params.id2;
    console.log(req.body.test);
   var sql="INSERT INTO professionalreviews (customerid, professionalid, professionalratings, professionalcomments) VALUES ?";
    var add=[[id1,id2,req.body.stars,req.body.test]];
    console.log(add);
    db.query(sql,[add],function(error, result)
{
      if (error) {throw error;}
      else
      {
        sql='SELECT * FROM professionalreviews WHERE customerid= ? and professionalid=?';
         db.query(sql,[id1,id2],function(error, result)
        {
      if (error) {throw error;}
      else
      {
          res.json(result);
      }
     
          });
      }
});
    
});

//just view profile
app.get("/view/:id",function(req,res)
{
    var id=req.params.id;
   //render profile page
   if(id<1001)
   { //different one. professional
      var sql = 'SELECT * FROM customer  where customerid =' + mysql.escape(id);
      db.query(sql,function(error,result)
      {
           if(error)
           {
                console.log(error);
           }else
           {
               let ageFromString = new AgeFromDateString(result[0].customerdob).age;
              // console.log(ageFromString);
                res.render("viewc",{result:result,id:result[0].customerid,age:ageFromString});
           }
      });
     
   }else
   {
      //different one. user and 
       var sql = 'SELECT * FROM professional where professionalid = ' + mysql.escape(id);
      db.query(sql,function(error,result)
      {
           if(error)
           {
                console.log(error);
           }else
           {
                let ageFromString = new AgeFromDateString(result[0].professionaldob).age;
                res.render("viewp",{result:result,id:result[0].professionalid,age:ageFromString});
           }
      });
   }
  // res.send("in views routes. "+id)
});




//listening the port
app.listen(8081,process.env.IP,function()
{
    console.log("blog/app/start");
});
