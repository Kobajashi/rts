/**
 * Created by tbier on 22.09.15.
 */
var maps = {
    "singleplayer": [
        {
            "name": "Entities",
            "briefing": "In this level you will add new entities to the map.\nYou will also select          them using the mouse",
            /* Map Details */
            "mapImage": "images/maps/level-one-debug-grid.png",
            "startX": 4,
            "startY": 4,
            /* Entities to be loaded */
            "requirements": {
                "buildings": ["base"],
                "vehicles": [],
                "aircraft": [],
                "terrain": []
            },
            /* Entities to be added */
            "items": [
                {"type": "buildings", "name": "base", "x": 11, "y": 14, "team": "blue"},
                {"type": "buildings", "name": "base", "x": 12, "y": 16, "team": "green"},
                {"type": "buildings", "name": "base", "x": 15, "y": 15, "team": "green", "life": 50}
            ]
        }
    ]
};