const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;

const initializerDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running At http://localhost:3000");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializerDbAndServer();

//API 1
//convert database object into response object
const convertDbObjectToResponseObject = (objItem) => {
  return {
    playerId: objItem.player_id,
    playerName: objItem.player_name,
  };
};
//Returns a list of all the players in the player table
app.get("/players/", async (request, response) => {
  const getAllThePlayersQuery = `SELECT * FROM player_details;`;
  const ArrayOfAllPlayers = await db.all(getAllThePlayersQuery);
  response.send(
    ArrayOfAllPlayers.map((each) => convertDbObjectToResponseObject(each))
  );
});

//API 2
//Returns a specific player based on the player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsBasedOnIdQuery = `SELECT * FROM player_details WHERE player_id = ${playerId};`;
  const responseOfGetPlayerDetailsBasedOnId = await db.get(
    getPlayerDetailsBasedOnIdQuery
  );
  response.send(
    convertDbObjectToResponseObject(responseOfGetPlayerDetailsBasedOnId)
  );
});

//API 3
//Updates the details of a specific player based on the player ID

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const AddPlayerDetailsQuery = `UPDATE player_details SET player_name = '${playerName}' WHERE player_id = ${playerId};`;
  const responseOfAddPlayerDetails = await db.run(AddPlayerDetailsQuery);
  response.send("Player Details Updated");
});

//API 4
//converts database object into response object
const convertDbObjectToMatchResponseObject = (objItem) => {
  return {
    matchId: objItem.match_id,
    match: objItem.match,
    year: objItem.year,
  };
};

//Returns the match details of a specific match Id

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsBasedOnIdQuery = `SELECT * FROM match_details WHERE match_id = ${matchId};`;
  const responseOfMatchDetailsBasedOnId = await db.get(
    getMatchDetailsBasedOnIdQuery
  );
  response.send(
    convertDbObjectToMatchResponseObject(responseOfMatchDetailsBasedOnId)
  );
});

//API 5
//Returns a list of all the matches of a player

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getAllMatchesOfAPlayerQuery = `SELECT * FROM match_details NATURAL JOIN player_match_score WHERE player_match_score.player_id = ${playerId};`;
  const ArrayOfMatchesOfAPlayer = await db.all(getAllMatchesOfAPlayerQuery);
  response.send(
    ArrayOfMatchesOfAPlayer.map((each) =>
      convertDbObjectToMatchResponseObject(each)
    )
  );
});

//API 6
//Returns a list of players of a specific match
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersBasedOnMatchIdQuery = `SELECT * FROM player_details NATURAL JOIN player_match_score WHERE player_match_score.match_id = ${matchId};`;
  const ArrayOfPlayersBasedOnMatchId = await db.all(
    getPlayersBasedOnMatchIdQuery
  );
  response.send(
    ArrayOfPlayersBasedOnMatchId.map((each) =>
      convertDbObjectToResponseObject(each)
    )
  );
});

//API 7
//Returns the statistics of the total score, fours, sixes of a specific player based on the player ID

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getAllDetailsOfPlayerBasedOnPlayerIdQuery = `SELECT 
        player_details.player_id AS playerId,
        player_details.player_name AS playerName,
        SUM(score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes
        FROM player_details NATURAL JOIN player_match_score WHERE player_match_score.player_id = ${playerId};
    `;
  const responseOfGetAllDetailsOfPlayersBasedOnPlayerIdQuery = await db.get(
    getAllDetailsOfPlayerBasedOnPlayerIdQuery
  );
  response.send(responseOfGetAllDetailsOfPlayersBasedOnPlayerIdQuery);
});

module.exports = app;
