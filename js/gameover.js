var GameOver = function(game){};

GameOver.prototype = {

	// initialize passable variables
	init: function(endScore, endTime, wins){
		var me = this;

		me.score = endScore;
		me.time = Math.round(endTime / 60);
		me.correct = wins;
	},

  	create: function(){

  		var me = this;

		me.game.stage.backgroundColor = "e1e4ea";
		me.topBuffer = me.game.height / 3;

		me.gameOverTitle();
  		me.displayScore();
  		me.displayTime();

  		me.restartButton();

	},

//	restartGame: function(){
//		this.game.state.start("GameTitle");
//	}

	// display title
	gameOverTitle: function() {
		var me = this;
		var gameOverFont = "110px Arial";

		me.gameOverTitleText = me.game.add.text(
			me.game.world.centerX, 
			me.topBuffer - 120, 
			"0", 
			{	font: gameOverFont, 
				fill: "#fff", 
				stroke: "#d6145f", 
				strokeThickness: 15 }); 

		me.gameOverTitleText.anchor.setTo(0.5, 0);
		me.gameOverTitleText.align = 'center';

		me.gameOverTitleText.text = 'Game Over!';
	}, // end create title

	// display score
	displayScore: function() {
		var me = this;
		var scoreFont = "80px Arial";

		me.scoreText = me.game.add.text(
			me.game.world.centerX, 
			me.topBuffer, 
			"0", 
			{	font: scoreFont, 
				fill: "#ffffff", 
				stroke: "#535353", 
				strokeThickness: 15 }); 

		me.scoreText.anchor.setTo(0.5, 0);
		me.scoreText.align = 'center';

		me.scoreText.text = 'Your score: ' + me.score;
	}, // end create score

	// display time
	displayTime: function() {
		var me = this;
		var timeFont = "30px Arial";

		me.timeText = me.game.add.text(
			me.game.world.centerX, 
			me.topBuffer + 110, 
			"0", 
			{	font: timeFont, 
				fill: "#ccc", 
				stroke: "#000", 
				strokeThickness: 5 }); 

		me.timeText.anchor.setTo(0.5, 0);
		me.timeText.align = 'center';

		me.timeText.text = 'You played for ' + me.time + ' seconds and got ' + me.correct + ' correct.';
	}, // end create time

	// restart game button
	restartButton: function() {

		var me = this;

		var button = game.add.button(
			me.game.world.centerX,
			me.topBuffer + 200,
			'restartButton',
			function restartGame() {
				this.game.state.start("GameTitle")
			},
			this, 0, 1, 2
			);

		button.anchor.setTo(0.5, 0.5);
	} // end restart game button
	
}