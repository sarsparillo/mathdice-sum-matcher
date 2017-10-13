var Preload = function(game){};
Preload.prototype = {

	init: function (){
	},

	preload: function(){ 
		var style = {
			font: "32px Arial",
			fill: "#c0ffee",
			align: "center"
		};

		this.loadingText = this.add.text(this.game.world.centerX, this.game.world.centerY, "Please wait. 0%", style);
		this.loadingText.anchor.x = 0.5;

		this.game.load.image('game-bg', 'assets/screens/bg.jpg');
		this.game.load.image('headerbar', 'assets/screens/headerbar.jpg');
		this.game.load.image('headerlogo', 'assets/screens/headerlogo.jpg');

		this.game.load.image('thinkfun', 'assets/screens/tflogo.png');
		this.game.load.image('title', 'assets/screens/titletext.png');

		this.game.load.spritesheet('d1', 'assets/dice/dice1.png', 127, 127, 3);
		this.game.load.spritesheet('d2', 'assets/dice/dice2.png', 127, 127, 3);
		this.game.load.spritesheet('d3', 'assets/dice/dice3.png', 127, 127, 3);
		this.game.load.spritesheet('d4', 'assets/dice/dice4.png', 127, 127, 3);
		this.game.load.spritesheet('d5', 'assets/dice/dice5.png', 127, 127, 3);
		this.game.load.spritesheet('d6', 'assets/dice/dice6.png', 127, 127, 3);
		this.game.load.spritesheet('d7', 'assets/dice/dice7.png', 127, 127, 3);
		this.game.load.spritesheet('d8', 'assets/dice/dice8.png', 127, 127, 3);
		this.game.load.spritesheet('d9', 'assets/dice/dice9.png', 127, 127, 3);

		this.game.load.image('targetDice', 'assets/dice/target.png');

		
		this.game.load.spritesheet('timer', 'assets/buttons/timer.png', 55, 579, 2);

		this.game.load.spritesheet('op-+', 'assets/buttons/add-classic.png', 109, 107, 2);
		this.game.load.spritesheet('op--', 'assets/buttons/subtract-classic.png', 109, 107, 2);
		this.game.load.spritesheet('op-*', 'assets/buttons/multiply-classic.png', 109, 107, 2);
		this.game.load.spritesheet('op-/', 'assets/buttons/divide-classic.png', 109, 107, 2);

		this.game.load.spritesheet('homeButton', 'assets/buttons/home.png', 134, 108, 3);
		this.game.load.spritesheet('pauseButton', 'assets/buttons/pause.png', 134, 108, 3);
		this.game.load.spritesheet('tutorialButton', 'assets/buttons/tutorial.png', 134, 108, 3);


		this.game.load.spritesheet('classicModeButton', 'assets/buttons/classic.png', 331, 167, 3);
		this.game.load.spritesheet('blitzModeButton', 'assets/buttons/blitz.png', 331, 167, 3);

		this.game.load.audio('clickSound', 'assets/click.wav');
		this.game.load.audio('successSound', 'assets/success.wav');
	},

	fileLoaded: function(progress){
		this.loadingText.text = "Please wait. " + progress + "%";
	},

	create: function(){
	// comment/uncomment to make layout changes easier to work with
	//	this.game.state.start("GameTitle");
		this.game.state.start("Main", true, false, "classic", "+");
	}
};