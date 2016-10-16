var http = require('http'),
    express = require('express'),
    twilio = require('twilio'),
    bodyParser = require('body-parser'),
    gmaputil = require('googlemapsutil'),
    striptags = require('striptags');

var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));


app.post('/', function(req, res) {

    var directions = 'Hey Welcome to Marco Polo SMS Service \n';

    var cb = function(err, result) {
        if (err) {
            console.log(err);
        }
        result = JSON.parse(result);
        if (result.status == "ZERO_RESULTS") {
            directions = "Please resend an accurate address !"
        } else {

            for (var i = 0; i < result.routes[0].legs[0].steps.length; i++) {
                directions += result.routes[0].legs[0].steps[i].html_instructions + "\n "
            }
            directions = striptags(decodeURIComponent(directions));

        }
        var twiml = new twilio.TwimlResponse();

        var text = directions.toString('utf8');
        console.log(text);
        twiml.message(text);

        res.writeHead(200, {
            'Content-Type': 'text/xml'
        });
        res.end(twiml.toString());


    };

    var body = req.body.Body;
    var goBy = body.substring(0, body.indexOf(" from "));
    var from = body.substring(goBy.length + 6, body.indexOf(" to "));
    var to = body.substr(body.indexOf(' to ') + 4);

    gmaputil.setOutput('json');
    gmaputil.directions(encodeURIComponent(from), encodeURIComponent(to), {
        avoid: 'highways',
        mode: goBy
    }, cb);



});

http.createServer(app).listen(1337, function() {
    console.log("Express server listening on port 1337");
});