// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var amazon = require('amazon-product-api');
var YouTube = require('youtube-node');
var request = require("request");
var _ = require("underscore");


var newData = require("./newData");
var prefData = require("./prefData");
var resData = require("./resData");
var bgLibrary = require("./bgLibrary");


//Express: Server
var app = express();
var PORT = process.env.PORT || 8080;

// Body-Parser: Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//folder
app.use(express.static('public'))

var dataList = [];

//====================================================
// Routing
//====================================================
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/api/new", function(req, res) {
  res.json(newData);
});

app.get("/api/res", function(req, res) {
  res.json(resData);
});

app.get("/api/pref", function(req, res) {
  res.json(prefData);
});

app.get("/api/lib", function(req, res) {
  res.json(bgLibrary);
});

app.post("/api/new", function(req, res) {
  // req.body hosts is equal to the JSON post sent from the user
   var newTerm = req.body.name;
   console.log("New search term is: " +newTerm);
  //BGG Search function

  var default_game = '<boardgames termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">' + "\n"
  + '<boardgame objectid="187127">' + "\n"
  + '<name primary="true">Back to the Future Monopoly</name>' + "\n"
  + '<yearpublished>2015</yearpublished>' + "\n"
  + '</boardgames>';

    var gameId = 0;
    var getIdUrl = "https://www.boardgamegeek.com/xmlapi/search?search=" + newTerm + "&exact=1";

    let gamePromise = new Promise((resolve, reject) => {
      request(getIdUrl, function(error, response, body) {
        // in addition to parsing the value, deal with possible errors
        if (!error && response.statusCode === 200) {
          var xmlGarbage = JSON.stringify(body);
          console.log(xmlGarbage + "\n=============End of Garbage XML ===========");
          var resultArr = xmlGarbage.split(" ");
          if (typeof variable !== 'undefined') {
            var gameArr = resultArr[2].split('"', 2);
          } else {
            var gameArr = default_game;
          }
          gameId = gameArr[1];
          console.log("ID is: "+ gameId);
          resolve(gameId);
        }else{
          reject(error);
        }
      });
    });

    gamePromise.then((newGameId) => {
      console.log("Yay! " + newGameId);
      var queryUrl = "https://bgg-json.azurewebsites.net/thing/" + newGameId;
      request(queryUrl, function(error, response, body) {
        // If the request is successful
        if (!error && response.statusCode === 200) {
          // Parse the body of the site and recover just the imdbRating
          console.log("Publish Year: " + JSON.parse(body).yearPublished);
          newData = JSON.parse(body);
          res.json(newData);

        }
      });
    });
});

app.post("/api/pref", function(req, res) {
  // req.body hosts is equal to the JSON post sent from the user
  var searchPref = req.body;
  console.log("# of Players prefered at Post:" + searchPref.playerPref);
  prefData = searchPref;
  //BGG Pref Search function
    var request = require("request");
    var lib = bgLibrary;
    var libUrl = "https://bgg-json.azurewebsites.net/collection/smugclimber?grouped=false"
    console.log("===========================");
    console.log("Pref search started...");
    console.log("===========================");
    console.log("Time Pref at search is: " + prefData.timePref);
    var players = prefData.playerPref;
    var time = prefData.timePref;
    var genre = prefData.genrePref;
    //Build library out
    request(libUrl, function(error, response, body)
    {
      // If the request is successful
      if (!error && response.statusCode === 200) {
        // Parse the body of the site and recover just the imdbRating
        prefData = JSON.parse(body);
        console.log("Library after call is this long: " + prefData.length);
        var matches = [];
        for(var i=1; i<prefData.length; i++)
        {
          if (prefData[i].userComment === genre){
            if(prefData[i].maxPlayers >= players && prefData[i].minPlayers <= players){
              if(prefData[i].playingTime < time){
                matches.push({name: prefData[i].name});
              }
            }
          }if (prefData[i].maxPlayers >= players && prefData[i].minPlayers <= players){
            if(prefData[i].userComment === genre){
              if(prefData[i].playingTime < time){
                matches.push({name: prefData[i].name});
              }
            }
          }else if(matches === []){console.log("No Matches!!!")}
        }//for loop ends
        console.log("Pref Search results: "+ matches);
        var uMatches = _.uniq(matches, function(p){ console.log("matchName: "+p.name); return p.name; });
        newData = uMatches;
      }//if req is sucessfull end
      res.json(newData);
    });
});

app.post("/api/youtube", function(req,res) {
    var youTube = new YouTube();
    var videolink99 = {
      url1:"",
      url2:""
    };
    var youtubeSearchTerm = req.body.name+"how to play";
    console.log(req.body);
    youTube.setKey('AIzaSyDrTQy2vhSHh8lAel9LynXudfpTQHr23zA');
    youTube.search(youtubeSearchTerm, 2, function(error, result) {
      if (error) {
        console.log(error);
      }
      else {
        var youtubeLink = "https://www.youtube.com/embed/";
        var temp = result;
        var tempID1 = temp.items[0].id.videoId;
        var tempID2 = temp.items[1].id.videoId;
        videolink99.url1 = youtubeLink + tempID1;
        videolink99.url2 = youtubeLink + tempID2;
        res.json(videolink99);
      }
    });
})

app.post("/api/amazon", function(req,res) {
  var amazonInfo = {
    name:"",
    buyLink:"",
    reviewLink:""
  };

//Amazon API search
  var awsID1 = "AKIAJUHNPSE5V5XDGI7A";
  var awsSecret1 = "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";
  var awsTag1 = "samhkcho-20";
  console.log('here')
  var client = amazon.createClient({
    awsId: awsID1,
    awsSecret: awsSecret1,
    awsTag: awsTag1
  });

  client.itemSearch({
    Keywords: req.body.name
  }).then(function(results){
    console.log(results[0].ItemAttributes[0].Title[0]);
    amazonInfo.name = results[0].ItemAttributes[0].Title[0];
    console.log(results[0].DetailPageURL[0]);
    amazonInfo.buyLink = results[0].DetailPageURL[0];
    // Review URL
    console.log(results[0].ItemLinks[0].ItemLink[5].URL[0]);
    amazonInfo.reviewLink = results[0].ItemLinks[0].ItemLink[5].URL[0];
    res.json(amazonInfo);


  }).catch(function(err){
    console.log(err);
  });
});

// =============================================================================
// LISTENER
// The below code effectively "starts" our server
//

app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
})
