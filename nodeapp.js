var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
mongoose.Promise = global.Promise;

var User = mongoose.model('User', {login:String, pass:String, email:String});
var Portfolio = mongoose.model('Portfolio', {name:String, value:Number, canView:Array});

function checkCredentials(authString) {
    if(authString) {
        var userAndPass = authString.split(" ")[1];
        console.log("userAndPass = " + userAndPass);
        var decoded = new Buffer(userAndPass,'base64').toString().split(":");
        if(decoded[0]=='kuba' && decoded[1] =='lololol') {
            return true;
        }
        else {
            return false;
        }
    }
}

function parseUserAndPass(authString) {
    var userAndPass = authString.split(" ")[1];
    var decoded = new Buffer(userAndPass,'base64').toString().split(":");
    return {name:decoded[0],pass:decoded[1]};
}

function authenticate(authString, onCredentials) {
    var credentials = parseUserAndPass(authString);
    User.findOne({login:credentials.name}).exec(
        function(err,returnedUser) {
            if(err) {
                onCredentials({message:"Error while retiriveing user " + err});
            }
            else {
                if(credentials.pass == returnedUser.pass) {
                    onCredentials(null,  returnedUser);   
                }
                else {
                    onCredentials({message:"User found, but authentication failed"});
                }
            }
        }
    );   
}

app.get('/', function (req, res) {
  res.send('hello world');
});

app.get('/add', function(req,res) {
    var newPerson  = new User({login:"adamm",pass:"adasd8y3r4raw3ra7fg", email:"miauczek64@wp.pl"});
    newPerson.save(function(err) {
        if(err) {
            res.send(err);
        }
        else {
            res.send('Zapisano');
        }
    });
});


app.get('/add/login/:login/pass/:pass/email/:email', function(req,res) {
    var newPerson  = new User({login:req.params.login,pass:req.params.pass, email:req.params.email});
    newPerson.save(function(err) {
        if(err) {
            res.send(err);
        }
        else {
            res.send('Zapisano');
        }
    });
});

app.get('/portfolio/add/:name/value/:value/canView/:canView',function(req,res) {
    var newPortfolio  = new Portfolio({name:req.params.name,value:req.params.value,canView:req.params.canView.split(",")});
    newPortfolio.save(function(err) {
       if(err) {
           res.send(err);
       } 
       else {
           res.send('Zapisano');
       }
    });
});

app.get('/portfolio/:name',function(req,res) {
    res.header('WWW-Authenticate', 'Basic');
    res.status(401);
    if(req.headers.authorization) {
        authenticate(req.headers.authorization, function(err, user) {
            if(err) {
                res.send('Authorization failed ' + err);
            }
            else {
                Portfolio.findOne({name:req.params.name}).exec(
                    function(err,portfolio) {
                        if(err) {
                            res.send('error! ' + err);
                        } else {
                            if(portfolio.canView.indexOf(user.login) != -1) {
                                res.status(200);
                                res.send(JSON.stringify(portfolio));
                            } else {
                                res.status(401);
                                res.send('Access denied for this resource');
                            }   
                        }
                    }
                );      
            }
        });   
    }
    else {
        res.send('Auth failed');
    }
});

app.get('/getall',function(req,res) {
    User.find(function(err,users) {
        if(err) {
            res.send(err);
        }
        else {
            res.send(JSON.stringify(users));
        }
    });
});

app.get('/getall/:id', function(req,res) {
    res.header('WWW-Authenticate', 'Basic');
    res.status(401);
    if(req.headers.authorization) {
        authenticate(req.headers.authorization, function(err, user) {
            if(err) {
                res.send("Authorization failed" + JSON.stringify(err));
            }
            else {
                res.status(200);
                res.send(JSON.stringify(req.params));
            }
        });
    } else {
        res.send("Blad ");
    }
    
});


app.get('/getall/:id/servers/:name', function(req,res) {
    console.log( JSON.stringify(req.params));
    res.header('WWW-Authenticate', 'Basic');
    res.status(401);
    console.log(JSON.stringify(req.headers));
    if(checkCredentials(req.headers.authorization)) {
        res.status(200);
        res.send(JSON.stringify(req.params));
    } else {
        res.send('No auth');
    }
});


app.get('/rest/logout', function(req,res) {
    res.header('WWW-Authenticate', 'Basic');
    res.status(401);
    res.send("Wylogowano");
});

app.listen(3000);

