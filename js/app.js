var MathDice = {};
MathDice.Params = {
	gameWidth: 1200,
	gameHeight: 900,
	padding: 50,
	menuButtonSize: 331,
	targetDiceSize: 250,
	diceSize: 120,
	operatorSize: 109,
	gridSize: {
		rows: 5,
		cols: 5
	}
};

var game;
window.onload = function() {
	//Create a new game that fills the screen
	game = new Phaser.Game(MathDice.Params.gameWidth, MathDice.Params.gameHeight, Phaser.AUTO, '', null, true);

	//Add all states
	game.state.add("Boot", Boot);
	game.state.add("Preload", Preload);
	game.state.add("GameTitle", GameTitle);
	game.state.add("Main", Main);
	game.state.add("GameOver", GameOver);

	//Start the first state
	game.state.start("Boot");
};