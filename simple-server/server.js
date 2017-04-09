var express = require('express');
var mongoose = require('mongoose');
var app = express();
var multer = require('multer');
var bodyParser = require('body-parser');
var port = process.argv[2] | 3000;
var mongohost = process.argv[3];
var upload = multer();

app.use('/static',express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


mongoose.connect('mongodb://' + mongohost + '/test');
mongoose.Promise= global.Promise;

var User = mongoose.model('User',{name:String, pass:String, mail:String});
var Expense = mongoose.model('Expense', {userName:String, expenseDate:Date, value:Number, store:String, category:String, subcategory:String});
var Category =  mongoose.model('Category', {name:String, subcategories:Array});
var Income = mongoose.model('Income', {name:String, value:Number, category:String,incomeDate:Date, userName:String});
var IncomeCategory = mongoose.model('IncomeCategory', {name:String, description:String});
var Account = mongoose.model('Account', {name:String, userName:String, created:Date, lastModified:Date, bankName:String, currency:String});
var AccountState = mongoose.model('AccountState',{accountName:String, stateDate:Date, value:Number, description:String }); 

app.get('/api/initschema', function(req, res) {
	
	var newExpense =  new Expense({userName:'kuba',expenseDate:new Date(), value:14.60, store:'Starbucks', category:'food', subcategory:'Coffe'});	
	newExpense.save(function(err) {
		if(err) console.log('Error saving expense ' + err);
		else {
			console.log('Expense saved');
		}
	});

	var newCategory = new Category({name:'food',subcategories:['coffe','Lunch out','electronics','alcohool'] });
	newCategory.save(function(err) {
		if(err) console.log('Error saving category ' + err);
		else {	
			console.log('category saved');
		}
	});
	

	var newIncome = new Income({name:'salary march', value:4223.45, category:'salary',incomeDate:new Date(), userName:'kuba' });
	newIncome.save(function(err) {
		if(err) console.log('Error saving income' + err);
		else {
			console.log('income saved');
		}
	});

	var newIncomeCategory = new IncomeCategory({name:'salary',description:'the thing you work for...'});
	newIncomeCategory.save(function(err) {
		if(err) console.log('error while saving income category ' + err);
		else {
			console.log('income category saved');
		}
	});

	var account = new Account({name:'Konto glowne w bzwbk', userName:'kuba', created:new Date(), lastModified:new Date(), bankName:'BZ WBK', currency:'PLN'});
	account.save(function(err) {
		if(err) console.log('Error savig account ' + err);
		else {
			console.log('account saved');
		}
	});

	var accountState = new AccountState({accountName:'Konto glowne w bzwbk', stateDate: new Date(), value:1544.50, decription:'stan konta po rachunkach'});
	accountState.save(function(err) {
		if(err) console.log('error saveing account state ' + err);
		else {
			console.log('account state saved');
		}
	});
});


console.log('starting server...');

app.post('/api/categories/add',upload.array(), function(req,res) {
	var category = req.body.category;
	var newCategory = new Category({name:category.name, subcategories:category.subcategories});
	newCategories.save(function(err) {
		if(err) console.log('error while saving category '+ err);
		else {
			console.log('Category saved '+ JSON.stringify(category));
		}

	});
});

app.get('/api/categories',function(req, res) {
	Category.find({}, function(err,categories) {
		res.send(categories);
	});
});

app.get('/api/entries',function(req,res) {
	res.send([{id:0,name:'Kuba',lastName:'Kowalski'}, {id:1,name:'Anitka',lastName:'Kowalski'}]);
});

app.get('/api/person/:id/details', function(req,res) {
	res.send(data[req.params.id]);
});

setInterval(function() {
	console.log('Interval triggered...');
},3000);

app.get('/', function(req,res) {
	res.send('Hello world!');
});

app.get('/user/add/name/:name/pass/:pass/mail/:mail',function(req,res) {
	var newUser = new User ({name:req.params.name,pass:req.params.pass,mail:req.params.mail});
	newUser.save(function(err) {
		if(err) {
			res.send(err);
			console.log('Error while saving user' + err);
		}
		else {
			res.send('Saved');
		}
	});

});


app.listen(port, function() {
	console.log('Server listeing on port ' + port);
});

var data = [
	{id:0,name:'Kuba', lastName:'Kowalski',proffession:'Software Engineer', age:26},
	{id:1,name:'Anitka', lastName:'Kowalski', proffession:'Childcare', age:24}
];


