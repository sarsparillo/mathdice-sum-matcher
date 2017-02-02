var Main = function(game) {

};

Main.prototype = {

    // get all that juice together
    create: function() {
        var mathdice = this;

        mathdice.game.stage.backgroundColor = "e1e4ea";

        // the tile
        mathdice.tileTypes = [
            'd1', 'd2', 'd3',
            'd4', 'd5', 'd6',
            'd7', 'd8', 'd9'
        ];

        mathdice.operators = [
            'add', 'subtract', 'multiply', 'divide'
        ];

        // the score
        mathdice.score = 0;

        // keep track of tile that are being swapped
        mathdice.activeTile1 = null;
        mathdice.activeTile2 = null;

        // control if player can do a move or not
        mathdice.canMove = false;

        // get that tile size
        mathdice.tileWidth = mathdice.game.cache.getImage('d1').width;
        mathdice.tileHeight = mathdice.game.cache.getImage('d1').height;

        // hold all the tiles
        mathdice.tiles = mathdice.game.add.group();

        // init grid
        mathdice.tileGrid = [
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null]
        ];

        // random data seed
        var seed = Date.now();
        mathdice.random = new Phaser.RandomDataGenerator([seed]);

        // turn the key start the engine
        mathdice.initTiles();
        mathdice.createScore();
    },

    // update that cup of juice every frame
    update: function() {
        var mathdice = this;

        // check if the user is moving a tile over adjacent tile
        if(mathdice.activeTile1 && !mathdice.activeTile2) {

            // where's the pointer
            var hoverX = mathdice.game.input.x;
            var hoverY = mathdice.game.input.y;

            // where's that in relation to the positional array
            var hoverPosX = Math.floor(hoverX/mathdice.tileWidth);
            var hoverPosY = Math.floor(hoverY/mathdice.tileHeight);

            // didja drag over another position
            var difX = (hoverPosX - mathdice.startPosX);
            var difY = (hoverPosY - mathdice.startPosY);

            // didja drag inside the valid area
            if(!(hoverPosY > mathdice.tileGrid[0].length - 1 || hoverPosY < 0) && !(hoverPosX > mathdice.tileGrid.length - 1 || hoverPosX < 0)) {

                // trigger swap if user's dragged over another space
                if((Math.abs(difY) == 1 && difX == 0) || (Math.abs(difX) == 1 && difY ==0)) {

                    // can't make moves during checks
                    mathdice.canMove = false;

                    // define what tile the piece was just dragged over
                    mathdice.activeTile2 = mathdice.tileGrid[hoverPosX][hoverPosY];

                    // swapp'm
                    mathdice.swapTiles();

                    // check matches after a swappo
                    mathdice.game.time.events.add(250, function() {
                        mathdice.checkMatch();
                    });
                }
            }
        }
    },

    // trigger gameover
    gameOver: function() {
        this.game.state.start('GameOver');
    },

    // initialize tiles
    initTiles: function() {
        var mathdice = this;

        // loop through columns
        for(var i = 0; i < mathdice.tileGrid.length; i++) {

            // loop through position in columns, starting from the top
            for(var j = 0; j < mathdice.tileGrid.length; j++) {

                // add tile to game at here
                var tile = mathdice.addTile(i, j);

                // keep track of tiles in positional array
                mathdice.tileGrid[i][j] = tile;
            }
        }

        // oh yeah - check for matches
        mathdice.game.time.events.add(300, function() {
            mathdice.checkMatch();
        });
    },

    // make a new tile
    addTile: function(x, y) {
        var mathdice = this;

        // pick random tile
        var tileToAdd = mathdice.tileTypes[mathdice.random.integerInRange(0, mathdice.tileTypes.length - 1)]; 

        // add it at correct x, and at top of screen
        var tile = mathdice.tiles.create((x * mathdice.tileWidth) + mathdice.tileWidth / 2, 0, tileToAdd);

        // animate into position
        mathdice.game.add.tween(tile).to({y:y*mathdice.tileHeight+(mathdice.tileHeight/2)}, 250, Phaser.Easing.Linear.In, true)

        // set anchor point to center
        tile.anchor.setTo(0.5, 0.5);

        // enable input
        tile.inputEnabled = true;

        // keep track of tile
        tile.tileType = tileToAdd;

        // trigger 'tileDown' if someone clicks or taps on it
        tile.events.onInputDown.add(mathdice.tileDown, mathdice);

        return tile;
    },

    // track where the user last clicked
    tileDown: function(tile, pointer) {
        var mathdice = this;

        if(mathdice.canMove) {
            mathdice.activeTile1 = tile;

            mathdice.startPosX = (tile.x - mathdice.tileWidth/2) / mathdice.tileWidth;
            mathdice.startPosY = (tile.y - mathdice.tileHeight/2) / mathdice.tileHeight;
        }
    },

    // reset the active tile counters - basically, once this is run, the variables that the user's actions are checked against are freed up
    tileUp: function() {
        var mathdice = this;

        mathdice.activeTile1 = null;
        mathdice.activeTile2 = null;
    },

    // if two tiles have been listed as 'active,' swapp'm
    swapTiles: function() {
        var mathdice = this;

        // see cause the activeTile1 and 2 variables are usually 'null' unless activated
        if(mathdice.activeTile1 && mathdice.activeTile2) {

            var tile1Pos = {x:(mathdice.activeTile1.x - mathdice.tileWidth / 2) / mathdice.tileWidth, y:(mathdice.activeTile1.y - mathdice.tileHeight / 2) / mathdice.tileHeight};
            var tile2Pos = {x:(mathdice.activeTile2.x - mathdice.tileWidth / 2) / mathdice.tileWidth, y:(mathdice.activeTile2.y - mathdice.tileHeight / 2) / mathdice.tileHeight};

            // swap tiles in positional array
            mathdice.tileGrid[tile1Pos.x][tile1Pos.y] = mathdice.activeTile2;
            mathdice.tileGrid[tile2Pos.x][tile2Pos.y] = mathdice.activeTile1;

            // swap tiles in actual how they look world
            mathdice.game.add.tween(mathdice.activeTile1).to({x:tile2Pos.x * mathdice.tileWidth + (mathdice.tileWidth/2), y:tile2Pos.y * mathdice.tileHeight + (mathdice.tileHeight/2)}, 110, Phaser.Easing.Linear.In, true);
            mathdice.game.add.tween(mathdice.activeTile2).to({x:tile1Pos.x * mathdice.tileWidth + (mathdice.tileWidth/2), y:tile1Pos.y * mathdice.tileHeight + (mathdice.tileHeight/2)}, 110, Phaser.Easing.Linear.In, true);

            mathdice.activeTile1 = mathdice.tileGrid[tile1Pos.x][tile1Pos.y];
            mathdice.activeTile2 = mathdice.tileGrid[tile2Pos.x][tile2Pos.y];

        }
    },

    // handler that checks if what you just did made any matches
    checkMatch: function() {
        var mathdice = this;

        // getMatches actually checks for tiles; this tells getMatches to run
        var matches = mathdice.getMatches(mathdice.tileGrid);

        // oh didja get matches from getMatches? do this
        if(matches.length > 0) {
            // kill all matches
            mathdice.removeTileGroup(matches);

            // move everything where it needs to go
            mathdice.resetTile();

            // make new tiles, because if you are running this, you definitely need to make new tiles
            mathdice.fillTile();

            // after a half second, let the user do things again
            mathdice.game.time.events.add(250, function() {
                mathdice.tileUp();
            });

            // check again just in case you made a big ole cascade happen
            mathdice.game.time.events.add(300, function() {
                mathdice.checkMatch();
            });
        } else {
            // nothing matched, so put the tiles back to their initial positions and let the user do things again
            // this only gets run here because the previous "if" will continuously run
            // y'know, until this is available again anyway
            mathdice.swapTiles();
            mathdice.game.time.events.add(250, function() {
                mathdice.tileUp();
                mathdice.canMove = true;
            });
        }
    },

    // actually find out if any tiles match or not
    getMatches: function(tileGrid) {
        var matches = [];
        var groups = [];

        // check for horizontal matches
        for (var i = 0; i < tileGrid.length; i++)
        {
            var tempArr = tileGrid[i];
            groups = [];
            for (var j = 0; j < tempArr.length; j++)
            {
                if(j < tempArr.length - 2)
                    if (tileGrid[i][j] && tileGrid[i][j + 1] && tileGrid[i][j + 2])
                    {
                        if (tileGrid[i][j].tileType == tileGrid[i][j+1].tileType && tileGrid[i][j+1].tileType == tileGrid[i][j+2].tileType)
                        {
                            if (groups.length > 0)
                            {
                                if (groups.indexOf(tileGrid[i][j]) == -1)
                                {
                                    matches.push(groups);
                                    groups = [];
                                }
                            }

                            if (groups.indexOf(tileGrid[i][j]) == -1)
                            {
                                groups.push(tileGrid[i][j]);
                            }
                            if (groups.indexOf(tileGrid[i][j+1]) == -1)
                            {
                                groups.push(tileGrid[i][j+1]);
                            }
                            if (groups.indexOf(tileGrid[i][j+2]) == -1)
                            {
                                groups.push(tileGrid[i][j+2]);
                            }
                        }
                    }
            }
            if(groups.length > 0) matches.push(groups);
        }

        // check for vertical matches
        for (j = 0; j < tileGrid.length; j++)
        {
            var tempArr = tileGrid[j];
            groups = [];
            for (i = 0; i < tempArr.length; i++)
            {
                if(i < tempArr.length - 2)
                    if (tileGrid[i][j] && tileGrid[i+1][j] && tileGrid[i+2][j])
                    {
                        if (tileGrid[i][j].tileType == tileGrid[i+1][j].tileType && tileGrid[i+1][j].tileType == tileGrid[i+2][j].tileType)
                        {
                            if (groups.length > 0)
                            {
                                if (groups.indexOf(tileGrid[i][j]) == -1)
                                {
                                    matches.push(groups);
                                    groups = [];
                                }
                            }

                            if (groups.indexOf(tileGrid[i][j]) == -1)
                            {
                                groups.push(tileGrid[i][j]);
                            }
                            if (groups.indexOf(tileGrid[i+1][j]) == -1)
                            {
                                groups.push(tileGrid[i+1][j]);
                            }
                            if (groups.indexOf(tileGrid[i+2][j]) == -1)
                            {
                                groups.push(tileGrid[i+2][j]);
                            }
                        }
                    }
            }
            if(groups.length > 0) matches.push(groups);
        }

        return matches;

    },

    // loops through all matches and removes the tiles associated with the 'match' - matches are filed into groups, see
    removeTileGroup: function(matches) {
        var mathdice = this;

        // here's the actual loop
        for(var i = 0; i < matches.length; i++) {
            var tempArr = matches[i];

            for(var j = 0; j < tempArr.length; j++) {

                var tile = tempArr[j];
                // find tile's home in positional array
                var tilePos = mathdice.getTilePos(mathdice.tileGrid, tile);

                // kill the tile from the screen
                mathdice.tiles.remove(tile);

                // add dat hyphy hyphy score
                mathdice.incrementScore();

                // kill tile from positional array
                if(tilePos.x != -1 && tilePos.y != -1) {
                    mathdice.tileGrid[tilePos.x][tilePos.y] = null;
                }               
            }
        }
    },

    // find position of specific tile in grid
    getTilePos: function(tileGrid, tile) {
        // if nothing's found, the generic position is off screen; also applies if this spits up an error
        var pos = {x:-1, y:-1};

        for(var i = 0; i < tileGrid.length ; i++) {

            for(var j = 0; j < tileGrid[i].length; j++) {
                // if there's a match, return this position
                // if there's no match, it'll return the off screen position from above
                if(tile == tileGrid[i][j]) {
                    pos.x = i;
                    pos.y = j;
                    break;
                }
            }
        }

        return pos;
    },

    // moves tiles left on the board to their new position
    resetTile: function() {
        var mathdice = this;

        // loop through columns from the left
        for (var i = 0; i < mathdice.tileGrid.length; i++) {

            // loop up tiles in column from bottom to top
            // top to bottom won't work, because ish falls down, because gravity
            for (var j = mathdice.tileGrid[i].length - 1; j > 0; j--) {

                // if this space is blank, but the one above it is not, move the up one down
                // see why top to bottom won't work like duhdoink
                if(mathdice.tileGrid[i][j] == null && mathdice.tileGrid[i][j-1] != null) {
                    
                    // a temporary tile is used here because computers don't understand "swap nothing" as good as they should
                    var tempTile = mathdice.tileGrid[i][j-1];
                    mathdice.tileGrid[i][j] = tempTile;
                    mathdice.tileGrid[i][j-1] = null;

                    mathdice.game.add.tween(tempTile).to({y:(mathdice.tileHeight*j)+(mathdice.tileHeight/2)}, 110, Phaser.Easing.Linear.In, true);

                    // positions all changed so start this process again from the bottom
                    // we're at the end of a loop so we don't gotta set this to -1
                    j = mathdice.tileGrid[i].length;
                }
            }
        }
    },

    // fill empty spaces with that new new tile
    fillTile: function() {
        var mathdice = this;

        for(var i = 0; i < mathdice.tileGrid.length; i++) {
            for(var j = 0; j < mathdice.tileGrid.length; j++) {

                if (mathdice.tileGrid[i][j] == null) {
                    // blank spots will show up as 'null' in positional array so make a new boy here
                    var tile = mathdice.addTile(i, j);

                    // prolly tell the positional array there's a new boy tho so there's no issues
                    mathdice.tileGrid[i][j] = tile;
                }
            }
        }
    },

    // build the score label
    createScore: function() {
        var mathdice = this;
        var scoreFont = "100px Arial";

        mathdice.scoreLabel = mathdice.game.add.text((Math.floor(mathdice.tileGrid[0].length / 2) * mathdice.tileWidth), mathdice.tileGrid.length * mathdice.tileHeight, "0", {font: scoreFont, fill: "#012"}); 
        mathdice.scoreLabel.anchor.setTo(0.5, 0);
        mathdice.scoreLabel.align = 'center';
    },

    // add some to the score
    incrementScore: function() {
        var mathdice = this;

        mathdice.score += 1;   
        mathdice.scoreLabel.text = mathdice.score;
    },

};