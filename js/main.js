var Main = function(game) {};

Main.prototype = {

	// initialize passable variables
	init: function(gameMode, operator){
		this.gamemode = gameMode;
		this.operand = operator;
		this.stage.disableVisibilityChange = true;
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

		// init sizing and buffers
		this.diceSize = MathDice.Params.diceSize;
		this.operatorSize = MathDice.Params.operatorSize;
		this.padding = MathDice.Params.padding;
		this.targetDiceSize = MathDice.Params.targetDiceSize;

		this.gridSize = this.diceSize * 5;
		
		this.leftMostGridPoint = this.world.centerX - (this.gridSize / 2);
		this.topMostGridPoint = this.world.centerY - (this.headerBar.height + this.padding);


		// define tile selection buffer to make diagonal connections easier
		this.tileSelectionBuffer = this.diceSize / 10;

		// keep track if the player is currently drawing a sum
		this.guessing = false;
		this.game.input.onDown.add(function() { this.guessing = true; }, this);
		this.game.input.onUp.add(function() { this.guessing = false; }, this);

		// keep track if game is paused or not; will 'shut down' timer when paused
		this.isPaused = false;


		// variables used in sum-making
		this.currentSum = []; // holds numbers currently being traced
		this.targetToHit = 0; // defines the current target to hit

		// userscore - buffer exists to 'animate' the score growing
		this.score = 0;
		this.scoreBuffer = 0;

		// tile level updates with new 'layers' of dice falling. these control sprite frames and score for each dice.
		this.tileLevel = 1;
		// update this when an 'old' tile level is matched. when it hits 25, roll over to the next to allow more tiles to be placed
		this.currentTileLevelCount = 0;

		var seed = Date.now();
		this.random = new Phaser.RandomDataGenerator([seed]);

		// set up initial items, sizes, score, and first target number to hit
		this.initTiles();
		this.createScore();
		this.createTargetLabel();
		this.updateTargetNumber();
		

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
			if (!this.isPaused) {
				g.updateTimer();
			}
			g.resize(g.game.width, g.game.height);
		});

		// TRACKING
		// track sums made throughout total playtime
		this.equationList = [];
		// track total time
		this.totalTime = 0;

		this.createOperatorButtons();
		this.createLowerButtons();

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
		landscape = true;

		// generic sizing
		this.topMostGridPoint = this.world.centerY - this.gridSize / 2 + this.padding;

		if (landscape) {			
			var landscapeAvailableSpace = Math.min(width - this.diceSize * 4 - this.padding, height - this.topMostGridPoint - this.padding);
			this.diceSize = Math.min(landscapeAvailableSpace / 6, MathDice.Params.diceSize);		
			this.gridSize = this.diceSize * 5;

			this.leftMostGridPoint = (this.game.width - this.gridSize) / 2;
		} else {
			var portraitAvailableSpace = Math.min(width - this.padding, height - this.diceSize * 4 - this.padding);
			this.diceSize = Math.min(portraitAvailableSpace / 5, MathDice.Params.diceSize);		
			this.gridSize = this.diceSize * 5;

			this.leftMostGridPoint = (this.game.width - this.gridSize) / 2;
		}

		this.scaleHeader(width, height);
		this.scaleTiles(width, height, landscape);
		this.positionUI(width, height, landscape);
	},

	// scale header
	scaleHeader: function(width, height) {
		this.scaleSprite(this.headerBar, width, height - this.gridSize + (this.diceSize * 2), 0, 1);
		this.headerBar.width = this.game.width;
		this.headerBar.x = this.world.centerX;
		this.scaleSprite(this.headerLogo, width, this.headerBar.height, 0, 1);
		this.headerLogo.x = this.world.centerX;
	}, // end scale header


	// scale tiles; landscape should just adjust top margin
	scaleTiles: function(width, height, landscape) {
		this.tiles.x = this.leftMostGridPoint;
		this.tiles.y = this.topMostGridPoint;

		for (var i=0; i < 5; i++) {
			for (var j=0; j < 5; j++) {
				this.scaleSprite(this.tileGrid[i][j], this.diceSize, this.diceSize, 0, 1);
				this.tileGrid[i][j].x = i * this.diceSize + this.diceSize / 2;
				this.tileGrid[i][j].y = j * this.diceSize + this.diceSize / 2;
			}
		}

		if (landscape) {
			// landscape vertical position of grid position code here
		} else {
			// portrait vertical position of grid position code here
		}

	}, // end scale tiles


	// position UI; landscape will drastically change where the various bits and pieces exist
	positionUI: function(width, height, landscape) {
		if (landscape) {

			// landscape margins
			var leftColumn = this.leftMostGridPoint - this.diceSize;
			var rightColumn = this.world.centerX + this.gridSize / 2 + this.diceSize;

			// scale and position timer
			this.timerText.x = rightColumn;
			this.timerText.y = this.topMostGridPoint;
			this.scaleSprite(this.timer, width, this.gridSize, 0, 1);
			var timerScale = this.timer.scale.x * this.timer.parent.scale.x;
			this.timerText.fontSize = 35 * timerScale;
			this.timer.x = rightColumn;
			this.timer.y = this.topMostGridPoint + this.timerText.height;
			this.cropRect.width = this.game.width;
			this.scaleSprite(this.timerFill, width, this.timer.height, 0, 1);
			this.timerFill.x = this.timer.x;
			this.timerFill.y = this.timer.y;

			// move score				
			this.scoreText.fontSize = 35 * timerScale;
			this.scoreText.x = rightColumn;
			this.scoreText.y = this.timer.y + this.timer.height;

			// size target dice
			this.scaleSprite(this.targetDice, this.diceSize * 2, this.diceSize * 2, 0, 1);
			var targetScale = this.targetDice.scale.x * this.targetDice.parent.scale.x;
			this.targetLabel.x = leftColumn;
			this.targetLabel.y = this.topMostGridPoint;
			this.targetLabel.fontSize = 40 * targetScale;
			this.targetDice.x = this.targetLabel.x;
			this.targetDice.y = this.targetLabel.y + this.targetLabel.height;
			this.targetNumber.x = this.targetDice.x;
			this.targetNumber.y = this.targetDice.y + this.targetDice.height / 2;
			this.targetNumber.fontSize = 70 * targetScale;

			this.operatorSize = this.diceSize * 0.9;

			// move operators
			if (this.gamemode == "classic") {

				this.scaleSprite(this.addButton, this.operatorSize, this.operatorSize, 0, 1);
				this.addButton.x = leftColumn;
				this.addButton.y = this.topMostGridPoint + this.gridSize - this.operatorSize;

				this.scaleSprite(this.subtractButton, this.operatorSize, this.operatorSize, 0, 1);
				this.subtractButton.x = this.addButton.x;
				this.subtractButton.y = this.addButton.y;

				this.scaleSprite(this.multiplyButton, this.operatorSize, this.operatorSize, 0, 1);
				this.multiplyButton.x = this.addButton.x;
				this.multiplyButton.y = this.addButton.y;

				this.scaleSprite(this.divideButton, this.operatorSize, this.operatorSize, 0, 1);
				this.divideButton.x = this.addButton.x;
				this.divideButton.y = this.addButton.y;
				
				var operatorScale = this.addButton.scale.x * this.addButton.parent.scale.x;
				this.buttonsLabel.fontSize = 35 * operatorScale;
				this.buttonsLabel.x = this.addButton.x;
				this.buttonsLabel.y = this.addButton.y - this.operatorSize - 35;
			}

		} else { // portrait mode scaling

			// size target dice
			this.scaleSprite(this.targetDice, this.headerBar.height, this.headerBar.height, 0, 1);
			this.targetLabel.x = this.leftMostGridPoint + (this.targetDice.width / 2);
			this.targetLabel.y = this.headerBar.height;
			this.targetDice.x = this.targetLabel.x;
			this.targetDice.y = this.targetLabel.y + this.targetLabel.height;
			this.targetNumber.x = this.targetDice.x;
			this.targetNumber.y = this.targetDice.y + this.targetDice.height / 2;

		} 

		// lower buttons
		this.lowerButtonSize = this.diceSize * 1.08;
		this.scaleSprite(this.pauseButton, this.lowerButtonSize, this.lowerButtonSize, 0, 1);
		this.pauseButton.x = this.world.centerX;
		this.pauseButton.y = this.topMostGridPoint + this.gridSize + this.lowerButtonSize;

		this.scaleSprite(this.homeButton, this.lowerButtonSize, this.lowerButtonSize, 0, 1);
		this.homeButton.x = this.pauseButton.x - this.diceSize;
		this.homeButton.y = this.pauseButton.y;

		this.scaleSprite(this.tutorialButton, this.lowerButtonSize, this.lowerButtonSize, 0, 1);
		this.tutorialButton.x = this.pauseButton.x + this.diceSize;
		this.tutorialButton.y = this.pauseButton.y;

	}, // end position ui



	// loop through columns and rows of tileGrid
	initTiles: function() {
		// group to hold all tiles
		this.tiles = this.game.add.group();
		this.tiles.x = this.leftMostGridPoint;
		this.tiles.y = this.topMostGridPoint;

		
		var availableGridSpace = Math.min(this.game.width - this.diceSize * 4 - this.padding, this.game.height - this.topMostGridPoint - this.padding);
		this.diceSize = Math.min(availableGridSpace / 6, MathDice.Params.diceSize);		
		
		// loop through grid and place tile at positions
		for (var i=0; i < 5; i++) {
			this.tileGrid[i] = [];
			for (var j=0; j < 5; j++) {
				var tile = this.createTile(i, j);
				// keep track of positions in tileGrid
				this.tileGrid[i][j] = tile;
				this.currentTileLevelCount++;
			}
		}
	}, // end initTiles method



	// add a tile at positions x and y
	createTile: function(x, y) {
		// choose random tile to add
		var tileNumber = this.tileNumbers[this.random.integerInRange(0, this.tileNumbers.length -1)];

		// add tile at correct x position, add from top of game to allow slide in
		var tile = this.tiles.create(x * this.diceSize + this.diceSize / 2, 0, 'd' + tileNumber);
			tile.frame = 1 + this.tileLevel;
			tile.currentTileLevel = this.tileLevel;
			tile.tileNumber = tileNumber;

			tile.anchor.setTo(0.5);

		// animate into position
		this.game.add.tween(tile).to(
			{ y: (y * this.diceSize + this.diceSize / 2) },
			400, 
			Phaser.Easing.Quintic.InOut, 
			true);

		return tile;
	}, // end createTile method




	// create dice buttons
	createOperatorButtons: function() {
		// if random gamemode, add buttons
		if (this.gamemode == "classic") {
			// buttons at top of screen
			this.addButton = game.add.button(
				this.targetLabel.x, 
				this.topMostGridPoint + this.gridSize - this.operatorSize, 
				'op-+', 
				function changeOperand() {
					this.game.sound.play('clickSound');
					this.operand = '+';
					this.addButton.setFrames(1,1,1);
					this.subtractButton.setFrames(1,0,1);
					this.multiplyButton.setFrames(1,0,1);
					this.divideButton.setFrames(1,0,1);
				},
				this, 1, 1, 1
				);
			this.addButton.anchor.setTo(1, 1);

			this.subtractButton = game.add.button(
				this.addButton.x, 
				this.addButton.y, 
				'op--', 
				function changeOperand() {
					this.game.sound.play('clickSound');
					this.operand = '-';
					this.addButton.setFrames(1,0,1);
					this.subtractButton.setFrames(1,1,1);
					this.multiplyButton.setFrames(1,0,1);
					this.divideButton.setFrames(1,0,1);
				},
				this, 1, 0, 1
				);
			this.subtractButton.anchor.setTo(0, 1);

			this.multiplyButton = game.add.button(
				this.addButton.x, 
				this.addButton.y, 
				'op-*', 
				function changeOperand() {
					this.game.sound.play('clickSound');
					this.operand = '*';
					this.addButton.setFrames(1,0,1);
					this.subtractButton.setFrames(1,0,1);
					this.multiplyButton.setFrames(1,1,1);
					this.divideButton.setFrames(1,0,1);
				},
				this, 1, 0, 1
				);
			this.multiplyButton.anchor.setTo(1,0);

			this.divideButton = game.add.button(
				this.addButton.x, 
				this.addButton.y, 
				'op-/', 
				function changeOperand() {
					this.game.sound.play('clickSound');
					this.operand = '/';
					this.addButton.setFrames(1,0,1);
					this.subtractButton.setFrames(1,0,1);
					this.multiplyButton.setFrames(1,0,1);
					this.divideButton.setFrames(1,1,1);
				},
				this, 1, 0, 1
				);
			this.divideButton.anchor.setTo(0,0);

		} else if (this.gamemode == "blitz") {
			var topOperator = game.add.sprite(
				game.world.centerX - (this.diceSize / 2),
				this.topMostGridPoint + this.gridSize - (107 * 1.0),
				"op-" + this.operand);
		}

		this.buttonsLabel = this.game.add.text(
			0, 0, "Operators:", 
			{	cssFont: "50px 'Yanone Kaffeesatz', sans-serif", 
				fill: "#fff" }); 
		this.buttonsLabel.x = this.addButton.x;
		this.buttonsLabel.y = this.addButton.y - this.operatorSize - 35;
		this.buttonsLabel.anchor.setTo(0.5, 0);

	}, // end create operator buttons



	// create lower screen buttons
	createLowerButtons: function() {
		this.pauseButton = game.add.button(
			0, 0, 'pauseButton', 
			function changeOperand() {
				this.game.sound.play('clickSound');
				this.isPaused = !this.isPaused;
				if (this.isPaused) {
					this.pauseButton.setFrames(2,2,2);
					for (var i=0; i < 5; i++) {
						for (var j=0; j < 5; j++) {
							this.tileGrid[i][j].frame = 0; 
						}
					}
				} else {
					this.pauseButton.setFrames(1,0,2);
					for (var k=0; k < 5; k++) {
						for (var l=0; l < 5; l++) {
							this.tileGrid[k][l].frame = 1 + this.tileGrid[k][l].currentTileLevel; 
						}
					}
				}
			},
			this, 1, 0, 2
			);
		this.pauseButton.anchor.setTo(0.5, 1);

		this.homeButton = game.add.button(
			0, 0, 'homeButton', 
			function changeOperand() {
				this.game.sound.play('clickSound');
// Change to popup asking 'are you sure?'
				this.game.state.start("GameTitle");
				console.log('Home Clicked');
			},
			this, 1, 0, 2
			);
		this.homeButton.anchor.setTo(0.5, 1);

		this.tutorialButton = game.add.button(
			0, 0, 'tutorialButton', 
			function changeOperand() {
				this.game.sound.play('clickSound');
				console.log('Tutorial Clicked');
			},
			this, 1, 0, 2
			);
		this.tutorialButton.anchor.setTo(0.5, 1);

	}, // end create lower buttons



	// simple countdown
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
		this.updateTargetNumber();
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
						{ y: this.diceSize * j + this.diceSize / 2 }, 
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
					this.scaleSprite(this.tileGrid[i][j], this.diceSize, this.diceSize, 0, 1);
					tile.anchor.setTo(0.5);
				}
			}
		}
	}, // end new tiles



	// add to score
	incrementScore: function() {
		this.score +=1;
		this.scoreText.text = "Score: " + this.score;
	}, // end increment score



	// create score
	createScore: function() {
		var scoreFont = "40px 'Yanone Kaffeesatz', sans-serif";

		this.scoreText = this.game.add.text(
			0, 0, "Score: 0", 
			{	cssFont: scoreFont, 
				fill: "#fff" }); 

		this.scoreText.anchor.setTo(0.5, 0);
		this.scoreText.align = 'center';

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
		var animFont = "50px 'Yanone Kaffeesatz', sans-serif";

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
			{	cssFont: animFont, 
				fill: "#39d179", 
				stroke: "#3360ce", 
				strokeThickness: 10});

		anim.anchor.setTo(0.5, 0);
		anim.align = 'center';

		// define the tween for the floater 
		var animTween = this.game.add.tween(anim).to({ 
			x: this.world.centerX + (this.diceSize * 3.5), 
			y: this.topMostGridPoint + this.padding + this.gridSize },
			500,
			Phaser.Easing.Exponential.In,
			true);

		animTween.onComplete.add(function() {
			anim.destroy();
			this.scoreTween.start();
			this.scoreBuffer += score();
			this.updateTargetNumber();
		}, this);
	}, // end create score animation



	// create target
	createTargetLabel: function() {
		this.targetLabel = this.game.add.text(
			0, 0, "Target:", 
			{	cssFont: "35px 'Yanone Kaffeesatz', sans-serif", 
				fill: "#fff" }); 
		this.targetLabel.smoothed = true;
		this.targetLabel.x = this.leftMostGridPoint - this.targetDiceSize;
		this.targetLabel.y = this.topMostGridPoint;
		this.targetLabel.anchor.setTo(0.5, 0);

		this.targetDice = this.game.add.sprite(0, 0, 'targetDice');
		this.targetDice.x = this.targetLabel.x;
		this.targetDice.y = this.targetLabel.y + this.targetLabel.height;
		this.targetDice.anchor.setTo(0.5, 0);

		this.targetNumber = this.game.add.text(
			0, 0, "0", 
			{	cssFont: "50px 'Yanone Kaffeesatz', sans-serif", 
				fill: "#4d394b"}); 
		this.targetNumber.align = 'center';
		this.targetNumber.x = this.targetDice.x;
		this.targetNumber.y = this.targetDice.y + this.targetDice.height / 2;
		this.targetNumber.anchor.setTo(0.5);
	}, // end create target label



	// get new target
	updateTargetNumber: function() {
		var buildTargetNumber = '';
		
		// pick a tile at random
		var tileCol = Math.floor(Math.random() * this.tileGrid.length);
		var tileRow = Math.floor(Math.random() * this.tileGrid[tileCol].length);
		var startTile = this.tileGrid[tileCol][tileRow];

		buildTargetNumber += startTile.tileNumber;
		
		// randomly pick one of the operators to use for this sum
		var operandIndex = Math.floor(Math.random() * this.operators.length);

		// set up new score type based on gamemode
		if (this.gamemode == "blitz") { buildTargetNumber += this.operand; } 
		else if (this.gamemode == "classic") { buildTargetNumber += this.operators[operandIndex]; }

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
		targetToHit = + eval(buildTargetNumber[0] + buildTargetNumber[1] + buildTargetNumber[2]);
		if (targetToHit % 1 != 0) {
			var fractionTarget = new Fraction(buildTargetNumber[0], buildTargetNumber[2]);
			this.targetNumber.text = fractionTarget.toString();
		} else {
			this.targetNumber.text = targetToHit;
		}
	}, // end update target



	// create a timer to count down
	createTimer: function() {

		this.timerText = this.game.add.text(0, 0, "Time Left: 0:00",
			{	cssFont: "35px 'Tanone Kaffeesatz', sans-serif",
				fill: "#fff" });
		this.timerText.anchor.setTo(0.5, 0);

		// define it
		this.timer = this.game.add.sprite(0, 0, "timer", 1);
		this.timer.anchor.setTo(0.5, 0);
		this.timerFill = this.game.add.sprite(0, 0, "timer", 0);
		this.timerFill.cropEnabled = true;
		this.timerFill.anchor.setTo(0.5, 0);

		this.cropRect = new Phaser.Rectangle(0, 0, this.game.width, this.timer.height);
		this.timerFill.crop(this.cropRect);

	}, // end create timer



	// update timer
	updateTimer: function() {
		if (!this.isPaused) {		
			this.remainingTime -= 6;

			var timeLeftInSeconds = Math.floor(this.remainingTime / 60);
			var minutes = Math.floor(timeLeftInSeconds / 60);
			var seconds = timeLeftInSeconds % 60;
			seconds = seconds<10?"0"+seconds:seconds;
			
			this.timerText.text = "Time Left: " + minutes + ":" + seconds;

			if (this.remainingTime < 500) {
				this.timer.tint = 0xe73f2f;
			}
			// resize croprect in case screen has resized
			this.cropRect.height = this.timer.height - (this.timer.height * (this.remainingTime / this.fullTime));
			this.timerFill.y = this.cropRect.height;
			this.timerFill.updateCrop();
		}
	}, // end update timer




	// update that cup of juice every frame
	update: function() {

		if (!this.isPaused) {
			// if currently guessing - cannot be true if mouse/touch is not active
			if (this.guessing) {

				// get cursor location
				var cursorLocationX = this.game.input.x;
				var cursorLocationY = this.game.input.y;

				// where does that exist on the theoretical grid
				var gridLocationX = Math.floor((cursorLocationX - this.leftMostGridPoint) / this.diceSize);
				var gridLocationY = Math.floor((cursorLocationY - this.topMostGridPoint) / this.diceSize);

				// check if dragging within game bounds - literally just 'if inside these bounds'
				if (gridLocationX >= 0 && 
					gridLocationX < this.tileGrid[0].length && 
					gridLocationY >= 0 && 
					gridLocationY < this.tileGrid.length) {

					// grab tile being hovered up ons
					var activeTile = this.tileGrid[gridLocationX][gridLocationY];

					// get grabbed tile bounds and add a buffer. getbounds doesn't allow easy buffers
					var tileLeftBounds = this.leftMostGridPoint + (gridLocationX * this.diceSize) + this.tileSelectionBuffer;
					var tileRightBounds = this.leftMostGridPoint + (gridLocationX * this.diceSize) + this.diceSize - this.tileSelectionBuffer;
					var tileTopBounds = this.topMostGridPoint + (gridLocationY * this.diceSize) + this.tileSelectionBuffer;
					var tileBottomBounds = this.topMostGridPoint + (gridLocationY * this.diceSize) + this.diceSize - this.tileSelectionBuffer;

					// if player is hovering over tile, set it active. also, there's margin checks for each tile (because of the getbounds buffer thing).
					if (!activeTile.isActive && 
						cursorLocationX > tileLeftBounds && 
						cursorLocationX < tileRightBounds && 
						cursorLocationY > tileTopBounds && 
						cursorLocationY < tileBottomBounds &&
						this.currentSum.length < 2) {			

						// set tile active, make pink
						activeTile.isActive = true;
						activeTile.frame = 1;
						this.game.input.onUp.add(function() {
							activeTile.frame = 1 + activeTile.currentTileLevel;
						}, this);
						this.game.sound.play('clickSound');

						// push tile to current sum
						this.currentSum.push(activeTile);

					}
					// 'undo' - allow player to scroll back one 
					else if (activeTile.isActive && this.currentSum.length == 2) {

								//TODO

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
							// success! you win the sum!
							this.game.sound.play('successSound');
							this.animateScore(this.currentSum[1].x, this.currentSum[1].y, this.operand);
							//tile level calcs
							if (this.currentSum[0].currentTileLevel != this.tileLevel) {
								this.currentTileLevelCount++;
							}
							if (this.currentSum[1].currentTileLevel != this.tileLevel) {
								this.currentTileLevelCount++;
							}
							if (this.currentTileLevelCount >= 25) {
								this.currentTileLevelCount = 0;
								this.tileLevel++;
								if (this.tileLevel >= 2) {
									this.tileLevel = 1;
								}
							}
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
							console.log(this.currentTileLevelCount);
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

			// remaining time cannot be more than the maximum time for the game
			if (this.remainingTime > this.fullTime) {
				this.remainingTime = this.fullTime;
			}

			// end game when time is zero
			if (this.remainingTime <= 0) {
				this.game.state.start("GameOver", true, false, this.score, this.totalTime, this.equationList.length);
			}

			// total time increments in function to allow speedup
			this.countdown(this.equationList.length);
		} // end 'if paused'

	}, // end update method

	render: function() {
		// just to see the croprect and work out where the hell it is
//		game.debug.geom(this.cropRect, 'rgba(200,0,0,0.25');
	}

};