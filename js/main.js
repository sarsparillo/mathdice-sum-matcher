var Main = function(game) {};

Main.prototype = {

	// initialize passable variables
	init: function(gameMode, operator){
		this.gamemode = gameMode;
		this.operand = operator;
	},


	create: function() {
		// set header image
		this.headerBar = this.game.add.sprite(0, 0, 'headerbar');
		this.headerBar.x = this.game.width / 2;
		this.headerBar.anchor.setTo(0.5,0);
		// set header image
		this.headerLogo = this.game.add.sprite(0, 0, 'headerlogo');
		this.headerLogo.x = this.game.width / 2;
		this.headerLogo.anchor.setTo(0.5,0);

		// declare numbers in grid
		this.tileNumbers = [
			"1", "2", "3", "4", "5", "6", "7", "8", "9"
		];
		// declare available operators
		this.operators = [
			"+", "-", "*", "/"
		];

		// init grid
		this.tileGrid = [];

		// define tile selection buffer for diagonal lines
		this.tileSelectionBuffer = MathDice.Params.diceSize / 8;

		// keep a reference to grid width/height
		this.boardWidth = MathDice.Params.gridSize.rows * MathDice.Params.diceSize;
		this.boardHeight = MathDice.Params.gridSize.cols * MathDice.Params.diceSize;

		// also keep a buffer for centering
		this.leftMargin = (this.game.width - this.boardWidth) / 2;
		this.headerMargin = this.headerBar.height + MathDice.Params.padding;

		this.leftButton = this.leftMargin - (250 * 1.0);

		// keep track if the player is currently drawing a sum
		this.guessing = false;
		this.game.input.onDown.add(function() { this.guessing = true; }, this);
		this.game.input.onUp.add(function() { this.guessing = false; }, this);

		// variables used in sum-making
		this.currentSum = []; // holds numbers currently being traced
		this.targetToHit = 0; // defines the current target to hit

		// userscore - buffer exists to 'animate' the score growing
		this.score = 0;
		this.scoreBuffer = 0;

		var seed = Date.now();
		this.random = new Phaser.RandomDataGenerator([seed]);

		// set up initial tiles, score, and first target number to hit
		this.initTiles();
		this.createScore();
		this.createTargetLabel();
		this.updateTarget();
		

		// define how long the game should last - different time for different gamemodes
		if (this.gamemode == "blitz") {
			switch (this.operand) {
				case "+":
					this.remainingTime = 6000;
					this.fullTime = 6000;
					break;
				case "-":
					this.remainingTime = 9000;
					this.fullTime = 9000;
					break;
				case "*":
					this.remainingTime = 9000;
					this.fullTime = 9000;
					break;
				case "/":
					this.remainingTime = 12000;
					this.fullTime = 12000;
					break;
				default:
					this.remainingTime = 6000;
					this.fullTime = 6000;
					break;
			} 
		} 
		else if (this.gamemode == "classic") {
			this.remainingTime = 6000;
			this.fullTime = 6000;
		}

		// start the timer going
		this.createTimer();
		
		// isolating 'this' for timer.
		var g = this;
		this.gameTimer = game.time.events.loop(100, function() {
			g.updateTimer();
		});

		// TRACKING
		// track sums made throughout total playtime
		this.equationList = [];
		// track total time
		this.totalTime = 0;

		this.createButtons();

		// initialize all game sizing
		this.resize(this.game.width, this.game.height);

	}, // end create method

	// scale sprites for multiple devices
	scaleSprite: function(sprite, availableWidth, availableHeight, padding, multiplier) {
		var scale = this.getScale(
			sprite._frame.width, 
			sprite._frame.height, 
			availableWidth, 
			availableHeight, 
			padding);

		sprite.scale.x = scale * multiplier;
		sprite.scale.y = scale * multiplier;
	}, // end scale sprite

	// find out what scale sprites are supposed to be
	getScale: function(spriteWidth, spriteHeight, availableWidth, availableHeight, padding) {
		var scaleRatio = 1;
		var currentRatio = window.devicePixelRatio;

		// sprite should fit either width or height
		var widthRatio = (spriteWidth * currentRatio + 2 * padding) / availableWidth;
		var heightRatio = (spriteHeight * currentRatio + 2 * padding) / availableHeight;

		// devices with ratios higher than 1 need a different ratio calculation
		if (widthRatio > 1 || heightRatio > 1) {
			scaleRatio = 1 / Math.max(widthRatio, heightRatio);
		}

		// 
		return scaleRatio * currentRatio;
	},

	// call all resizing
	resize: function(width, height) {
		// if height to width ratio is less than 1, put layout in landscape mode
		var landscape = height / width < 1?true:false;

		this.headerMargin = this.headerBar.height + MathDice.Params.padding;
		this.scaleHeader(width, height);
		this.scaleTiles(width, height, landscape);
		this.positionUI(width, height, landscape);
	},

	// scale header
	scaleHeader: function(width, height) {
		this.scaleSprite(this.headerBar, width, height, 0, 1);
		this.headerBar.width = this.game.width;
		this.headerBar.x = this.world.centerX;
		this.scaleSprite(this.headerLogo, width, width / 6.857, 0, 1);
		this.headerLogo.x = this.world.centerX;
	}, // end scale header

	// scale tiles; landscape should just adjust top margin
	scaleTiles: function(width, height, landscape) {
		var availableGridSize = Math.min(width, height - this.headerMargin);
		this.calculatedTileSize = availableGridSize / 5;

	}, // end scale tiles

	// position UI; landscape will drastically change where the various bits and pieces exist
	positionUI: function(width, height, landscape) {
		if (landscape) {
			console.log("Landscape!");
		} else {
			console.log("Portrait!");
		}
	}, // end position ui



	// loop through columns and rows of tileGrid
	initTiles: function() {
		// group to hold all tiles
		this.tiles = this.game.add.group();
		this.tiles.x = this.leftMargin;
		this.tiles.y = this.headerMargin;
		
		// loop through grid and place tile at positions
		for (var i=0; i < MathDice.Params.gridSize.rows; i++) {
			this.tileGrid[i] = [];
			for (var j=0; j < MathDice.Params.gridSize.cols; j++) {
				var tile = this.createTile(i, j);

				// keep track of positions in tileGrid
				this.tileGrid[i][j] = tile;
			}
		}
	}, // end initTiles method



	// add a tile at positions x and y
	createTile: function(x, y) {
		// choose random tile to add
		var tileNumber = this.tileNumbers[this.random.integerInRange(0, this.tileNumbers.length -1)];

		// add tile at correct x position, add from top of game to allow slide in
		var tile = this.tiles.create(x * this.calculatedTileSize + this.calculatedTileSize / 2, 0, 'd' + tileNumber);
		tile.frame = 1;
		tile.tileNumber = tileNumber;
		tile.anchor.setTo(0.5);
		// make sure tile is the right size
		this.scaleSprite(tile, this.calculatedTileSize, this.calculatedTileSize, 0, 1);

		// animate into position
		this.game.add.tween(tile).to(
			{ y: (y * this.calculatedTileSize + this.calculatedTileSize / 2) },
			400, 
			Phaser.Easing.Quintic.InOut, 
			true);

		return tile;
	}, // end createTile method



	// update that cup of juice every frame
	update: function() {
		// if currently guessing - cannot be true if mouse/touch is not active
		if (this.guessing) {

			// get cursor location
			var cursorLocationX = this.game.input.x;
			var cursorLocationY = this.game.input.y;

			// where does that exist on the theoretical grid
			var gridLocationX = Math.floor((cursorLocationX - this.leftMargin) / MathDice.Params.diceSize);
			var gridLocationY = Math.floor((cursorLocationY - this.headerMargin) / MathDice.Params.diceSize);
			console.log(gridLocationX + " " + gridLocationY);
			// check if dragging within game bounds - literally just 'if inside these bounds'
			if (gridLocationX >= 0 && 
				gridLocationX < this.tileGrid[0].length && 
				gridLocationY >= 0 && 
				gridLocationY < this.tileGrid.length) {

				// grab tile being hovered up ons
				var activeTile = this.tileGrid[gridLocationX][gridLocationY];

				// get grabbed tile bounds and add a buffer. getbounds doesn't allow easy buffers
				var tileLeftBounds = this.leftMargin + (gridLocationX * MathDice.Params.diceSize) + this.tileSelectionBuffer;
				var tileRightBounds = this.leftMargin + (gridLocationX * MathDice.Params.diceSize) + MathDice.Params.diceSize - this.tileSelectionBuffer;
				var tileTopBounds = this.headerMargin + (gridLocationY * MathDice.Params.diceSize) + this.tileSelectionBuffer;
				var tileBottomBounds = this.headerMargin + (gridLocationY * MathDice.Params.diceSize) + MathDice.Params.diceSize - this.tileSelectionBuffer;

				// if player is hovering over tile, set it active. also, there's margin checks for each tile (because of the getbounds buffer thing).
				if (!activeTile.isActive && 
					cursorLocationX > tileLeftBounds && 
					cursorLocationX < tileRightBounds && 
					cursorLocationY > tileTopBounds && 
					cursorLocationY < tileBottomBounds &&
					this.currentSum.length < 2) {			

					// set tile active, make pink
					activeTile.isActive = true;
					activeTile.frame = 0;
					this.game.input.onUp.add(function() {
						activeTile.frame = 1;
					}, this);
					this.game.sound.play('clickSound');

					// push tile to current sum
					this.currentSum.push(activeTile);

				}
				// 'undo' - allow player to scroll back one 
				else if (activeTile.isActive && this.currentSum.length == 2) {

				}// end if hovering

			} // end if inside bounds check

		} else { // if NOT guessing...

			// check if a sum exists at all
			if (this.currentSum.length > 0) {
				// check if there's two numbers in the sum
				if (this.currentSum.length > 1) {

					// build a string out of active tiles
					var buildSum = '';
					for (var i=0; i<this.currentSum.length; i++) {
						buildSum += this.currentSum[i].tileNumber;
						this.currentSum[i].isActive = false;
					}

					// calculate string
					// .toFixed to make sure no giant decimal strings, + eval to remove unnecessary zeroes
					buildSum += this.operand;
					var finalEquation = + eval(buildSum[0] + buildSum[2] + buildSum[1]).toFixed(2);

					// check if finalEquation matches target
					if (finalEquation == targetToHit) {
						this.game.sound.play('successSound');
						this.animateScore(this.currentSum[1].x, this.currentSum[1].y, this.operand);
						// push equation to tracking list
						this.equationList.push(buildSum[0] + buildSum[2] + buildSum[1]);
						// remove current sum
						this.removeTile(this.currentSum);
						if (this.gamemode == "classic") { 
							this.remainingTime += 400;
						}
						this.resetTile();
						this.getNewTiles();
						console.log(this.equationList);
					} else {
						this.incorrectSum(this.gamemode);
					} // end success check
				} else {
					this.currentSum[0].isActive = false;
				}
				// reset current sum
				this.currentSum = [];
			} // end sum check

		}

		// drains added points from score buffer - basically creates animation
		if (this.scoreBuffer > 0) {
			this.incrementScore();
			this.scoreBuffer--;
		}

		// timer controllers
		if (this.remainingTime > this.fullTime) {
			this.remainingTime = this.fullTime;
		}
		if (this.remainingTime < 1) {
			this.game.state.start("GameOver", true, false, this.score, this.totalTime, this.equationList.length);
		}

		// total time increments in function to allow speedup
		this.countdown(this.equationList.length);

	}, // end update method

	countdown: function(element) {
		this.totalTime = this.totalTime + Math.floor(element/5);
	},


	// incorrectSum
	incorrectSum: function(gamemode) {
		switch (gamemode) {
			case "blitz":
				this.remainingTime -= 400;
				break;
			case "classic":
				this.remainingTime -= 200;
				break;
			default:
				this.remainingTime -= 5;
				break;
		} 
//		this.updateTarget();
	}, // end incorrect sum



	// find position of specific tile in grid
	getTilePosition: function(tileGrid, tile) {
		// if nothing's found, the generic position is off screen; also applies if this spits up an error. 
		var position = {x:-1, y:-1};

		for (var i = 0; i < tileGrid.length ; i++) {
			for (var j = 0; j < tileGrid[i].length; j++) {

				// if there's a match, return this position
				// if there's no match, it'll return the off screen position from above
				if (tile == tileGrid[i][j]) {
					position.x = i;
					position.y = j;
					break;
				}
			}
		}
		return position;
	}, // end get tile position



	// remove tiles
	removeTile: function(removeMe) {
		// loop through selected tiles
		for(var i = 0; i < removeMe.length; i++) {
			var tile = removeMe[i];

			// find tile's home in positional array
			var tilePos = this.getTilePosition(this.tileGrid, tile);

			// kill the tile from the screen
			this.tiles.remove(tile);
			// kill tile from array; also checks to make sure no error is happening
			if(tilePos.x != -1 && tilePos.y != -1) {
				this.tileGrid[tilePos.x][tilePos.y] = null;
			}               
		}		
	}, // end remove tiles



	// moves tiles left on the board to their new position
	resetTile: function() {

		for (var i = 0; i < this.tileGrid.length; i++) {
			// loop from bottom to top to allow for gravity
			for (var j = this.tileGrid[i].length - 1; j > 0; j--) {

				// if this space is blank, but the one above it is not, the one above down
				if(this.tileGrid[i][j] == null && this.tileGrid[i][j-1] != null) {
					
					// making empty tile to handle empty spaces
					var emptyTile = this.tileGrid[i][j-1];
					this.tileGrid[i][j] = emptyTile;
					this.tileGrid[i][j-1] = null;

					this.game.add.tween(emptyTile).to(
						{ y: MathDice.Params.diceSize * j + MathDice.Params.diceSize / 2 }, 
						400, 
						Phaser.Easing.Quintic.InOut, 
						true);

					// we're at the end of a loop so we don't gotta set this to -1
					j = this.tileGrid[i].length;
				}
			}
		}
	}, // end resetting tiles


	// create new tiles in empty spaces
	getNewTiles: function() {		

		for (var i = 0; i < this.tileGrid.length; i++) {
			for (var j = 0; j < this.tileGrid.length; j++) {
				
				// if blank space found, make new tile at space above board
				if (this.tileGrid[i][j] == null) {
					var tile = this.createTile(i, j);
					this.tileGrid[i][j] = tile;
				}
			}
		}
	}, // end new tiles



	// create dice buttons
	createButtons: function() {

		// if random gamemode, add buttons
		if (this.gamemode == "classic") {
			// buttons at top of screen
			var addButton = game.add.button(
				this.leftButton, 
				this.headerMargin + this.boardHeight - (214 * 1.0), 
				'op-+', 
				function changeOperand() {
					this.game.sound.play('clickSound');
					this.operand = '+';
					addButton.setFrames(1,1,1);
					subtractButton.setFrames(1,0,1);
					multiplyButton.setFrames(1,0,1);
					divideButton.setFrames(1,0,1);
				},
				this, 1, 1, 1
				);
			addButton.scale.setTo(1.0, 1.0);

			var subtractButton = game.add.button(
				this.leftButton + (109 * 1.0), 
				this.headerMargin + this.boardHeight - (214 * 1.0), 
				'op--', 
				function changeOperand() {
					this.game.sound.play('clickSound');
					this.operand = '-';
					addButton.setFrames(1,0,1);
					subtractButton.setFrames(1,1,1);
					multiplyButton.setFrames(1,0,1);
					divideButton.setFrames(1,0,1);
				},
				this, 1, 0, 1
				);
			subtractButton.scale.setTo(1.0, 1.0);

			var multiplyButton = game.add.button(
				this.leftButton, 
				this.headerMargin + this.boardHeight - (107 * 1.0), 
				'op-*', 
				function changeOperand() {
					this.game.sound.play('clickSound');
					this.operand = '*';
					addButton.setFrames(1,0,1);
					subtractButton.setFrames(1,0,1);
					multiplyButton.setFrames(1,1,1);
					divideButton.setFrames(1,0,1);
				},
				this, 1, 0, 1
				);
			multiplyButton.scale.setTo(1.0, 1.0);

			var divideButton = game.add.button(
				this.leftButton + (109 * 1.0), 
				this.headerMargin + this.boardHeight - (107 * 1.0), 
				'op-/', 
				function changeOperand() {
					this.game.sound.play('clickSound');
					this.operand = '/';
					addButton.setFrames(1,0,1);
					subtractButton.setFrames(1,0,1);
					multiplyButton.setFrames(1,0,1);
					divideButton.setFrames(1,1,1);
				},
				this, 1, 0, 1
				);
			divideButton.scale.setTo(1.0, 1.0);
		} else if (this.gamemode == "blitz") {
			var topOperator = game.add.sprite(
				game.world.centerX - (MathDice.Params.diceSize / 2),
				this.headerMargin + this.boardHeight - (107 * 1.0),
				"op-" + this.operand);
			topOperator.scale.setTo(1.0, 1.0);
		}
	}, // end create buttons



	// add to score
	incrementScore: function() {

		this.score +=1;
		this.scoreText.text = "Score: " + this.score;
	}, // end increment score



	// create score
	createScore: function() {
		var scoreFont = "40px Arial";

		this.scoreText = this.game.add.text(
			this.game.world.centerX, 
			this.headerMargin + this.tileGrid.length * MathDice.Params.diceSize, "Score: 0", 
			{	font: scoreFont, 
				fill: "#efe", 
				stroke: "#535353", 
				strokeThickness: 10 }); 

		this.scoreText.anchor.setTo(0.5, 0);
		this.scoreText.align = 'center';
		this.scoreText.scale.setTo(1.0, 1.0);

		// define the tween when 'hit' with a new score
		this.scoreTween = this.add.tween(this.scoreText.scale).to(
			{ x: 1.35, y: 1.35 },
			150,
			Phaser.Easing.Linear.In).to(
			{ x: 1, y: 1},
			300,
			Phaser.Easing.Linear.In);
	}, // end create score



	// create score popup animation
	animateScore: function(x, y, operator) {
		var animFont = "50px Arial";

		function score() {
			 switch (operator) {
				case "+": return 10;
				case "-": return 20;
				case "*": return 30;
				case "/": return 50;
				default: return 10;
			}
		}

		// new label for score animation
		var anim = this.game.add.text(
			x, 
			y, 
			'+' + score().toString(), 
			{	font: animFont, 
				fill: "#39d179", 
				stroke: "#3360ce", 
				strokeThickness: 10});

		anim.anchor.setTo(0.5, 0);
		anim.align = 'center';

		// define the tween for the floater 
		var animTween = this.game.add.tween(anim).to(
			{ x: this.game.world.centerX, y: this.headerMargin + 50 + this.tileGrid.length * MathDice.Params.diceSize },
			500,
			Phaser.Easing.Exponential.In,
			true);

		animTween.onComplete.add(function() {
			anim.destroy();
			this.scoreTween.start();
			this.scoreBuffer += score();
			this.updateTarget();
		}, this);
	}, // end create score animation



	// create target
	createTargetLabel: function() {
		var targetFont = "80px Arial";
		var targetPosition = this.leftMargin - (300 * 1.0);
		var targetDice = this.game.add.sprite(targetPosition, this.headerMargin, 'targetDice');
		targetDice.scale.setTo(1.0, 1.0);



		this.targetLabel = this.game.add.text(
			targetPosition + 64, 
			this.headerMargin + 65, 
			"0", 
			{	font: targetFont, 
				fill: "#4d394b", 
				stroke: "#4d394b", 
				strokeThickness: 4}); 

		this.targetLabel.anchor.setTo(0.5, 0.5);
		this.targetLabel.align = 'center';
		this.targetLabel.scale.setTo(1.0, 1.0);

	}, // end create target label



	// get new target
	updateTarget: function() {
		var buildTargetNumber = '';
		
		// pick a tile at random
		var tileCol = Math.floor(Math.random() * this.tileGrid.length);
		var tileRow = Math.floor(Math.random() * this.tileGrid[tileCol].length);
		var startTile = this.tileGrid[tileCol][tileRow];

		buildTargetNumber += startTile.tileNumber;
		
		// randomly pick one of the operators to use for this sum
		var operandIndex = Math.floor(Math.random() * this.operators.length);

		// set up new score type based on gamemode
		if (this.gamemode == "blitz") {
			buildTargetNumber += this.operand;	
		} 
		else if (this.gamemode == "classic") {
			buildTargetNumber += this.operators[operandIndex];
		}


		// pick a connected tile to the selected tile
		var randDir = '' + Math.floor(Math.random() * 2);

		if (randDir == 0) {
			if (tileCol < 4) { tileCol += 1; } 
			else { tileCol -= 1; }
		} else {
			if (tileRow < 4) { tileRow += 1; } 
			else { tileRow -= 1; }
		}

		var nextTile = this.tileGrid[tileCol][tileRow];

		buildTargetNumber += nextTile.tileNumber;

		// .toFixed to make sure no giant decimal strings, + eval to remove unnecessary zeroes
		targetToHit = + eval(buildTargetNumber[0] + buildTargetNumber[1] + buildTargetNumber[2]).toFixed(2);

		this.targetLabel.text = targetToHit;
	}, // end update target



	// create a timer to count down
	createTimer: function() {
		this.timerSprite = this.game.add.bitmapData(this.game.width, this.game.height);

		// color it
		this.timerSprite.ctx.rect(0,0, MathDice.Params.padding, this.game.height);
		this.timerSprite.ctx.fillStyle = '#A7CA00';
		this.timerSprite.ctx.fill();

		// define it
		this.timerSprite = this.game.add.sprite(0, 0, this.timerSprite);
		this.timerSprite.cropEnabled = true;
	}, // end create timer



	// update timer
	updateTimer: function() {
//		this.remainingTime -= 10;
// uncomment to fire timer again
		this.timerSprite.crop(cropRect);

		var cropRect = new Phaser.Rectangle(0, 0, (this.remainingTime / this.fullTime) * this.game.width, this.timerSprite.height);
	}, // end update timer

};