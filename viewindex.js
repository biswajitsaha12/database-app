var express = require('express');//minimalist framework for node.js
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/website', { useMongoClient: true });
mongoose.Promise = global.Promise;
var session = require('express-session');
var cookieParser = require('cookie-parser');
var multer=require('multer') // multipart/form-data used for uploading files
var mu=  multer();

app.set('view engine', 'pug');
app.set('views','./views');
app.use(express.static('css'));
app.use(express.static('js'));

app.use(cookieParser());
app.use(session({cookieName: 'session',secret: "Your secret key"}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true })); 
app.use(mu.array());
var upoad= multer({dest: './uploads'});

//session function
function checkSignIn(req, res, next){
   if(req.session.user){
      next();   //If session exists, proceed to page
   } else {
      res.redirect('/login')
        //Error, trying to access unauthorized page!
   };
};




//routing
app.get('/', function (req, res) {
	//res.send('Hello and Welcome');
	res.render('login');
  })

//login
app.get('/login', function(req, res){
   res.render('login');
});

//signup
app.get('/signup', function(req, res){
   res.render('signup');
});

//reset
app.get('/reset', function(req, res){
   res.render('reset');
});

//profile
app.get('/profile',checkSignIn, function(req, res){
	console.log(req.session.user.email);
	res.render('profile',{	name:req.session.user.name ,
							id:req.session.user.username,
							email:req.session.user.email,
							mobile:req.session.user.mobile 
	});
});

//home
app.get('/home', checkSignIn,function(req, res){
	console.log(req.session.id);
	customer_data.find({email_admin:req.session.user.email},function(err,result){
    	console.log(result);
    	if(result.length==0){ // meaning no users present in db 
    		console.log("HI USER");
    		res.render('home',{ total:result.length,
    							name:req.session.user.name ,
    							id:req.session.user.username
    						});
    }
    	else{
    	res.render('home',{ total:result.length,
    						name:req.session.user.name ,
    						id:req.session.user.username,
    						customer_name:result[result.length-1].name,
    						email:result[result.length-1].email,
    						mobile:result[result.length-1].mobile,
    						address:result[result.length-1].address
    					});
    }
    	
 	});
});

//newcustomer
app.get('/newcustomer',checkSignIn, function(req, res){

   res.render('newcustomer',{name:req.session.user.name ,id:req.session.user.username });
});

//customersummary
app.get('/customersummary',checkSignIn, function(req, res){

   
    customer_data.find({email_admin:req.session.user.email},function(err,result){
    	console.log(result.length);
    	res.render('customersummary',{ customerData: result,name:req.session.user.name ,id:req.session.user.username})
 	});
});

//items
app.get('/items', checkSignIn,function(req, res){

   	console.log(req.session.user.email);
    item_record.find({email_admin:req.session.user.email},function(err,result){
    	console.log(result);
    	
    	res.render('items',{ item_Data: result,name:req.session.user.name ,id:req.session.user.username})
    	
 	});
});

//update
 app.get('/update',checkSignIn, function(req, res){
 			console.log(req);
    		
    		console.log(result);
    	
    			
 
});

 //signupform
   var personSchema = mongoose.Schema({
  		name: String,
		username: String,
		email: String,
		mobile: Number,
		birth_date: Date,
		password: String, 
});
var user_data = mongoose.model("user_datas1",personSchema);

app.post('/signupform',function(req,res){

	var signupInfo=req.body;
	console.log(req.body);
	
	var newuser = new user_data({
		name:  signupInfo.name,
		username: signupInfo.username,																	
		email:  signupInfo.email,
		mobile: signupInfo.mobile,									
		birth_date:  signupInfo.birth_date,
		password:  signupInfo.password,
	});
	user_data.findOne({email:signupInfo.email},function(err,result){
	if (result!=null){
		res.render("signup",{err:"User already  exist"})}
		else{
		newuser.save(function(err){															
		if(err) console.log(err);
		res.redirect("/login");
		});
		};
	});
});

//loginform
app.post('/loginform',function(req,res){

	var loginInfo = req.body;
	console.log(req.body);
	user_data.findOne({email:loginInfo.email},function(err,result){
		console.log("checking if user email present in database");
		if (result===null){
		res.render("login",{err:"User doesn't exist"})}

		else{
		if(loginInfo.email==result.email && loginInfo.password==result.password){
				console.log("LOGIN SUCCESSFUL");
				 req.session.user = result;
				 console.log(req.session.user);
				res.redirect("/home");

	
}
		
	else{
	console.log("password wrong");
	res.render("login",{err:"Wrong Password "})}}
});

});
//add customer data
var schema = mongoose.Schema({
	name:String,
	email:String,
	mobile:Number,
	address:String,
	customer_description:String,
	email_admin:String,


})
var customer_data=mongoose.model("customer_data",schema);
app.post('/addCustomer',function(req,res){


	var customerInfo=req.body;
	console.log(req.body);
	var newCustomer= new customer_data({
		name : customerInfo.customerName,
		email:customerInfo.email,
		mobile:customerInfo.mobile,
		address:customerInfo.address,
		customer_description:customerInfo.des,
		email_admin:req.session.user.email,
	});
			
newCustomer.save(function(error){
	if (error) console.log(err);

	else
		{console.log(req.body);
		res.redirect('customersummary');}

});
		
});

//delete customer
app.post('/delete',function(req,res){

	console.log(req.body);

	customer_data.remove({_id:req.body.delete,email_admin:req.session.user.email},function(err,result){
		if(err) throw err;
		else
			res.redirect('customersummary')

});});
//update customer
app.post('/update',function(req,res){

	console.log(req.body);

	var user_id = req.body.update;
			res.render('update',{id:user_id, });


});

app.post('/updateCustomer',function(req,res){
	console.log(req.body);
	var updateCustomer=req.body;
	
	var update_Customer=({
		name : updateCustomer.customerName,
		email:updateCustomer.email,
		mobile:updateCustomer.mobile,
		address:updateCustomer.address,
		customer_description:updateCustomer.des,
		
	});
	customer_data.update({_id:updateCustomer.customer_id,email_admin:req.session.user.email,},update_Customer,function(err, doc){
		if(err) throw err;
		else
		res.redirect('customersummary')
	});
	
			

});
///add items
var itemSchema=mongoose.Schema({
	item_id:Number,
	item_name:String,
	item_price:Number,
	email_admin:String,


});
var item_record = mongoose.model("item_record1",itemSchema);
app.post('/additem',function(req,res){
	console.log(req.body);
	console.log(req.session.user.email);
	var new_item=new item_record({
		item_id:req.body.item_id,
		item_name:req.body.item_name,
		item_price:req.body.item_price,
		email_admin:req.session.user.email,


	});
	new_item.save(function(err){
		if (err) console.log(err);

	else
		{console.log(req.body);
		res.redirect('items');}

	});
});
//deleteitem
app.post('/itemdelete',function(req,res){

	console.log(req.body);

	item_record.remove({_id:req.body.delete,email_admin:req.session.user.email},function(err,result){
		if(err) throw err;
		else
			res.redirect('items')

});});
//update page request
app.post('/itemUpdate',function(req,res){
	console.log(req.body);


		res.render('itemupdate' ,{	id:req.body.edit_itemId,
									edit_item_id:req.body.edit_item_Id,
									edit_item_name:req.body.edit_item_name,
									edit_item_price:req.body.edit_item_price});
		}); 

			//update items
app.post('/update_item',function(req,res){
	console.log(req.body);
	
	var update_Item=({
		item_id:req.body.updateitem_id,
		item_name:req.body.update_item_name,
		item_price:req.body.update_item_price,
		
		
	});
	item_record.update({_id:req.body.update_item_id,email_admin:req.session.user.email,},update_Item,function(err, doc){
		if(err) throw err;
		else
		res.redirect('items')
	});
	
			

});
app.post('/upload',upoad.single('avatar'),function(req,res){


	
	console.log(req.body);
	res.redirect("home");
	});

app.get('/logout', function(req, res){
   req.session.destroy(function(){
      console.log("user logged out.")
   });
   res.redirect('/login');
});


app.listen(3000);
console.log("listening on port 3000")




