var Main = function(game) {};

Main.prototype = {

	// git it goin
	create: function() {

		// always reference a specific 'this' with this
		var me = this;

		me.game.stage.backgroundColor = "e1e4ea";

		// declare numbers in grid - if you wanted like, 'multiples of five' as a challenge, you'd just add another five or two to this
		me.tileNumbers = [
			"1", "2", "3", "4", "5", "6", "7", "8", "9"
		];

		// declare operators
		me.operators = [
			'+', '-', '*', "/"
		];

		// init grid
		me.tileGrid = [
			[null, null, null, null, null],
			[null, null, null, null, null],
			[null, null, null, null, null],
			[null, null, null, null, null],
			[null, null, null, null, null]
		];

		// define tile colors
		me.tileColors = [
			'#2250bd',
			'#3360ce',            
			'#4470df',
			'#5581ef',
			'#6692ff'
		];

		// define tile width and height
		me.tileWidth = 115;
		me.tileHeight = 115;

		// group to hold tiles
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

		// variables used in sum-making
		me.currentSum = []; // holds numbers currently being traced
		me.operand = '+'; // operators as string, will run javascript eval
		me.toHitTarget = 0; // defines the current target to hit

		// userscore - buffer exists to 'animate' the score growing
		me.score = 0;
		me.scoreBuffer = 0;

		// random generator, always good to use
		var seed = Date.now();
		me.random = new Phaser.RandomDataGenerator([seed]);


		// set up initial tiles, score, and first target number to hit
		me.initTiles();
		me.createScore();
		me.createTargetLabel();
		me.updateTarget();
		

		// define how long the game should last
		me.remainingTime = 6000;
		me.fullTime = 6000;

		// start the timer going
		me.createTimer();

		me.gameTimer = game.time.events.loop(100, function() {
			me.updateTimer();
		});


		// buttons at top of screen
		var addButton = game.add.button(
			game.world.centerX - (me.tileHeight * 2), 
			me.topBuffer - me.tileHeight, 
			'op-+', 
			function changeOperand() {
				me.operand = '+';
				addButton.setFrames(0,0,2);
				subtractButton.setFrames(0,1,2);
				multiplyButton.setFrames(0,1,2);
				divideButton.setFrames(0,1,2);
			},
			this, 0, 0, 2
			);

		var subtractButton = game.add.button(
			game.world.centerX - me.tileHeight, 
			me.topBuffer - me.tileHeight, 
			'op--', 
			function changeOperand() {
				me.operand = '-';
				addButton.setFrames(0,1,2);
				subtractButton.setFrames(0,0,2);
				multiplyButton.setFrames(0,1,2);
				divideButton.setFrames(0,1,2);
			},
			this, 0, 1, 2
			);

		var multiplyButton = game.add.button(
			game.world.centerX, 
			me.topBuffer - me.tileHeight, 
			'op-*', 
			function changeOperand() {
				me.operand = '*';
				addButton.setFrames(0,1,2);
				subtractButton.setFrames(0,1,2);
				multiplyButton.setFrames(0,0,2);
				divideButton.setFrames(0,1,2);
			},
			this, 0, 1, 2
			);

		var divideButton = game.add.button(
			game.world.centerX + me.tileHeight, 
			me.topBuffer - me.tileHeight, 
			'op-/', 
			function changeOperand() {
				me.operand = '/';
				addButton.setFrames(0,1,2);
				subtractButton.setFrames(0,1,2);
				multiplyButton.setFrames(0,1,2);
				divideButton.setFrames(0,0,2);
			},
			this, 0, 1, 2
			);

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

		// add tile at correct x position, add from top of game to allow slide in
		var tile = me.tiles.create(me.leftBuffer + (x * me.tileWidth) + me.tileWidth / 2, 0, 'd' + tileNumber);
		tile.frame = 0;

		// animate into position - the 'x' animation is not necessary
		me.game.add.tween(tile).to(
			{ y: me.topBuffer + (y * me.tileHeight + (me.tileHeight / 2))},
			400, 
			Phaser.Easing.Quintic.InOut, 
			true);

		// set anchor point to center
		tile.anchor.setTo(0.5, 0.5);

		// keep track of tile added
		tile.tileNumber = tileNumber;

		return tile;

	}, // end addTile method



	// update that cup of juice every frame
	update: function() {

		var me = this;

		// if currently guessing - cannot be true if mouse/touch is not active
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
				hoverTile.frame = 1;
				me.game.input.onUp.add(function() {
					hoverTile.frame = 0;
				}, me);

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
					hoverY < tileBottomPosition &&
					me.currentSum.length < 2) {

					// set tile active
					hoverTile.isActive = true;

					// push tile to current sum
					me.currentSum.push(hoverTile);

				} // end if hovering

			} // end if inside bounds

		} else {

			// check if a sum exists at all
			if (me.currentSum.length > 0) {
				// check if there's two numbers in the sum
				if (me.currentSum.length > 1) {

					// build a string out of active tiles
					var buildSum = '';
					for (var i=0; i<me.currentSum.length; i++) {
						buildSum += me.currentSum[i].tileNumber;
						me.currentSum[i].isActive = false;
					}

					buildSum += me.operand;
					var finalEquation = eval(buildSum[0] + buildSum[2] + buildSum[1]);

					// currently checking if used in entire dictionary
					// dictionary will be traded for target number

					if (finalEquation == toHitTarget) {
						me.scoreAnimation(me.currentSum[1].x, me.currentSum[1].y, '+10', 10);
						me.remainingTime += 200;
						me.removeTile(me.currentSum);
						me.resetTile();
						me.getNewTiles();
						// in initial, is 'me.getMatches(me.tileGrid)'
					} else {
						console.log(finalEquation + ' is not ' + toHitTarget);
						me.remainingTime -= 200;
						me.updateTarget();
					}// end if used in dictionary
				} else {
					me.currentSum[0].isActive = false;
				}
				// reset current sum
				me.currentSum = [];
			} // end sum check

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
			alert('Time up! You scored ' + me.score);
			me.game.state.restart();
		};

	}, // end update method



	// find position of specific tile in grid
	getTilePosition: function(theGrid, tile) {
		// if nothing's found, the generic position is off screen; also applies if this spits up an error
		var position = {x:-1, y:-1};

		for (var i = 0; i < theGrid.length ; i++) {
			for (var j = 0; j < theGrid[i].length; j++) {
				// if there's a match, return this position
				// if there's no match, it'll return the off screen position from above


				if (tile == theGrid[i][j]) {
					position.x = i;
					position.y = j;
					break;
				}
			}
		}

		return position;
	},



	// remove selected tiles
	removeTile: function(removeMe) {
		var me = this;
		console.log(removeMe[0]);
		// loop through selected tiles
		for(var i = 0; i < removeMe.length; i++) {
			// create a temporary array to destroy selected tiles
			var tempArray = [];
			tempArray.push(removeMe[i]);

			for(var j = 0; j < tempArray.length + 1; j++) {
				console.log('removeTile ' + j);
				var tile = tempArray[j];
				// find tile's home in positional array
				var tilePos = me.getTilePosition(me.tileGrid, tile);
				// kill the tile from the screen
				me.tiles.remove(tile);

				// kill tile from positional array
				if(tilePos.x != -1 && tilePos.y != -1) {
					me.tileGrid[tilePos.x][tilePos.y] = null;
				}               
			}
		}
	}, // end remove tiles



	// moves tiles left on the board to their new position
	resetTile: function() {

		var me = this;

		for (var i = 0; i < me.tileGrid.length; i++) {
			// loop from bottom to top to allow for gravity
			for (var j = me.tileGrid[i].length - 1; j > 0; j--) {

				// if this space is blank, but the one above it is not, the one above down
				if(me.tileGrid[i][j] == null && me.tileGrid[i][j-1] != null) {
					
					// making empty tile to handle empty spaces
					var emptyTile = me.tileGrid[i][j-1];
					me.tileGrid[i][j] = emptyTile;
					me.tileGrid[i][j-1] = null;

					me.game.add.tween(emptyTile).to(
						{ y: me.topBuffer + (me.tileHeight * j) + (me.tileHeight / 2) }, 
						250, 
						Phaser.Easing.Quintic.InOut, 
						true);

					// we're at the end of a loop so we don't gotta set this to -1
					j = me.tileGrid[i].length;
				}
			}
		}
	}, // end resetting tiles



	// put new tiles in place
	getNewTiles: function() {
		
		var me = this;

		// iterate through grid to look for blank spaces
		for (var i = 0; i < me.tileGrid.length; i++) {
			for (var j = 0; j < me.tileGrid.length; j++) {
				
				// if blank space found, run new tile at space
				if (me.tileGrid[i][j] == null) {
					var tile = me.addTile(i, j);
					me.tileGrid[i][j] = tile;
				}

			}
		}

	}, // end new tiles



	// add to score
	incrementScore: function() {

		var me = this;

		me.score +=1;
		me.scoreText.text = me.score;

	}, // end increment score



	// create score
	createScore: function() {

		var me = this;
		var scoreFont = "100px Arial";

		me.scoreText = me.game.add.text(me.game.world.centerX, me.topBuffer + 50 + me.tileGrid.length * me.tileHeight, "0", {font: scoreFont, fill: "#ffffff", stroke: "#535353", strokeThickness: 15}); 

		me.scoreText.anchor.setTo(0.5, 0);
		me.scoreText.align = 'center';

		// define the tween when 'hit' with a new score
		me.scoreTween = me.add.tween(me.scoreText.scale).to(
			{ x: 1.35, y: 1.35 },
			150,
			Phaser.Easing.Linear.In).to(
			{ x: 1, y: 1},
			300,
			Phaser.Easing.Linear.In);

	}, // end create score



	// create score animation
	scoreAnimation: function(x, y, floater, score) {

		var me = this;
		var animFont = "50px Arial";

		// new label for score animation
		var anim = me.game.add.text(x, y, floater, {font: animFont, fill: "#39d179", stroke: "#3360ce", strokeThickness: 10});
		anim.anchor.setTo(0.5, 0);
		anim.align = 'center';

		// define the tween for the floater 
		var animTween = me.game.add.tween(anim).to(
			{ x: me.game.world.centerX, y: me.topBuffer + 50 + me.tileGrid.length * me.tileHeight },
			500,
			Phaser.Easing.Quintic.In,
			true);

		animTween.onComplete.add(function() {
			anim.destroy();
			me.scoreTween.start();
			me.scoreBuffer += score;
			me.updateTarget();
		}, me);

	}, // end create score animation



	// create target
	createTargetLabel: function() {

		var me = this;
		var targetFont = "50px Arial";

		me.targetLabel = me.game.add.text(me.game.world.centerX, me.topBuffer + me.tileGrid.length * me.tileHeight, "0", {font: targetFont, fill: "#ab9ba9", stroke: "#4d394b", strokeThickness: 8}); 

		me.targetLabel.anchor.setTo(0.5, 0);
		me.targetLabel.align = 'center';

	}, // end create score



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

	}, // end create timer



	// update timer
	updateTimer: function() {

		var me = this;

		me.remainingTime -= 10;

		var cropRect = new Phaser.Rectangle(0, 0, (me.remainingTime / me.fullTime) * me.game.width, me.timeBar.height);
		me.timeBar.crop(cropRect);

	}, // end update timer



	// get new target
	updateTarget: function() {

		var me = this;
		var targetArray = me.game.cache.getText('targets').split(" ");
		var targetIndex = Math.floor(Math.random() * targetArray.length);

		// set target as random item from library
		toHitTarget = targetArray[targetIndex];
		me.targetLabel.text = 'Target number: ' + toHitTarget;

	}, // end update target



	// trigger gameover
	gameOver: function() {
		this.game.state.start('GameOver');
	}, //end trigger

};