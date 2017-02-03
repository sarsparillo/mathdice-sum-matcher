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
		this.game.load.image('d1', 'assets/dice1.png');
		this.game.load.image('d2', 'assets/dice2.png');
		this.game.load.image('d3', 'assets/dice3.png');
		this.game.load.image('d4', 'assets/dice4.png');
		this.game.load.image('d5', 'assets/dice5.png');
		this.game.load.image('d6', 'assets/dice6.png');
		this.game.load.image('d7', 'assets/dice7.png');
		this.game.load.image('d8', 'assets/dice8.png');
		this.game.load.image('d9', 'assets/dice9.png');

		this.game.load.image('op-add', 'assets/opadd.png');
		this.game.load.image('op-subtract', 'assets/opsub.png');
		this.game.load.image('op-multiply', 'assets/opmul.png');
		this.game.load.image('op-divide', 'assets/opdiv.png');

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