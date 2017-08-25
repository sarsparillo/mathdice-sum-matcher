var GameTitle = function(game){};

GameTitle.prototype = {
	//global scale ratio
	scaleRatio: '',

	// initialize 
	init: function(){
		scaleRatio = game.scaleRatio;
	},

	create: function(){
  		var me = this;

		me.game.stage.backgroundColor = "e1e4ea";
		me.topBuffer = me.game.height / 3;

		me.startGameTitle();
		me.descriptor();

		me.tileSize = 85 * scaleRatio;

  		// init start game buttons
  		me.randomOperatorsButton();
  		me.blitzModeButton();

  		me.selectedOperator = '+';
	},


	// display title text
	startGameTitle: function() {
		var me = this;
		var gameTitleFont = 150 * scaleRatio + "px Arial";

		me.gameTitleText = me.game.add.text(
			me.game.world.centerX, 
			me.topBuffer - 120, 
			"0", 
			{	font: gameTitleFont, 
				fill: "#8DACFF", 
				stroke: "#0D3AAA", 
				strokeThickness: 5 }); 

		me.gameTitleText.anchor.setTo(0.5, 0);
		me.gameTitleText.align = 'center';

		me.gameTitleText.text = 'MathDice Sum Matcher';
	}, // end create title


	// display descriptor
	descriptor: function() {
		var me = this;
		var descFont = 60 * scaleRatio + "px Arial";

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

		me.descriptorText.text = 'Random mode randomly selects an operator for the sum.\n\nIn Blitz mode, you select the operator, then\ncomplete as many sums as possible!';
	}, // end descriptor


	// random operators start game button
	randomOperatorsButton: function() {
		var me = this;

		var button = game.add.button(
			me.game.world.centerX,
			me.topBuffer + me.tileSize + 30,
			'randomOperatorsButton',
			function randomOpStart() {
				me.game.sound.play('clickSound');
				me.game.state.start("Main", true, false, "random", "+")
			},
			this, 0, 1, 2
			);

		button.scale.setTo(scaleRatio, scaleRatio);

		button.anchor.setTo(0.5, 0.5);
	}, // end random operators game button


	// blitz mode start game button
	blitzModeButton: function() {
		var me = this;

		var button = game.add.button(
			me.game.world.centerX,
			me.topBuffer + 35 + (me.tileSize * 2),
			'blitzModeButton',
			function blitzStart() {
				me.game.sound.play('clickSound');

				me.blitzModes();
			},
			this, 0, 1, 2
			);

		button.anchor.setTo(0.5, 0.5);
		button.scale.setTo(scaleRatio, scaleRatio);
	}, // end blitz mode game button

	blitzModes: function() {
		var me = this;
		var buttonHeight = me.topBuffer + 40 + (me.tileSize * 3),
			buttonLeft = game.world.centerX - (me.tileSize * 1.5);


		var addButton = game.add.button(
			buttonLeft, 
			buttonHeight, 
			'op-+', 
			function changeOperand() {
				me.game.sound.play('clickSound');
				me.game.state.start("Main", true, false, "blitz", "+")
			},
			this, 0, 1, 2
			);

		var subtractButton = game.add.button(
			buttonLeft + me.tileSize, 
			buttonHeight, 
			'op--', 
			function changeOperand() {
				me.game.sound.play('clickSound');
				me.game.state.start("Main", true, false, "blitz", "-")
			},
			this, 0, 1, 2
			);

		var multiplyButton = game.add.button(
			buttonLeft + (me.tileSize * 2), 
			buttonHeight, 
			'op-*', 
			function changeOperand() {
				me.game.sound.play('clickSound');
				me.game.state.start("Main", true, false, "blitz", "*")
			},
			this, 0, 1, 2
			);

		var divideButton = game.add.button(
			buttonLeft + (me.tileSize * 3), 
			buttonHeight, 
			'op-/', 
			function changeOperand() {
				me.game.sound.play('clickSound');
				me.game.state.start("Main", true, false, "blitz", "/")
			},
			this, 0, 1, 2
			);
		addButton.anchor.setTo(0.5, 0.5);
		subtractButton.anchor.setTo(0.5, 0.5);
		multiplyButton.anchor.setTo(0.5, 0.5);
		divideButton.anchor.setTo(0.5, 0.5);
		addButton.scale.setTo(scaleRatio, scaleRatio);
		subtractButton.scale.setTo(scaleRatio, scaleRatio);
		multiplyButton.scale.setTo(scaleRatio, scaleRatio);
		divideButton.scale.setTo(scaleRatio, scaleRatio);
	},

}