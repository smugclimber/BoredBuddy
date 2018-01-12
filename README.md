# BoredBuddy
### [Live Website: https://pacific-ravine-93168.herokuapp.com/]

created by [Nick H](https://github.com/smugclimber)

#### key libraries and tech <br>
Node <br>
Express <br>
Heroku <br>
NPM <br>
Git / Github <br>
jQuery <br>
Materialize <br>
Javascript <br>
Amazon, BBG, and YouTube APIs <br>

#### about this project
BoredBuddy was personally a very satisfying project because of my passionate love for boardgames and puzzle challenges. The project demonstrates skills in interacting with APIs from multiple sources (Amazon, Boardgamegeek, and YouTube). This application allows users to conduct queries of a boardgame database through an API. One of the core functions of this application is to alleviate the user of indecisive game picking and provides assistance with a preferenced search engine and well as a 'name-based' search method. Additionally, if the user has a library of boardgames, they can interact with that data. Give it a spin, you might enjoy it!

### code
In order to allow users to interact with multiple boardgames and their information, we had to overcome quite an [apiChallenge](#apiChallenge) in the application's back end. The API call only returned a very chaotic XML file. See the code below for our work around to json harmony.
#### apiChallenge
code below is quoted from: server.js
```
app.post("/api/new", function(req, res) {
  // req.body hosts is equal to the JSON post sent from the user
   var newTerm = req.body.name;
   console.log("New search term is: " +newTerm);
  //BGG Search function
    var gameId = 0;
    var getIdUrl = "https://www.boardgamegeek.com/xmlapi/search?search=" + newTerm + "&exact=1";

    let gamePromise = new Promise((resolve, reject) => {
      request(getIdUrl, function(error, response, body) {
        // in addition to parsing the value, deal with possible errors
        if (!error && response.statusCode === 200) {
          var xmlGarbage = JSON.stringify(body);
          console.log(xmlGarbage + "\n=============End of Garbage XML ===========");
          var resultArr = xmlGarbage.split(" ");
          var gameArr = resultArr[2].split('"', 2);
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
```
