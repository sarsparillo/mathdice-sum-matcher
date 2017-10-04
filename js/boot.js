var Boot = function(game){};  
Boot.prototype = {
	init: function() {
		this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
	},

	preload: function(){},
	
  	create: function(){
		this.game.state.start("Preload");
	}
};