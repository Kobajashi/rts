/**
 * Created by tbier on 22.09.15.
 */
$(window).load(function () {
    game.init();
});

var game = {
    init: function () {
        loader.init();
        mouse.init();

        $('.gamelayer').hide();
        $('#gamestartscreen').show();

        game.backgroundCanvas = document.getElementById('gamebackgroundcanvas');
        game.backgroundContext = game.backgroundCanvas.getContext('2d');

        game.foregroundCanvas = document.getElementById('gameforegroundcanvas');
        game.foregroundContext = game.foregroundCanvas.getContext('2d');

        game.canvasWidth = game.backgroundCanvas.width;
        game.canvasHeight = game.backgroundCanvas.height;
    },
    start: function () {
        $('.gamelayer').hide();
        $('#gameinterfacescreen').show();
        game.running = true;
        game.refreshBackground = true;

        game.drawingLoop();
    },

    gridSize: 20,
    backgroundChanged: true,
    animationTimeout: 100,
    offsetX: 0,
    offsetY: 0,
    panningThreshold: 60,
    panningSpeed: 10,
    handlePanning: function () {
        if (!mouse.insideCanvas) {
            return;
        }
        if (mouse.x <= game.panningThreshold) {
            if (game.offsetX >= game.panningSpeed) {
                game.refreshBackground = true;
                game.offsetX -= game.panningSpeed;
            }
        } else if (mouse.x >= game.canvasWidth - game.panningThreshold) {
            if (game.offsetX + game.canvasWidth + game.panningSpeed <= game.currentMapImage.width) {
                game.refreshBackground = true;
                game.offsetX += game.panningSpeed;
            }
        }
        if (mouse.y <= game.panningThreshold) {
            if (game.offsetY >= game.panningSpeed) {
                game.refreshBackground = true;
                game.offsetY -= game.panningSpeed;
            }
        } else if (mouse.y >= game.canvasHeight - game.panningThreshold) {
            if (game.offsetY + game.canvasHeight + game.panningSpeed <= game.currentMapImage.height) {
                game.refreshBackground = true;
                game.offsetY += game.panningSpeed;
            }
        }
        if (game.refreshBackground) {
            // Update mouse game coordinates based on game offsets
            mouse.calculateGameCoordinates();
        }

    },
    animationLoop: function () {
        for (var i = game.items.length - 1; i >= 0; i--) {
            game.items[i].animate();
        }
        game.sortedItems = $.extend([], game.items);
        game.sortedItems.sort(function (a, b) {
            return b.y - a.y + ((b.y == a.y) ? (a.x - b.x) : 0);
        });
    },
    drawingLoop: function () {
        game.handlePanning();

        if (game.refreshBackground) {
            game.backgroundContext.drawImage(game.currentMapImage, game.offsetX, game.offsetY,
                game.canvasWidth, game.canvasHeight, 0, 0, game.canvasWidth, game.canvasHeight);
            game.refreshBackground = false;
        }

        // Clear the foreground canvas
        game.foregroundContext.clearRect(0, 0, game.canvasWidth, game.canvasHeight);

        // Start drawing the foreground elements
        for (var i = game.sortedItems.length - 1; i >= 0; i--) {
            game.sortedItems[i].draw();
        }
        ;

        // Start drawing the foreground elements
        // Draw the mouse
        mouse.draw();

        if (game.running) {
            requestAnimationFrame(game.drawingLoop);
        }
    },
    resetArrays: function () {
        game.counter = 1;
        game.items = [];
        game.sortedItems = [];
        game.buildings = [];
        game.vehicles = [];
        game.aircraft = [];
        game.terrain = [];
        game.triggeredEvents = [];
        game.selectedItems = [];
        game.sortedItems = [];
    },
    add: function (itemDetails) {
        // Set a unique id for the item
        if (!itemDetails.uid) {
            itemDetails.uid = game.counter++;
        }
        var item = window[itemDetails.type].add(itemDetails);
        // Add the item to the items array
        game.items.push(item);
        // Add the item to the type specific array
        game[item.type].push(item);
        return item;
    },
    remove: function (item) {
        // Unselect item if it is selected
        item.selected = false;
        for (var i = game.selectedItems.length - 1; i >= 0; i--) {
            if (game.selectedItems[i].uid == item.uid) {
                game.selectedItems.splice(i, 1);
                break;
            }
        }
        ;
        // Remove item from the items array
        for (var i = game.items.length - 1; i >= 0; i--) {
            if (game.items[i].uid == item.uid) {
                game.items.splice(i, 1);
                break;
            }
        }
        ;
        // Remove items from the type specific array
        for (var i = game[item.type].length - 1; i >= 0; i--) {
            if (game[item.type][i].uid == item.uid) {
                game[item.type].splice(i, 1);
                break;
            }
        }
        ;
    },
    /* Selection Related Code */
    selectionBorderColor: "rgba(255,255,0,0.5)",
    selectionFillColor: "rgba(255,215,0,0.2)",
    healthBarBorderColor: "rgba(0,0,0,0.8)",
    healthBarHealthyFillColor: "rgba(0,255,0,0.5)",
    healthBarDamagedFillColor: "rgba(255,0,0,0.5)",
    lifeBarHeight: 5,
    clearSelection: function () {
        while (game.selectedItems.length > 0) {
            game.selectedItems.pop().selected = false;
        }
    },
    selectItem: function (item, shiftPressed) {
        // Pressing shift and clicking on a selected item will deselect it
        if (shiftPressed && item.selected) {
            // deselect item
            item.selected = false;
            for (var i = game.selectedItems.length - 1; i >= 0; i--) {
                if (game.selectedItems[i].uid == item.uid) {
                    game.selectedItems.splice(i, 1);
                    break;
                }
            }
            ;
            return;
        }
        if (item.selectable && !item.selected && item.team == game.team) {
            item.selected = true;
            game.selectedItems.push(item);
        }
    },
};