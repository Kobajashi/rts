/**
 * Created by tbier on 22.09.15.
 */
var singleplayer = {
    start: function() {
        $('.gamelayer').hide();

        singleplayer.currentLevel = 0;
        game.type = "singleplayer";
        game.team = "blue";

        singleplayer.startCurrentLevel();
    },
    exit: function() {
        $('.gamelayer').hide();
        $('#gamestartscreen').show();
    },
    currentLevel: 0,
    startCurrentLevel: function() {
        var level = maps.singleplayer[singleplayer.currentLevel];

        $("#entermission").attr("disabled",true);

        game.currentMapImage = loader.loadImage(level.mapImage);
        game.currentLevel = level;

        game.offsetX = level.startX * game.gridSize;
        game.offsetY = level.startY * game.gridSize;

        game.resetArrays();
        for(var type in level.requirements) {
            var requirementArray = level.requirements[type];
            for(var i = 0;i<requirementArray.length;i++) {
                var name = requirementArray[i];
                if(window[type]) {
                    window[type].load(name);
                } else {
                    console.log('could not load type:', type);
                }
            }
        }

        for (var i = level.items.length - 1; i >= 0; i--){
            var itemDetails = level.items[i];
            game.add(itemDetails);
        };

        if(loader.loaded) {
            $("#entermission").removeAttr('disabled');
        } else {
            loader.onload = function() {
                $("#entermission").removeAttr("disabled");
            }
        }

        $('#missonbriefing').html(level.briefing.replace(/\n/g,'<br><br>'));
        $("#missionscreen").show();
    },
    play: function() {
        game.animationLoop();
        game.animationIntervak = setInterval(game.animationLoop, game.animationTimeout);
        game.start();
    }
};