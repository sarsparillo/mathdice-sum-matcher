var Preload = function(game){};

Preload.prototype = {

	init: function (){

		var me = this;

		var style = {
			font: "32px Arial",
			fill: "#c0ffee",
			align: "center"
		};

		this.text = this.add.text(me.game.world.centerX, me.game.world.centerY, "Please wait. 0%", style);
		this.text.anchor.x = 0.5;

	},

	// pull that juice out of the juice holder
	preload: function(){ 

		// load targets
		this.game.load.text('targets', 'assets/targets.txt');

		// load images
		this.game.load.spritesheet('d1', 'assets/dice1.png', 110, 110, 2);
		this.game.load.spritesheet('d2', 'assets/dice2.png', 110, 110, 2);
		this.game.load.spritesheet('d3', 'assets/dice3.png', 110, 110, 2);
		this.game.load.spritesheet('d4', 'assets/dice4.png', 110, 110, 2);
		this.game.load.spritesheet('d5', 'assets/dice5.png', 110, 110, 2);
		this.game.load.spritesheet('d6', 'assets/dice6.png', 110, 110, 2);
		this.game.load.spritesheet('d7', 'assets/dice7.png', 110, 110, 2);
		this.game.load.spritesheet('d8', 'assets/dice8.png', 110, 110, 2);
		this.game.load.spritesheet('d9', 'assets/dice9.png', 110, 110, 2);

		this.game.load.spritesheet('op-+', 'assets/opadd.png', 110, 110, 3);
		this.game.load.spritesheet('op--', 'assets/opsub.png', 110, 110, 3);
		this.game.load.spritesheet('op-*', 'assets/opmul.png', 110, 110, 3);
		this.game.load.spritesheet('op-/', 'assets/opdiv.png', 110, 110, 3);

	},

	fileLoaded: function(progress){

		this.text.text = "Please wait. " + progress + "%";

	},

	// take the juice to the table and also the table's name is main
	create: function(){

		// yes i'm great at comments
		this.game.state.start("Main");

	}
}