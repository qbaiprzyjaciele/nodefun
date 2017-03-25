var express = require('express');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var events = require('events');

var app = express();
app.use(cookieParser());

mongoose.connect('mongodb://localhost/test');
mongoose.Promise = global.Promise;

var User = mongoose.model('User', {login:String, pass:String, email:String});
var Portfolio = mongoose.model('Portfolio', {name:String, value:Number, canView:Array});
var UserSession = mongoose.model('UserSession', {sessionId:String, userName:String, state:String, created:Date, lastAccessed:Date});

function parseUserAndPass(authString) {
    var userAndPass = authString.split(" ")[1];
    var decoded = new Buffer(userAndPass,'base64').toString().split(":");
    return {name:decoded[0],pass:decoded[1]};
}

function generateSessionId() {
    return new Buffer('s'+ (new Date().getTime())).toString('base64');
}

function newSession(loggedUserName) {
    var newSessionId = generateSessionId();
    var newUserSession = new UserSession({sessionId:newSessionId, userName:loggedUserName, state:'a',created:new Date(),lastAccessed:new Date()});
    console.log('newUserSession:',JSON.stringify(newUserSession));
    var errorWhileCreating;
    newUserSession.save(function(err) {
       if(err) {
           console.log('Error while creating new session');
           errorWhileCreating = err;
       }
       else {
           console.log('new session created ' + newSessionId);
           console.log('newUserSession:',newUserSession);
       }        
    });
    if(errorWhileCreating) {
        throw new Error(errorWhileCreating);
    }
    return newUserSession;
}


function authenticate(authString, onCredentials) {
    var credentials = parseUserAndPass(authString);
    User.findOne({login:credentials.name}).exec(
        function(err,returnedUser) {
            if(err) {
                onCredentials({message:"Error while retiriveing user " + err});
            }
            else if(returnedUser) {
                if(credentials.pass == returnedUser.pass) {
                    onCredentials(null,  returnedUser);   
                }
                else {
                    onCredentials({message:"User found, but authentication failed"});
                }
            }
            else {
                onCredentials({message:"User not found " + err});
            }
        }
        
    );   
}

function basicAuthCreateSession(req,res,callback) {
    res.header('WWW-Authenticate', 'Basic');
        res.status(401);
        if(req.headers.authorization) {
            authenticate(req.headers.authorization, function(err,user) {
                if(err) {
                    console.log('error',err);
                    res.send('Auth failed'); 
                }
                else {
                    var session = newSession(user.login);
                    console.log('session:', JSON.stringify(session));
                    res.cookie('sessionId', session.sessionId, {maxAge:80000,httpOnly:true});
                    res.header('WWW-Authenticate', 'Basic');
                    callback(user);
                }
            });
        }
        else {
            res.send('Auth failed'); 
        }  
}

function sessionAuth(req, res,callback) {
    if(req.cookies.sessionId === undefined) {
        basicAuthCreateSession(req,res,callback);
    }
    else {
        UserSession.findOne({sessionId:req.cookies.sessionId,state:'a'}).exec(function(err,userSession) {
            if(err) {
                console.log('Error while retrieving session');
                res.send('Auth failed');
            }
            else if(userSession) {
                    User.findOne({login:userSession.userName}).exec(function(err,user) {
                        if(err) {
                            console.log('Error while retrieving user ' + userSession.userName);
                            res.send('Auth failed'); 
                        }
                        else if(user) { 
                            res.cookie('sessionId', userSession.sessionId, {maxAge:80000,httpOnly:true});
                            callback(user);
                        }
                        else {
                            res.send('User not found');
                        }
                    });
            }
            else {
                //session may be no longer active
                basicAuthCreateSession(req,res,callback);    
            }
        }); 
    }
}



app.get('/', function (req, res) {
  console.log('cookies:',req.cookies);       
  res.send('hello world');    
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
    sessionAuth(req,res, function(user) {
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
    });
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


app.get('/rest/logout', function(req,res) {
    res.header('WWW-Authenticate', 'Basic');
    res.status(401);
    res.send("Wylogowano");
});

app.listen(3000);

