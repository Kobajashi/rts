/**
 * Created by tbier on 22.09.15.
 */
var mouse = {
    x: 0,
    y: 0,

    gameX: 0,
    gameY: 0,

    gridX: 0,
    gridY: 0,

    dragX: 0,
    dragY: 0,

    buttonPressed: false,
    dragSelect: false,
    insideCanvas: false,

    click: function (ev, rightClick) {
        var clickedItem = this.itemUnderMouse();
        var shiftPressed = ev.shiftKey;

        if (!rightClick) {
            if (clickedItem) {
                if (!shiftPressed) {
                    game.clearSelection();
                }
                game.selectItem(clickedItem, shiftPressed);
            }
        } else {
            var uids = [];
            if (clickedItem) {
                if (clickedItem.type != 'terrain') {
                    if (clickedItem.team != game.team) { // player right clicked on enemy
                        for (var i = game.selectedItems.length - 1; i >= 0; i--) {
                            var item = game.selectedItems[i];
                            if (item.team == game.team && item.canAttack) {
                                uids.push(item.uid);
                            }
                        }
                        if (uids.length > 0) {
                            game.sendCommand(uids, {type: "attack", toUid: clickedItem.uid});
                        }
                    } else { // player right clicked frindly unit
                        //identify selected items from players team that can move
                        for (var i = game.selectedItems.length - 1; i >= 0; i--) {
                            var item = game.selectedItems[i];
                            if (item.team == game.team && (item.type == "vehicles" ||
                                item.type == "aircraft")) {
                                uids.push(item.uid);
                            }
                        }
                        ;
                        // then command them to guard the clicked item
                        if (uids.length > 0) {
                            game.sendCommand(uids, {type: "guard", toUid: clickedItem.uid});
                        }
                    }
                } else if (clickedItem.type == 'oilfield') {
                    for (var i = game.selectedItems.length - 1; i >= 0; i--) {
                        var item = game.selectedItems[i];
                        if (item.team == game.team && (item.type == "vehicles" && item.name ==
                            "harvester")) {
                            uids.push(item.uid);
                            break;
                        }
                    }
                    if (uids.length > 0) {
                        game.sendCommand(uids, {type: "deploy", toUid: clickedItem.uid});
                    }
                }
            } else {
                for (var i = game.selectedItems.length - 1; i >= 0; i--) {
                    var item = game.selectedItems[i];
                    if (item.team == game.team && (item.type == "vehicles" || item.type == "aircraft")) {
                        uids.push(item.uid);
                    }
                }
                ;
                if (uids.length > 0) {
                    game.sendCommand(uids, {
                        type: "move", to: {
                            x: mouse.gameX / game.gridSize,
                            y: mouse.gameY / game.gridSize
                        }
                    });
                }
            }
        }
    },
    itemUnderMouse: function () {
        for (var i = game.items.length - 1; i >= 0; i--) {
            var item = game.items[i];
            if (item.type == "buildings" || item.type == "terrain") {
                if (item.lifeCode != "dead"
                    && item.x <= (mouse.gameX) / game.gridSize
                    && item.x >= (mouse.gameX - item.baseWidth) / game.gridSize
                    && item.y <= mouse.gameY / game.gridSize
                    && item.y >= (mouse.gameY - item.baseHeight) / game.gridSize
                ) {
                    return item;
                }
            } else if (item.type == "aircraft") {
                if (item.lifeCode != "dead" &&
                    Math.pow(item.x - mouse.gameX / game.gridSize, 2) + Math.pow(item.y - (mouse.gameY + item.
                            pixelShadowHeight) / game.gridSize, 2) < Math.pow((item.radius) / game.gridSize, 2)) {
                    return item;
                }
            } else {
                if (item.lifeCode != "dead" && Math.pow(item.x - mouse.gameX / game.gridSize, 2) + Math.
                        pow(item.y - mouse.gameY / game.gridSize, 2) < Math.pow((item.radius) / game.gridSize, 2)) {
                    return item;
                }
            }
        }
    },
    draw: function () {
        if (this.dragSelect) {
            var x = Math.min(this.gameX, this.dragX);
            var y = Math.min(this.gameY, this.dragY);
            var width = Math.abs(this.gameX - this.dragX);
            var height = Math.abs(this.gameY - this.dragY);
            game.foregroundContext.strokeStyle = 'white';
            game.foregroundContext.strokeRect(x - game.offsetX, y - game.offsetY, width, height);
        }
    },
    calculateGameCoordinates: function () {
        mouse.gameX = mouse.x + game.offsetX;
        mouse.gameY = mouse.y + game.offsetY;

        mouse.gridX = Math.floor((mouse.gameX) / game.gridSize);
        mouse.gridY = Math.floor((mouse.gameY) / game.gridSize);
    },
    init: function () {
        var $mouseCanvas = $('#gameforegroundcanvas');
        $mouseCanvas.mousemove(function (ev) {
            var offset = $mouseCanvas.offset();
            mouse.x = ev.pageX - offset.left;
            mouse.y = ev.pageY - offset.top;

            mouse.calculateGameCoordinates();
            if (mouse.buttonPressed) {
                if ((Math.abs(mouse.dragX - mouse.gameX) > 4 || Math.abs(mouse.dragY - mouse.gameY) > 4)) {
                    mouse.dragSelect = true;
                }
            } else {
                mouse.dragSelect = false;
            }
        });
        $mouseCanvas.click(function (ev) {
            mouse.click(ev, false);
            mouse.dragSelect = false;
            return false;
        });
        $mouseCanvas.mousedown(function (ev) {
            if (ev.which == 1) {
                mouse.buttonPressed = true;
                mouse.dragX = mouse.gameX;
                mouse.dragY = mouse.gameY;
                ev.preventDefault();
            }
            return false;
        });
        $mouseCanvas.bind('contextmenu', function (ev) {
            mouse.click(ev, false);
            return false;
        });
        $mouseCanvas.mouseup(function (ev) {
            var shiftPressed = ev.shiftKey;
            if (ev.which == 1) {
                //Left key was released
                if (mouse.dragSelect) {
                    if (!shiftPressed) {
                        // Shift key was not pressed
                        game.clearSelection();
                    }
                    var x1 = Math.min(mouse.gameX, mouse.dragX) / game.gridSize;
                    var y1 = Math.min(mouse.gameY, mouse.dragY) / game.gridSize;
                    var x2 = Math.max(mouse.gameX, mouse.dragX) / game.gridSize;
                    var y2 = Math.max(mouse.gameY, mouse.dragY) / game.gridSize;
                    for (var i = game.items.length - 1; i >= 0; i--) {
                        var item = game.items[i];
                        if (item.type != "buildings" && item.selectable && item.team == game.team && x1 <=
                            item.x && x2 >= item.x) {
                            if ((item.type == "vehicles" && y1 <= item.y && y2 >= item.y)
                                || (item.type == "aircraft" && (y1 <= item.y - item.pixelShadowHeight / game.
                                    gridSize) && (y2 >= item.y - item.pixelShadowHeight / game.gridSize))) {
                                game.selectItem(item, shiftPressed);
                            }
                        }
                    }
                    ;

                }
                mouse.buttonPressed = false;
                mouse.dragSelect = false;
            }
            return false;
        });
        $mouseCanvas.mouseleave(function (ev) {
            mouse.insideCanvas = false;
        });
        $mouseCanvas.mouseenter(function (ev) {
            mouse.buttonPressed = false;
            mouse.insideCanvas = true;
        });

    }
};