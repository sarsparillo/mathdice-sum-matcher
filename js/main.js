var Main = function(game) {

};

Main.prototype = {

    // pour a hefty cup of juice
    create: function() {

        var me = this;

        /* var target = "8";

        if (me.game.cache.getText('targets').indexOf(' ' + target + ' ') > -1) {
            alert("exists");
        } else {
            alert("does not exist");
        }
        
        "target" will become the sum of the swiped tiles

        */

        // bgColor duh
        me.game.stage.backgroundColor = "e1e4ea";

        // declare numbers
        me.tileNumbers = [
            "1", "2", "3", "4", "5", "6", "7", "8", "9"
        ];

        // init grid
        me.tileGrid = [
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null]
        ];

        // use these colors for tiles its fun
        me.tileColors = [
            '#4470df'
        ];

        // define tile width and height
        me.tileWidth = 125;
        me.tileHeight = 125;

        // group up all the tiles so they are together and peachy keen and you can just say hey, tiles, what's up and they go oh nm braaaaaah
        me.tiles = me.game.add.group();

        // keep a reference to grid width/height
        me.boardWidth = me.tileGrid[0].length * me.tileWidth;
        me.boardHeight = me.tileGrid.length * me.tileHeight;

        // also keep a buffer for centering
        me.leftBuffer = (me.game.width - me.boardWidth) / 2;
        me.topBuffer = (me.game.height - me.boardHeight) / 2;



        // keep track if the player is currently drawing a sum
        me.guessing = false;
        me.game.input.onDown.add(function() {me.guessing = true;}, me);
        me.game.input.onUp.add(function() {me.guessing = false;}, me);


        // tempraroy dw it's gon be fix
        me.currentWord = []; // holds things currently being traced
        me.correctWords = []; // keeps track of all previous guesses, useful for tutorial only

        // userscore - buffer is to 'animate' the score growing
        me.score = 0;
        me.scoreBuffer = 0;



        // random generator, always good to use
        var seed = Date.now();
        me.random = new Phaser.RandomDataGenerator([seed]);

        // set up initial tiles 
        me.initTiles();

        // set up score
        me.createScore();

        
        // define how long the game should last
        me.remainingTime = 6000;
        me.fullTime = 6000;

        me.createTimer();

        me.gameTimer = game.time.events.loop(100, function() {
            me.updateTimer();
        });

    }, // end create method

    // primarily loops through columns and rows of tileGrid
    initTiles: function() {

        var me = this;

        // loop through grid columns to put things in place
        for (var i=0; i<me.tileGrid.length; i++) {
            
            // loop through grid rows you've done this two dozen times
            for (var j=0; j<me.tileGrid.length; j++) {

                // add tile here
                var tile = me.addTile(i, j);

                // keep track of positions in tileGrid
                me.tileGrid[i][j] = tile;
            }
        }

    }, // end initTiles method


    // actually adds a tile at positions x and y
    addTile: function(x, y) {

        var me = this;

        // choose random tile to add
        var tileNumber = me.tileNumbers[me.random.integerInRange(0, me.tileNumbers.length -1)];
        // temp this we'll switch to "this image" asap
        var tileColor = me.tileColors[me.random.integerInRange(0, me.tileColors.length -1)];

        var tileToAdd = me.createTile(tileNumber, tileColor);

        // add tile at correct x position, add from top of game to allow slide in
        var tile = me.tiles.create(me.leftBuffer + (x * me.tileWidth) + me.tileWidth / 2, 0, tileToAdd);


        // do slide in
        me.game.add.tween(tile).to({y: me.topBuffer + (y * me.tileHeight + (me.tileHeight / 2))}, 320, Phaser.Easing.Quintic.In, true);

        // set anchor point to center
        tile.anchor.setTo(0.5, 0.5);

        // keep track of tile added
        tile.tileNumber = tileNumber;

        return tile;

    }, // end addTile method

    // creates the tile being added
    createTile: function(number, color) {

        var me = this;

        var tile = me.game.add.bitmapData(me.tileWidth, me.tileHeight);

        tile.ctx.rect(5, 5, me.tileWidth - 5, me.tileHeight - 5);
        tile.ctx.fillStyle = color;
        tile.ctx.fill();

        tile.ctx.font = '75px Arial';
        tile.ctx.textAlign = 'center';
        tile.ctx.textBaseline = 'middle';
        tile.ctx.fillStyle = '#fff';
        if (color == '#ffffff') {
            tile.ctx.fillStyle = '#000000';
        }
        tile.ctx.fillText(number, me.tileWidth / 2, me.tileHeight / 2);

        return tile;

    }, // end createTile method


    // update that cup of juice every frame
    update: function() {

        var me = this;

        // if currently guessing... (cursor/touch will guaranteed be happening if guessing, so don't need to refer to that at all)
        if (me.guessing) {

            // get cursor location
            var hoverX = me.game.input.x;
            var hoverY = me.game.input.y;

            // where does that exist on the theoretical grid
            var hoverPosX = Math.floor((hoverX - me.leftBuffer) / me.tileWidth);
            var hoverPosY = Math.floor((hoverY - me.topBuffer) / me.tileHeight);

            // check if dragging within game bounds - literally just 'if inside these bounds'
            if (hoverPosX >= 0 && 
                hoverPosX < me.tileGrid[0].length && 
                hoverPosY >= 0 && 
                hoverPosY < me.tileGrid.length) {

                // grab tile being hovered up ons
                var hoverTile = me.tileGrid[hoverPosX][hoverPosY];

                // get grabbed tile bounds
                var tileLeftPosition = me.leftBuffer + (hoverPosX * me.tileWidth);
                var tileRightPosition = me.leftBuffer + (hoverPosX * me.tileWidth) + me.tileWidth;
                var tileTopPosition = me.topBuffer + (hoverPosY * me.tileHeight);
                var tileBottomPosition = me.topBuffer + (hoverPosY * me.tileHeight) + me.tileHeight;

                // if player is hovering over tile, set it active
                if (!hoverTile.isActive &&
                    hoverX > tileLeftPosition &&
                    hoverX < tileRightPosition &&
                    hoverY > tileTopPosition &&
                    hoverY < tileBottomPosition) {

                    // set tile active
                    hoverTile.isActive = true;
                    console.log(hoverTile.tileNumber); // check for sure that this is working

                    // push tile to current sum
                    me.currentWord.push(hoverTile);

                } // end if hovering
            } // end if inside bounds

        } else {

            // so here's where the sum will go
            if (me.currentWord.length > 0) {
                // var 'sum' duh
                var guessedWord = '';

                // build a string out of active tiles
                // this will actually be build sum but we just playin rn
                for (var i=0; i<me.currentWord.length; i++) {
                    guessedWord += me.currentWord[i].tileNumber;
                    me.currentWord[i].isActive = false;
                }

                // check if this is used in dictionary
                // the dictionary would, in the big picture, be swapped out for various things
                // ie, "primes only" or "divisibles" i assume
                if (me.game.cache.getText('targets').indexOf(' ' + guessedWord + ' ') > -1 && guessedWord.length > 0) {

                    // check that word hasn't been guessed - unneccessary in final
                    if (me.correctWords.indexOf(guessedWord) == -1) {

                        console.log('you done did it chief');

                        // add points to score buffer
                        me.scoreBuffer += 10 * guessedWord.length;
                        me.remainingTime += 200;

                        // add to guessed words
                        me.correctWords.push(guessedWord);
                    } // end if guessed check
                } else {
                    console.log('aw beans!');
                }// end if used in dictionary

                // reset current word
                me.currentWord = [];
            } // end 'if a sum has been made' essentially

        };

        // drains added points from score buffer - basically creates animation
        if (me.scoreBuffer > 0) {
            me.incrementScore();
            me.scoreBuffer--;
        };

        // timer controllers
        if (me.remainingTime > me.fullTime) {
            me.remainingTime = me.fullTime;
        };
        if (me.remainingTime < 1) {
            me.game.state.restart();
        };

    }, // end update method

    // add to score
    incrementScore: function() {

        var me = this;

        me.score +=1;
        me.scoreLabel.text = me.score;

    }, // end increment score method

    // create score
    createScore: function() {

        var me = this;
        var scoreFont = "100px Arial";

        me.scoreLabel = me.game.add.text(me.game.world.centerX, me.topBuffer + 10 + me.tileGrid.length * me.tileHeight, "0", {font: scoreFont, fill: "#ffffff", stroke: "#535353", strokeThickness: 15}); 

        me.scoreLabel.anchor.setTo(0.5, 0);
        me.scoreLabel.align = 'center';

    }, // end create score method

    // create a timer to count down
    createTimer: function() {

        var me = this;

        me.timeBar = me.game.add.bitmapData(me.game.width, 50);

        // color it
        me.timeBar.ctx.rect(0, 0, me.game.width, 50);
        me.timeBar.ctx.fillStyle = '#e33f30';
        me.timeBar.ctx.fill();

        me.timeBar = me.game.add.sprite(0, 0, me.timeBar);
        me.timeBar.cropEnabled = true;

    }, // end create timer method

    // update timer
    updateTimer: function() {

        var me = this;

        me.remainingTime -= 10;

        var cropRect = new Phaser.Rectangle(0, 0, (me.remainingTime / me.fullTime) * me.game.width, me.timeBar.height);
        me.timeBar.crop(cropRect);

    }, // end update timer

    // trigger gameover
    gameOver: function() {
        this.game.state.start('GameOver');
    },

};