var buildings = {
    list: {
        "base": {
            pixelWidth: 60,
            pixelHeight: 60,
            baeWidth: 40,
            baseHeight: 40,
            pixelOffsetX: 0,
            pixelOffsetY: 20,
            // Properties for describing structure for pathfinding
            buildableGrid: [
                [1, 1],
                [1, 1]
            ],
            passableGrid: [
                [1, 1],
                [1, 1]
            ],
            sight: 3,
            hitPoints: 500,
            cost: 5000,
            spriteImages: [
                {"name": "healty", count: 4},
                {"name": "damaged", count: 1},
                {"name": "constructing", count: 3}
            ]
        }
    },
    defaults: {
        type: "buildings",
        animationIndex: 0,
        direction: 0,
        orders: {type: "stand"},
        action: "stand",
        selected: false,
        selectable: true,
        // Default function for animating a building
        animate: function () {
        },
        // Default function for drawing a building
        draw: function () {
        }
    },
    load: loadItem,
    add: addItem,
};