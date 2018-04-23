const express = require('express');
const request = require('request')
const hbs = require('hbs');
const bodyParser = require('body-parser');
const fs = require('fs');

var app = express();
var dict = {};
var history = [];


app.set('view engine', 'hbs')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(__dirname + '/public'));

var public = __dirname + '/public/'
console.log(public)

app.get('/', (request, response) => {
    response.render(public + 'App.hbs');
});

app.post('/', function(request, response) {
    dict = {};
    console.log(request.body["City"]);
    get_dict(request.body["City"]);

    setTimeout(()=> {
        history.push(dict);
        write_file(history);
        response.render(public + 'App.hbs',{location: dict["location"], temperature: dict["temperature"] + "°C", summary: dict["summary"], latitude: dict["lat"], longitude: dict["lng"], file: read_file()});

    }, 2000)
   
    
})

function get_dict(location){
    get_location(location)
};

function get_location(place){
    var link = `http://maps.googleapis.com/maps/api/geocode/json?address=${place}`
    request ({
        url: link,
        json: true
    },
    (error, response, body) => {
        if (body.status === "OK"){
            dict.location = place
            var lat = (body.results[0].geometry["location"].lat);
            var lng = (body.results[0].geometry["location"].lng);
            dict.lat = lat
            dict.lng = lng
            get_weather(lat, lng)
        } else if (body.status != "OK"){
            console.log("Limit reached, please wait for a while")
        }

    })

}

function get_weather(lat, lng){
    var link = `https://api.darksky.net/forecast/b10f1155187ae53296449ef6730b03d3/${lat},${lng}`;
    request({
        url: link,
        json: true
    },
    (error, response, body) => {
        if (!('code' in body)){
            dict.temperature = Math.round((body.currently["temperature"]-32) * 5 / 9);
            dict.summary = body.currently["summary"];
            return
        }
    })
}

function write_file(list){
        fs.writeFileSync("search.json", JSON.stringify(list)); 
};

var log_text = ""
function read_file(){
    file = fs.readFileSync("search.json")
    var index_file = (-1 + JSON.parse(file.toString()).length)
    var file_cont = Object.values(JSON.parse(file.toString()))[index_file]["location"]
    log_text = log_text + file_cont + "<br>"
    return log_text
}



app.listen(8080, () => {
    console.log('server is up on port 8080');
});