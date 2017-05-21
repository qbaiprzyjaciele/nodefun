var express = require('express');
var mongoose  = require('mongoose');
var bodyparser = require('body-parser');

var app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

mongoose.connect('mongodb://localhost/test');
mongoose.Promise = global.Promise;

var Survey = mongoose.model('Survey',{title:String,hash:String,owner:String,questions:Array});
	
app.get('/all', function(req,res) {
	Survey.find(function(err,surveys) {
		if(err) res.send(err);
		else {
			res.send(JSON.stringify(surveys));
		}
	});
});

app.post('/post', function(req,res) {
	console.log('name:' + req.body.name + ',lastName:' + req.body.lastName);
	console.log('anotherPerson:' + req.body.anotherPerson);
	res.send('Ok');
});

app.listen(3000);
