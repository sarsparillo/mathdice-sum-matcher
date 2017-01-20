var Preload = function(game){};

Preload.prototype = {

	preload: function(){ 
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
		this.game.load.image('op-openParenthesis', 'assets/opopen.png');
		this.game.load.image('op-closeParenthesis', 'assets/opclos.png');
	},

	create: function(){
		this.game.state.start("Main");
	}
}

/*

so here's my concept:
you have three dice and a constant equation

SUM EXAMPLE: "

solution: function(a,b,c) {
	var answer;
	switch b:
		case 'add':
			answer = a + c;
			break;
		case 'divide':
			answer = a / c;
			break;
	etc

	return answer;
}
"
then check if solution = target.
if solution == target, remove a, b, and c
generate new dice
- no check new matches here - all equations are forced and manual-

*/