var http = require('http');
var path = require('path');
var express = require('express');
var logger = require('morgan');
var ForecastIo = require('forecastio');
var zipdb = require('zippity-do-dah');

// Constants
const PORT = process.env.PORT || 3000;
const DARK_SKY_KEY= process.env.DARK_SKY_KEY; 

// Objects
var app = express();
var weatherApi = new ForecastIo(DARK_SKY_KEY);

// Middleware
app.use(logger("dev"));
app.use(express.static(path.resolve(__dirname, "public")));

// Application Settings
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));

// Routes
app.get("/", function(req,res) {
    res.render("index");
});

app.get(/^\/(\d{5})$/,function(req,res,next){
    console.log("req.params",req.params);
    var zipcode = req.params[0];
    var locat = zipdb.zipcode(zipcode);
    if (!locat.zipcode) {
        console.log("Error zipdb failed to get data back", locat, "for", zipcode);
        next();
        return;
    }

    var lat = locat.latitude;
    var lon = locat.longitude;
    weatherApi.forecast(lat, lon, function(err, data){
        if(err) {
            next();
            return;
        }
        res.json({
            zipcode: zipcode,
            temperature: data.currently.temperature
        });
    });
});

app.use(function(req, res) {
    res.status(404).render("404");
});

// Main
http.createServer(app).listen(PORT, function() {
    console.log("Started server on PORT", PORT);
});
