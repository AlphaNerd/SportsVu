$(document).ready(function() {
    Parse.initialize("EpTEGItCAepAwfPcPmcjt60CeowkC96fVWR8ypYM", "CWpOqAmy3IgOW0xa4iSvjjf5DPf8NdmrLWHmMSRE");
    var ParseData = Parse.Object.extend("GameData");
    console.log("Successfully loaded Parse.com");


    var GAME_ID = 41400231;
    var EVENT_ID = 1;
    var TOTAL_MOMENTS = 0; /// Set to total moments after JSON complete
    var CURRENT_MOMENT = 0; /// loop counter
    var RATE = 40;
    var TEAMS_LOADED = false;
    var SHOT_CLOCK = 0;
    var TIME_LEFT = 0;
    var QUARTER = 0;
    var home, away, moments;
    var gameLoop;

    getGameData();

    function getGameData() {
        var gameid = GAME_ID.toString();
        var eventid = EVENT_ID.toString();
        var url = "http://stats.nba.com/stats/locations_getmoments/?eventid=" + eventid + "&gameid=00" + gameid;
        $(".fromURL").text(url);
        var nbaStats = $.getJSON(url, function(data) {
                // console.log("success");
            })
            .done(function(data) {
                // console.log("second success");
            })
            .fail(function() {
                // console.log("error");

                // Loop until successful game found
                // GAME_ID += 1;
                // getGameData();
            })
            .always(function() {
                // console.log("complete");
            });

        // Perform other work here ...

        // Set another completion function for the request above
        nbaStats.complete(function(data) {
            console.log("Successfully pulled down data...");
            var obj = data.responseJSON;
            console.log(obj);
            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
            TOTAL_MOMENTS = obj.moments.length;
            home = obj.home;
            away = obj.visitor;
            moments = obj.moments;

            console.log("Storing data to Parse.com");
            var gameData = new ParseData();
            // gameData.set("gameMoments",moments); //// Array too large for single post
            gameData.set("homeTeam", home);
            gameData.set("awayTeam", away);
            gameData.set("gameID", obj.gameid);
            gameData.set("gameDate", obj.gamedate);
            gameData.set("gameMoments", moments);
            gameData.save({
                success: function(res) {
                    console.log(res);
                },
                error: function(err, el) {
                    console.log(err, el);
                }
            }).then(function(object) {
                console.log("Game data saved.");
            });

            ///// Update the DOM //////
            $(".gamedate").html("Game Date: " + obj.gamedate);
            $(".gameid").html("Game ID: " + obj.gameid);
            parseTeam(home, "home", moments);
            parseTeam(away, "away", moments);
            parseGame(moments);
        });
    }

    function parseTeam(team, loc, moments) {
        $("." + loc + " .name").html(team.name);
        $("." + loc + " .teamId").html("ID: " + team.teamid);
        $("." + loc + " .teamAbv").html(team.abbreviation);
        $(".teamplayers").html("");
        $("." + loc + " .teamPlayers").append("<ul>");
        for (i = 0; i < team.players.length; i++) {
            var player = team.players[i];

            /// add player to floor
            $(".floor").append("<div class='player " + loc + "' player='" + player.playerid + "'>" + player.jersey + "<div class='infobar'><span class='id'>id:" + player.playerid + "</span><span class='number'>#" + player.jersey + " </span><span class='name'>" + player.firstname + " " + player.lastname + "</span><span class='position'>" + player.position + "</span></div></div>");

            /// add player to team list
            $("." + loc + " .teamPlayers").append("<li class='playerlist' player='" + player.playerid.toString() + "'>" + player.firstname + " " + player.lastname + "</li>");
        }
        $("." + loc + " .teamPlayers").append("</ul>");
    }

    function parseGame(moments) {
        var ballid = moments[CURRENT_MOMENT][5][0][1];
        $(".balldata").attr("player", ballid);
        gameLoop = setInterval(function() {
            // console.warn(CURRENT_MOMENT);
            if (CURRENT_MOMENT < TOTAL_MOMENTS) {
                SHOT_CLOCK = moments[CURRENT_MOMENT][3];
                TIME_LEFT = moments[CURRENT_MOMENT][2];
                QUARTER = moments[CURRENT_MOMENT][0];
                $(".shotclock").html(SHOT_CLOCK);
                $(".timeleft").html(TIME_LEFT);
                $(".quarter").html(QUARTER);

                var ballx = moments[CURRENT_MOMENT][5][0][2];
                var bally = moments[CURRENT_MOMENT][5][0][3];
                var ballz = moments[CURRENT_MOMENT][5][0][4];
                $(".balldata").find(".posx").html("X: " + ballx);
                $(".balldata").find(".posy").html("Y: " + bally);
                $(".balldata").find(".posz").html("Z: " + ballz);
                /////// Update ball on stage ///////
                $(".ball").css("left", ballx * 5);
                $(".ball").css("top", bally * 5);
                $(".ball").css("width", ballz * 2);
                $(".ball").css("height", ballz * 2);

                for (j = 1; j < 11; j++) {
                    var player = moments[CURRENT_MOMENT][5][j];
                    var p1 = $(".floor").find("div[player='" + player[1] + "']");
                    p1.css("left", player[2] * 4.85);
                    p1.css("top", player[3] * 4.85);
                }
                $(".floor .zone1 polygon").attr("points",
                    moments[CURRENT_MOMENT][5][1][2] * 5 + " " + moments[CURRENT_MOMENT][5][1][3] * 5 + "," +
                    moments[CURRENT_MOMENT][5][2][2] * 5 + " " + moments[CURRENT_MOMENT][5][2][3] * 5 + "," +
                    moments[CURRENT_MOMENT][5][3][2] * 5 + " " + moments[CURRENT_MOMENT][5][3][3] * 5 + "," +
                    moments[CURRENT_MOMENT][5][4][2] * 5 + " " + moments[CURRENT_MOMENT][5][4][3] * 5 + "," +
                    moments[CURRENT_MOMENT][5][5][2] * 5 + " " + moments[CURRENT_MOMENT][5][5][3] * 5
                );
                $(".floor .zone2 polygon").attr("points",
                    moments[CURRENT_MOMENT][5][6][2] * 5 + " " + moments[CURRENT_MOMENT][5][6][3] * 5 + "," +
                    moments[CURRENT_MOMENT][5][7][2] * 5 + " " + moments[CURRENT_MOMENT][5][7][3] * 5 + "," +
                    moments[CURRENT_MOMENT][5][8][2] * 5 + " " + moments[CURRENT_MOMENT][5][8][3] * 5 + "," +
                    moments[CURRENT_MOMENT][5][9][2] * 5 + " " + moments[CURRENT_MOMENT][5][9][3] * 5 + "," +
                    moments[CURRENT_MOMENT][5][10][2] * 5 + " " + moments[CURRENT_MOMENT][5][10][3] * 5
                );
            } else if (CURRENT_MOMENT >= TOTAL_MOMENTS) {
                CURRENT_MOMENT = 0;
            } else {
                console.warn("error");
            }
            CURRENT_MOMENT += 1;
        }, RATE);
        $(".player").on("click", function() {
            $(this).find(".infobar").toggle();
        });
    }

    $(".game-controls .game-id .next").on("click", function() {
        GAME_ID += 1;
        clearInterval(gameLoop);
        getGameData();
    });
    $(".game-controls .game-id .prev").on("click", function() {
        GAME_ID -= 1;
        clearInterval(gameLoop);
        getGameData();
    });
    $(".game-controls .event-id .next").on("click", function() {
        EVENT_ID += 1;
        clearInterval(gameLoop);
        getGameData();
    });
    $(".game-controls .event-id .prev").on("click", function() {
        EVENT_ID -= 1;
        clearInterval(gameLoop);
        getGameData();
    });

    $(".game-controls .stop").on("click", function() {
        clearInterval(gameLoop);
    });

    $(".game-controls .play").on("click", function() {
        clearInterval(gameLoop);
        getGameData();
    });

});
