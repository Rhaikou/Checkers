//Author Riku Rundelin

"use strict"

//Init page and create game on load
window.onload = function() {
	initPage();
	clearBoard();
	Game.create();
}

//Makes necessary changes to the document
function initPage() {
	var description = document.getElementsByTagName("P")[0];
	description.appendChild(document.createTextNode(" Voit aloittaa uuden pelin milloin tahansa luomalla pelilaudan uudestaan."));
	
	var widthForm = document.getElementById("ruudukko");
	widthForm.action = "javascript:Game.create()";
	var widthInput = widthForm.getElementsByTagName("INPUT")[0];
	widthInput.setAttribute("value", 8);
	
	var fieldSet = document.getElementsByTagName("FIELDSET")[0];
	fieldSet.setAttribute("id", "main-set")
	var errorField = document.createElement("P");
	errorField.setAttribute("id", "error-field");
	errorField.style.visibility = "hidden";
	fieldSet.appendChild(errorField);
	var pieceCountForm = document.createElement("FIELDSET");
	var pcfHeader = document.createElement("LEGEND");
	pcfHeader.appendChild(document.createTextNode("Nappulasarakkeiden lukumäärä"));
	pieceCountForm.appendChild(pcfHeader);
	pieceCountForm.setAttribute("id", "piece-count-form");
	fieldSet.appendChild(pieceCountForm);
	createRadioButtons(5);
	var layoutForm = document.createElement("FIELDSET");
	var layoutHeader = document.createElement("LEGEND");
	layoutHeader.appendChild(document.createTextNode("Nappuloiden asettelu"));
	layoutForm.appendChild(layoutHeader);
	layoutForm.setAttribute("id", "layout-form");
	fieldSet.appendChild(layoutForm);
	
	var layoutLabel1 = document.createElement("LABEL");
	var layoutButton1 = document.createElement("INPUT");
	layoutButton1.setAttribute("type", "radio");
	layoutButton1.setAttribute("value", 1);
	layoutButton1.setAttribute("name", "pieceLayout");
	layoutButton1.setAttribute("checked", "checked");
	layoutLabel1.appendChild(layoutButton1);
	layoutLabel1.appendChild(document.createTextNode(" vasen-oikea"));
	layoutForm.appendChild(layoutLabel1);
	layoutForm.appendChild(document.createElement("BR"));
	var layoutLabel2 = document.createElement("LABEL");
	var layoutButton2 = document.createElement("INPUT");
	layoutButton2.setAttribute("type", "radio");
	layoutButton2.setAttribute("value", 2);
	layoutButton2.setAttribute("name", "pieceLayout");
	layoutLabel2.appendChild(layoutButton2);
	layoutLabel2.appendChild(document.createTextNode(" ylä-ala"));
	layoutForm.appendChild(layoutLabel2);
	
	var createButton = document.getElementById("luo");
	fieldSet.appendChild(createButton);
	
	var turnIndicator = document.createElement("P");
	turnIndicator.appendChild(document.createTextNode("Pelaajan 1 vuoro"));
	turnIndicator.setAttribute("id", "turn-indicator");
	turnIndicator.style.color = "red";
	turnIndicator.style.fontWeight = "bold";
	widthForm.appendChild(turnIndicator);
}

//Changes displayed turn
function changeTurnDisplay(player, color) {
	var turnIndicator = document.getElementById("turn-indicator");
	turnIndicator.style.color = color;
	turnIndicator.removeChild(turnIndicator.firstChild);
	turnIndicator.appendChild(document.createTextNode("Pelaajan " + player + " vuoro"));
}

function displayVictory(player, color) {
	var turnIndicator = document.getElementById("turn-indicator");
	turnIndicator.style.color = color;
	turnIndicator.removeChild(turnIndicator.firstChild);
	turnIndicator.appendChild(document.createTextNode("Pelaaja " + player + " voitti!"));
}

//Creates radio buttons for choosing the number of piece columns
function createRadioButtons(count) {
	var form = document.getElementById("piece-count-form");
	for(var i = 1; i <= count; i++) {
		var label = document.createElement("LABEL");
		var labelText = document.createTextNode(i);
		var button = document.createElement("INPUT");
		button.setAttribute("type", "radio");
		button.setAttribute("value", i);
		button.setAttribute("name", "piece-count");
		if(i == 3) button.setAttribute("checked", "checked");
		label.appendChild(labelText);
		label.appendChild(button);
		form.appendChild(label);
		form.appendChild(document.createElement("BR"));
	}
}

//Clears the game board
function clearBoard() {
	var table = document.getElementsByTagName("TABLE")[0];
	while (table.firstChild) {
		table.removeChild(table.firstChild);
	}
}

function isEven(n) {
   return n % 2 == 0;
}

//Validates user input in the form
function validateInput(inp) {
	if(isNaN(inp)) {
		displayErrorMessage("Arvon tulee olla numero väliltä [8,16]");
		return false;
	}
	else if(inp > 16 || inp < 8) {
		displayErrorMessage("Arvon tulee olla väliltä [8,16]");
		return false;
	}
	return true;
}

//Displays specified error message in form
function displayErrorMessage(msg) {
	var errorField = document.getElementById("error-field");
	var errorText = document.createTextNode(msg);
	errorField.appendChild(errorText);
	errorField.style.visibility = "visible";
}

//Clears error message from form
function clearError() {

	var errorField = document.getElementById("error-field");
	while (errorField.firstChild) {
		errorField.removeChild(errorField.firstChild);
	}
	errorField.style.visibility = "hidden";
}

//Constructor for piece objects
function Piece (square, color, player, size) {
	this.square = square;
	this.element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	this.element.setAttribute("class", "piece");
	this.element.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	this.element.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
	this.element.setAttribute("viewBox", "0 0 40 40");
	this.element.setAttribute("width", size + "px");
	this.element.setAttribute("height", size + "px");
	
	this.circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	this.circle.setAttribute("cx", "20");
	this.circle.setAttribute("cy", "20");
	this.circle.setAttribute("r", "19");
	this.circle.setAttribute("style", "stroke:#006600; fill:" + color);
	this.element.appendChild(this.circle);
	
	this.color = color;
	this.player = player;
	this.alive = true;
	this.isKing = false;
	
	this.element.addEventListener('click', this, false);
	
	//Makes this piece king
	this.promote = function() {
		this.isKing = true;
	}
	
	//Check if this piece can move to specified square
	this.canMove = function(square) {
		if (!square.isEmpty()) return false;
		switch(Game.layout) {
			case 1:
				if (!this.isKing) {
					if (this.color == "red" && (Math.abs(this.square.posY - square.posY) != 1 || (square.posX - this.square.posX) != 1)) return false;
					if (this.color == "blue" && (Math.abs(this.square.posY - square.posY) != 1 || (this.square.posX - square.posX) != 1)) return false;
				}
				else if (Math.abs(this.square.posY - square.posY) != 1 || Math.abs(square.posX - this.square.posX) != 1) return false;
				break;
			case 2:
			if (!this.isKing) {
					if (this.color == "red" && (this.square.posY - square.posY != 1 || Math.abs(square.posX - this.square.posX) != 1)) return false;
					if (this.color == "blue" && (square.posY - this.square.posY != 1 || Math.abs(this.square.posX - square.posX) != 1)) return false;
				}
				else if (Math.abs(this.square.posY - square.posY) != 1 || Math.abs(square.posX - this.square.posX) != 1) return false;
				break;
		}
		return true;
	}
	
	//Check if this piece can move to any square
	this.canMoveAny = function(square) {
		for(var i = 0; i < Game.squares.length; i++) {
				for(var j = 0; j < Game.squares.length; j++)
				if(this.canMove(Game.squares[i][j])) return true;
			}
			return false;
	}
	
	//Check if this piece can capture to specified square
	this.canCapture = function(square) {
		if (square.color == "sq-white") return;
		if (!square.isEmpty()) return false;
		if (!this.isKing) {
			switch(Game.layout) {
			case 1:
				if (this.color == "red" && (Math.abs(this.square.posY - square.posY) != 2 || (square.posX - this.square.posX) != 2)) return false;
				if (this.color == "blue" && (Math.abs(this.square.posY - square.posY) != 2 || (this.square.posX - square.posX) != 2)) return false;
				break;
			case 2:
				if (this.color == "red" && (this.square.posY - square.posY != 2 || Math.abs(square.posX - this.square.posX) != 2)) return false;
				if (this.color == "blue" && (square.posY - this.square.posY != 2 || Math.abs(this.square.posX - square.posX) != 2)) return false;
				break;
			}
		}
		else if (Math.abs(this.square.posY - square.posY) != 2 || Math.abs(square.posX - this.square.posX) != 2) return false;
		var captureSq = this.square.getMiddle(square);
		if (captureSq.isEmpty()) return false;
		if (Game.getPieceIn(captureSq).player == this.player) return false;
		return true;
	}
	
	//Check if this piece can make any captures
	this.canCaptureAny = function() {
		for(var i = 0; i < Game.squares.length; i++) {
			for(var j = 0; j < Game.squares.length; j++)
			if(this.canCapture(Game.squares[i][j])) return true;
		}
		return false;
	}
	
	//Move this piece to specified square
	this.move = function(square) {
		this.square.element.removeChild(this.element);
		this.square = square;
		this.square.element.appendChild(this.element);
		switch(Game.layout) {
			case 1:
				if(!this.isKing && this.player == 1 && this.square.posX == Game.squares[0].length - 1) this.promote();
				else if(!this.isKing && this.player == 2 && this.square.posX == 0) this.promote();
				break;
			case 2:
				if(!this.isKing && this.player == 1 && this.square.posY == 0) this.promote();
				else if(!this.isKing && this.player == 2 && this.square.posY == Game.squares[0].length - 1) this.promote();
				break;
		}
		this.deselect();
		Game.changeTurn();
	}
	
	//Capture to specified square
	this.capture = function(square) {
		var capturedPiece = Game.getPieceIn(this.square.getMiddle(square));
		capturedPiece.captured();
		this.square.element.removeChild(this.element);
		this.square = square;
		this.square.element.appendChild(this.element);
		var promoted = false;
		switch(Game.layout) {
			case 1:
				if(!this.isKing && this.player == 1 && this.square.posX == Game.squares[0].length - 1) {
					this.promote();
					promoted = true;
				}
				else if(!this.isKing && this.player == 2 && this.square.posX == 0) {
					this.promote();
					promoted = true;
				}
				break;
			case 2:
				if(!this.isKing && this.player == 1 && this.square.posY == 0) {
					this.promote();
					promoted = true;
				}
				else if(!this.isKing && this.player == 2 && this.square.posY == Game.squares[0].length - 1) {
					this.promote();
					promoted = true;
				}
				break;
		}
		if(!this.canCaptureAny() || promoted) {
			Game.hasToCapture = false;
			this.deselect();
			Game.changeTurn();
			return;
		}
		Game.canChangeSelected = false;
		Game.hasToCapture = true;
	}
	
	//Makes this the selected piece
	this.select = function() {
		Game.selected = this;
		this.circle.setAttribute("style", "fill: lime");
	}
	
	//Deselcts this piece
	this.deselect = function() {
		Game.selected = null;
		this.circle.setAttribute("style", "fill: " + this.color);
	}
	
	//Removes this piece from the game
	this.captured = function() {
		this.alive = false;
		this.square.element.removeChild(this.element);
		this.square = null;
	}
}

Piece.prototype.handleEvent = function(e) {
	switch (e.type) {
		case "click": this.click(e);
	}
}

//Click handler for piece
Piece.prototype.click = function(e) {
	if(Game.gameOver) return;
	if(!Game.canChangeSelected) return;
	if(Game.hasToCapture) {
		if(!this.canCaptureAny()) return;
	}
	if(this.player != Game.playerTurn) return;
	if(Game.selected != null) {
		if(Game.selected == this) {
			this.deselect();
			return;
		}
		Game.selected.deselect();
		this.select();
		return;
	}	
	this.select();
}

//Constructor for squares in game board
function Square (posX, posY, color, size) {
	this.posX = posX;
	this.posY = posY;
	this.color = color;
	this.element = document.createElement("TD");
	this.element.className = "square";
	this.element.style.width = size + "px";
	this.element.style.height = size + "px";
	this.element.style.minWidth = size + "px";
	this.element.style.minheight = size + "px";
	this.element.className += " " + this.color;
	this.element.addEventListener('click', this, false);
	
	//Check if this square is empty
	this.isEmpty = function() {
		if(this.element.hasChildNodes()) return false;
		return true;
	}
	
	//Distance from this square to another square
	this.distance = function(square) {
		return Math.sqrt((this.posX-square.posX)*(this.posX-square.posX) + (this.posY-square.posY)*(this.posY-square.posY));
	}
	
	//Action required to move from this square to the specified square
	this.actionRequired = function(square) {
		if(this.distance(square) <= Math.sqrt(2)) return 'move';
		else return 'capture';
	}
	
	//Return square between this square and specified square
	this.getMiddle = function(square) {
		var dx = square.posX - this.posX;
		var dy = square.posY - this.posY;
		return Game.squares[this.posY+dy/2][this.posX+dx/2];
	}
}

//Event handler for square
Square.prototype.handleEvent = function(e) {
	switch(e.type) {
		case "click": this.click(e);
	}
}

//Click handler for square
Square.prototype.click = function(e) {
	if(Game.gameOver) return;
	if(Game.selected == null) return;
	if(Game.selected.square == this) return;
	if(!this.isEmpty()) return;
	if(!Game.hasToCapture) {
		if(Game.selected.square.actionRequired(this) == 'move' && Game.selected.canMove(this)) Game.selected.move(this);
		else if(Game.selected.square.actionRequired(this) == 'capture' && Game.selected.canCapture(this)) Game.selected.capture(this);
	}
	else if(Game.selected.square.actionRequired(this) == 'capture' && Game.selected.canCapture(this)) Game.selected.capture(this);
}


//Game object, creates game board and enforces turns, gamestate and capture rule 
var Game = {
	
	playerTurn: 1,
	selected: null,
	hasToCapture: false,
	canChangeSelected: true,
	squares: null,
	pieces: null,
	gameOver: false,
	layout: 1,
	
	//Creates game board and initializes game state
	create: function(){
		
		this.playerTurn = 1;
		this.selected = null;
		this.hasToCapture = false;
		this.canChangeSelected = true;
		this.squares = null;
		this.pieces = null;
		this.gameOver = false;
		this.layout = 1;
		
		changeTurnDisplay(1, "red");
		clearError();
		var input = document.getElementsByTagName("INPUT")[0];
		if(!validateInput(input.value)) return;
		var size = input.value;
		var pieceColumns = document.querySelector('input[name = "piece-count"]:checked').value;
		if( (size-1) / 2 <= pieceColumns ) pieceColumns = (size/2 | 0)-1;
		this.layout = parseInt(document.querySelector('input[name = "pieceLayout"]:checked').value);
		clearBoard();
		
		var sqSize = calculateSqSize(size);
		var pieceAmount = (size * pieceColumns);
		
		Game.squares = new Array(size);
		Game.pieces = new Array(pieceAmount);
		var pieceIndex = 0;
		
		var table = document.getElementsByTagName("TABLE")[0];
		for(var i = 0; i < size; i++) {
			var row = document.createElement("TR");
			table.appendChild(row);
			Game.squares[i] = new Array(size);
			for(var j = 0; j < size; j++) {
				if((!isEven(i) && isEven(j)) || (isEven(i) && !isEven(j))) var square = new Square(j, i, "sq-black", sqSize);
				else var square = new Square(j, i, "sq-white", sqSize);
				row.appendChild(square.element);
				Game.squares[i][j] = square;
				switch(this.layout) {
					case 1:
						if( j < pieceColumns  && square.element.className.match(/.*sq-black.*/) ) {
							var piece = new Piece(Game.squares[i][j], "red", 1, sqSize);
							Game.pieces[pieceIndex++] = piece;
							square.element.appendChild(piece.element);
						}
						else if( j >= size-pieceColumns  && square.element.className.match(/.*sq-black.*/) ) {
							var piece = new Piece(Game.squares[i][j], "blue", 2, sqSize);
							Game.pieces[pieceIndex++] = piece;
							square.element.appendChild(piece.element);
						}
						break;
					case 2:
						if( i < pieceColumns  && square.element.className.match(/.*sq-black.*/) ) {
							var piece = new Piece(Game.squares[i][j], "blue", 2, sqSize);
							Game.pieces[pieceIndex++] = piece;
							square.element.appendChild(piece.element);
						}
						else if( i >= size-pieceColumns  && square.element.className.match(/.*sq-black.*/) ) {
							var piece = new Piece(Game.squares[i][j], "red", 1, sqSize);
							Game.pieces[pieceIndex++] = piece;
							square.element.appendChild(piece.element);
						}
				}
			}
		}
	},
	
	//Changes turn, checks victory condition
	changeTurn: function() {
		Game.canChangeSelected = true;
		switch (this.playerTurn) {
			case 1:
				this.playerTurn = 2;
				changeTurnDisplay(2, "blue");
				break;
			case 2:
				this.playerTurn = 1;
				changeTurnDisplay(1, "red");
				break;
		}
		if(!this.canPlayerDoAnything(this.playerTurn)) {
			switch (this.playerTurn) {
			case 1:
				displayVictory(2, "blue");
				break;
			case 2:
				displayVictory(1, "red");
				break;
			this.gameOver = true;
			return;
			}
		}
		if(this.canPlayerCapture(this.playerTurn)) Game.hasToCapture = true;
	},
	
	//Returns piece that is in specified square
	getPieceIn: function(square) {
		for(var i = 0; i < Game.pieces.length; i++) {
			if(Game.pieces[i].square == square) return Game.pieces[i];
		}
		return null;
	},
	
	//Check if specified player can make any captures
	canPlayerCapture: function(player) {
		for(var i = 0; i < Game.pieces.length; i++) {
			if(Game.pieces[i].player == player) {
				if(Game.pieces[i].alive) {
					if(Game.pieces[i].canCaptureAny()) {
						return true;
					}
				}
			}
		}
		return false;
	},
	
	//Check if specified player can make any moves
	canPlayerMove: function(player) {
		for(var i = 0; i < Game.pieces.length; i++) {
			if(Game.pieces[i].player == player) {
				if(Game.pieces[i].alive) {
					if(Game.pieces[i].canMoveAny()) {
						return true;
					}
				}
			}
		}
		return false;
	},
	
	//Check if specified player can do anything
	canPlayerDoAnything: function(player) {
		if(this.canPlayerMove(player) || this.canPlayerCapture(player)) return true;
		return false;
	}
}

//Calculate size for squares
function calculateSqSize(size) {
	var h1 = document.getElementsByTagName("H1")[0];
	var desc = document.getElementsByTagName("P")[0];
	var takenHeight = h1.clientHeight + desc.clientHeight + 100;
	var fieldSet = document.getElementById("ruudukko");
	var takenWidth = fieldSet.clientWidth + 50;
	
	var availableHeight = document.documentElement.clientHeight - takenHeight;
	var availableWidth = document.documentElement.clientWidth - takenWidth;
	
	if (availableHeight <= availableWidth) return availableHeight / size;
	else return availableWidth / size;
}
