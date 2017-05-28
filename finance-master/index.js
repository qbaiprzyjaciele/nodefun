var amqp = require('amqplib/callback_api');

console.log('Hello rabbit...');

amqp.connect('amqp://localhost', function(err, conn) {
    if(err) { console.log('error ', err) }
    else {
        conn.createChannel(function(err, ch) {
            var q = 'kolejka';
            ch.assertQueue(q, {durable:false});
            console.log("Waiting for messages...");
            ch.consume(q, function(msg) {
                    console.log(msg.content.toString());
                }, 
                {noAck:true}
            );
        });
    }
});