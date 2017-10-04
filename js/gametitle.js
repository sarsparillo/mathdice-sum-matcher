var GameTitle = function(game){};
GameTitle.prototype = {

	create: function(){
		// create thinkfun logo
		this.thinkfun = this.game.add.image(
			this.world.centerX,
			this.world.centerY - this.game.height / 3,
			'thinkfun');
		this.thinkfun.anchor.setTo(0.5);
		this.scaleSprite(this.thinkfun, this.game.width, this.game.height / 3, MathDice.Params.padding, 1);

		// create game title
		this.title = this.game.add.image(
			this.world.centerX,
			this.world.centerY,
			'title');
		this.title.anchor.setTo(0.5);
		this.scaleSprite(this.title, this.game.width, this.game.height, MathDice.Params.padding, 1);

		// set menu button vertical position
		this.menuButtonVertical = this.game.height - (this.game.height / 5);

		// create classic mode button
		this.classicButton = this.game.add.button(
			this.world.centerX - (MathDice.Params.menuButtonSize / 2),
			this.menuButtonVertical,
			'classicModeButton',
			this.classicMode,
			this, 1, 0, 2);
		this.classicButton.clicked = false;
		this.classicButton.anchor.setTo(0.5);
		this.scaleSprite(this.classicButton, this.game.width, this.menuButtonVertical, 50, 1);

		// create blitz mode button
		this.blitzButton = this.game.add.button(
			this.world.centerX + (MathDice.Params.menuButtonSize / 2),
			this.menuButtonVertical,
			'blitzModeButton',
			this.blitzMode,
			this, 1, 0, 2);
		this.blitzButton.clicked = false;
		this.blitzButton.anchor.setTo(0.5);
		this.scaleSprite(this.blitzButton, this.game.width, this.menuButtonVertical, 50, 1);
	},

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
	}, // end get scale

	// resize game; redraws everything in new positions
	resize: function(width, height) {
		console.log("resize");

		this.menuButtonVertical = height - (height / 5);

		this.scaleSprite(this.thinkfun, width, height / 3, MathDice.Params.padding, 1);
		this.thinkfun.x = this.world.centerX;
		this.thinkfun.y = this.world.centerY - height / 3;

		this.scaleSprite(this.title, width, height, MathDice.Params.padding, 1);
		this.title.x = this.world.centerX;
		this.title.y = this.world.centerY;

		this.scaleSprite(this.classicButton, width / 2, height, MathDice.Params.padding, 1);
		this.classicButton.x = this.world.centerX - this.classicButton.width / 2;
		this.classicButton.y = this.menuButtonVertical;

		this.scaleSprite(this.blitzButton, width / 2, height, MathDice.Params.padding, 1);
		this.blitzButton.x = this.world.centerX + this.blitzButton.width / 2;
		this.blitzButton.y = this.menuButtonVertical;
	}, // end resize

	// launch game button
	classicMode: function(button) {
		if (!button.clicked) {
			this.game.sound.play('clickSound');
			this.game.state.start("Main", true, false, "classic", "+");
		}
	}, // end launch game button

	// launch game button
	blitzMode: function(button) {
		if (!button.clicked) {
			this.game.sound.play('clickSound');
			this.game.state.start("Main", true, false, "blitz", "+");
		}
	} // end launch game button

};