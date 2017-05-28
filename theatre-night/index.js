var request = require('request');

console.log('Starting...');

request('http://google.com', function(error, res,html) {
    if(!error && res.statusCode == 200) {
        console.log(html);
    }
});
