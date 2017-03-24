var GameTitle = function(game){};

GameTitle.prototype = {

	create: function(){
  		var me = this;

		me.game.stage.backgroundColor = "e1e4ea";
		me.topBuffer = me.game.height / 3;

		me.startGameTitle();
		me.descriptor();

  		// init start game buttons
  		me.randomOperatorsButton();
  		me.blitzModeButton();
	},


	// display title text
	startGameTitle: function() {
		var me = this;
		var gameOverFont = "50px Arial";

		me.gameOverTitleText = me.game.add.text(
			me.game.world.centerX, 
			me.topBuffer - 120, 
			"0", 
			{	font: gameOverFont, 
				fill: "#8DACFF", 
				stroke: "#0D3AAA", 
				strokeThickness: 5 }); 

		me.gameOverTitleText.anchor.setTo(0.5, 0);
		me.gameOverTitleText.align = 'center';

		me.gameOverTitleText.text = 'MathDice Sum Matcher';
	}, // end create title


	// display descriptor
	descriptor: function() {
		var me = this;
		var descFont = "20px Arial";

		me.descriptorText = me.game.add.text(
			me.game.world.centerX, 
			me.topBuffer - 50, 
			"0", 
			{	font: descFont, 
				fill: "#323232", 
				stroke: "#0D3AAA", 
				strokeThickness: 0 }); 

		me.descriptorText.anchor.setTo(0.5, 0);
		me.descriptorText.align = 'center';

		me.descriptorText.text = 'Random mode randomly selects an operator for the sum.\nBlitz mode chooses the last operator\n that you selected.';
	}, // end descriptor


	// random operators start game button
	randomOperatorsButton: function() {
		var me = this;

		var button = game.add.button(
			me.game.world.centerX,
			me.topBuffer + 90,
			'randomOperatorsButton',
			function randomOpStart() {
				this.game.state.start("Main", true, false, "random")
			},
			this, 0, 1, 2
			);

		button.anchor.setTo(0.5, 0.5);
	}, // end random operators game button


	// blitz mode start game button
	blitzModeButton: function() {
		var me = this;

		var button = game.add.button(
			me.game.world.centerX,
			me.topBuffer + 180,
			'blitzModeButton',
			function blitzStart() {
				this.game.state.start("Main", true, false, "blitz")
			},
			this, 0, 1, 2
			);

		button.anchor.setTo(0.5, 0.5);
	}, // end blitz mode game button

}