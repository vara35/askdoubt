const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const getSeparateValue = (eachOne) => {
  return {
    playerId: eachOne.player_id,
    playerName: eachOne.player_name,
  };
};
app.get("/players/", async (request, response) => {
  const getValuesFromPlayers = `
    SELECT 
    * 
    FROM 
    player_details;`;
  const getValue = await db.all(getValuesFromPlayers);
  response.send(getValue.map((eachOne) => getSeparateValue(eachOne)));
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getValuesFromPlayers = `
    SELECT 
    * 
    FROM 
    player_details
    WHERE 
    player_id = ${playerId};`;
  const getValue = await db.get(getValuesFromPlayers);
  response.send(getSeparateValue(getValue));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const getValuesFromPlayers = `
   UPDATE 
   player_details
   SET player_name = '${playerName}'
   WHERE 
    player_id = ${playerId};`;
  const getValue = await db.run(getValuesFromPlayers);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getValuesFromPlayers = `
    SELECT 
    * 
    FROM 
    match_details
    WHERE 
    match_id = ${matchId};`;
  const getValue = await db.get(getValuesFromPlayers);
  response.send({
    matchId: getValue.match_id,
    match: getValue.match,
    year: getValue.year,
  });
});

const getValuesFromTwoTables = (eachOne) => {
  return {
    matchId: eachOne.match_id,
    match: eachOne.match,
    year: eachOne.year,
  };
};

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getValuesFromPlayers = `
    SELECT 
    * 
    FROM 
    match_details natural join player_match_score
    WHERE 
    player_id = ${playerId};`;
  const getValue = await db.all(getValuesFromPlayers);
  response.send(getValue.map((eachOne) => getValuesFromTwoTables(eachOne)));
});

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
    SELECT
      *
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      match_id = ${matchId};`;
  const playersArray = await database.all(getMatchPlayersQuery);
  response.send(playersArray.map((eachPlayer) => getSeparateValue(eachPlayer)));
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
     FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      player_id = ${playerId};`;
  const playersArray = await database.get(getPlayersQuery);
  response.send(playersArray);
});

module.exports = app;
