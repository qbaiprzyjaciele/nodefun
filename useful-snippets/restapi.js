var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var upload = multer();
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


app.post('/restapi/add', upload.array(), function (req, res, next) {
    
    console.log(req.body.userName);
    fs.writeFile('files/users','user:'+req.body.userName,function(err) {
        if(err) {
            console.log('Error while writing a file');
            console.log(err);
            res.send('Error while writing a file');
        }
        else {
            res.send('file saved');
        }
    });
});


app.listen(3001);