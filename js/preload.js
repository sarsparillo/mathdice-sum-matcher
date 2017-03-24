var Preload = function(game){};

Preload.prototype = {

	init: function (){
		var style = {
			font: "32px Arial",
			fill: "#c0ffee",
			align: "center"
		};

		this.text = this.add.text(this.game.world.centerX, this.game.world.centerY, "Please wait. 0%", style);
		this.text.anchor.x = 0.5;
	},

	preload: function(){ 

		// lotsa sprites so let's load'em all
		this.game.load.spritesheet('d1', 'assets/dice1.png', 85, 85, 2);
		this.game.load.spritesheet('d2', 'assets/dice2.png', 85, 85, 2);
		this.game.load.spritesheet('d3', 'assets/dice3.png', 85, 85, 2);
		this.game.load.spritesheet('d4', 'assets/dice4.png', 85, 85, 2);
		this.game.load.spritesheet('d5', 'assets/dice5.png', 85, 85, 2);
		this.game.load.spritesheet('d6', 'assets/dice6.png', 85, 85, 2);
		this.game.load.spritesheet('d7', 'assets/dice7.png', 85, 85, 2);
		this.game.load.spritesheet('d8', 'assets/dice8.png', 85, 85, 2);
		this.game.load.spritesheet('d9', 'assets/dice9.png', 85, 85, 2);

		this.game.load.spritesheet('op-+', 'assets/opadd.png', 85, 85, 3);
		this.game.load.spritesheet('op--', 'assets/opsub.png', 85, 85, 3);
		this.game.load.spritesheet('op-*', 'assets/opmul.png', 85, 85, 3);
		this.game.load.spritesheet('op-/', 'assets/opdiv.png', 85, 85, 3);

		this.game.load.spritesheet('restartButton', 'assets/restart.png', 255, 85, 3);
		this.game.load.spritesheet('randomOperatorsButton', 'assets/randomoperators.png', 255, 85, 3);
		this.game.load.spritesheet('blitzModeButton', 'assets/blitzmode.png', 255, 85, 3);

		// some sounds exist too doncha know
		this.game.load.audio('clickSound', 'assets/click.wav');
		this.game.load.audio('successSound', 'assets/success.wav');
	},

	fileLoaded: function(progress){
		this.text.text = "Please wait. " + progress + "%";
	},

	create: function(){
		this.game.state.start("GameTitle");
	}
}