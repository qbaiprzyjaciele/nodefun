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

app.post('/api/survey/add', function(req,res) {
	var sentSurvey = JSON.parse(req.body.survey);
	var survey = new Survey({title:sentSurvey.title, hash:hashGen, owner:sentSurvey.owner, questions:sentSurvey.questions});
	survey.save(function(err) {
		if(err) res.status(500).send('Error while saving newSurvey');
		else {
			res.status(200).send('ok');
		}
	});
});

var hashGen = function() {
	return new Buffer(['a','b','D','x','Y','t','O','r','v','l','p'][Math.floor(Math.random() * 10)] + new Date().getMilliseconds()).toString('base64');
}

app.listen(3000);
