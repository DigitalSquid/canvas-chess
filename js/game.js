function Game () {
	var PAWN = 0,
		ROOK = 1,
		KNIGHT = 2,
		BISHOP = 3,
		QUEEN = 4,
		KING = 5,
		active = 0,
		taken = 1,
		range,
		SQUARE_SIZE,
		ctx,
		canvas,
		selectedPiece = null,
		selectedSquare,
		SELECT_LINE_WIDTH = 2,
		colour = {
			border: 'rgba(255, 0, 0, 0.75)',
			highlight: 'rgba(100, 175, 215, 0.4)',
			takeable: 'rgba(150, 215, 100, 0.4)',
			check: 'rgba(215, 150, 100, 0.4)'
		},
		positions = {},
		availableSquares = [],
		enpassant = {
			'white': {
				'col': null,
				'row': null
			},
			'black': {
				'col': null,
				'row': null
			}
		},
		currentTurn = 'white',
		sideModifier = currentTurn == 'white' ? -1 : 1;
		opponentTurn = currentTurn == 'white' ? 'black' : 'white',
		operators = {
			'>=': function(a, b) { return a >= b },
			'<=': function(a, b) { return a <= b }
		};

	if (sessionStorage.getItem('positions')) {
		positions = JSON.parse(sessionStorage.getItem('positions'));
		currentTurn = sessionStorage.getItem('currentTurn');
		sideModifier = currentTurn == 'white' ? -1 : 1;
	} else {
		positions = {
			'black': [
				{'type': ROOK,		'col': 0,	'row': 0, 	'status': active, 'moved': false},
				{'type': KNIGHT,	'col': 1,	'row': 0,	'status': active},
				{'type': BISHOP,	'col': 2,	'row': 0,	'status': active},
				{'type': QUEEN,		'col': 3,	'row': 0,	'status': active},
				{'type': KING,		'col': 4,	'row': 0,	'status': active, 'moved': false, 'inCheck': false},
				{'type': BISHOP,	'col': 5,	'row': 0,	'status': active},
				{'type': KNIGHT,	'col': 6,	'row': 0,	'status': active},
				{'type': ROOK,		'col': 7,	'row': 0,	'status': active, 'moved': false},
				{'type': PAWN,		'col': 0,	'row': 1,	'status': active},
				{'type': PAWN,		'col': 1,	'row': 1,	'status': active},
				{'type': PAWN,		'col': 2,	'row': 1,	'status': active},
				{'type': PAWN,		'col': 3,	'row': 1,	'status': active},
				{'type': PAWN,		'col': 4,	'row': 1,	'status': active},
				{'type': PAWN,		'col': 5,	'row': 1,	'status': active},
				{'type': PAWN,		'col': 6,	'row': 1,	'status': active},
				{'type': PAWN,		'col': 7,	'row': 1,	'status': active}
			],
			'white': [
				{'type': ROOK,		'col': 0,	'row': 7, 	'status': active, 'moved': false},
				{'type': KNIGHT,	'col': 1,	'row': 7,	'status': active},
				{'type': BISHOP,	'col': 2,	'row': 7,	'status': active},
				{'type': QUEEN,		'col': 3,	'row': 7,	'status': active},
				{'type': KING,		'col': 4,	'row': 7,	'status': active, 'moved': false, 'inCheck': false},
				{'type': BISHOP,	'col': 5,	'row': 7,	'status': active},
				{'type': KNIGHT,	'col': 6,	'row': 7,	'status': active},
				{'type': ROOK,		'col': 7,	'row': 7,	'status': active, 'moved': false},
				{'type': PAWN,		'col': 0,	'row': 6,	'status': active},
				{'type': PAWN,		'col': 1,	'row': 6,	'status': active},
				{'type': PAWN,		'col': 2,	'row': 6,	'status': active},
				{'type': PAWN,		'col': 3,	'row': 6,	'status': active},
				{'type': PAWN,		'col': 4,	'row': 6,	'status': active},
				{'type': PAWN,		'col': 5,	'row': 6,	'status': active},
				{'type': PAWN,		'col': 6,	'row': 6,	'status': active},
				{'type': PAWN,		'col': 7,	'row': 6,	'status': active}
			]
		};

		sessionStorage.setItem('positions', JSON.stringify(positions));
		sessionStorage.setItem('currentTurn', currentTurn);
		sideModifier = currentTurn == 'white' ? -1 : 1;
	}

	this.draw = function () {
		canvasHighlight = document.getElementById('highlight');
		canvas = document.getElementById('pieces');
		board = document.getElementById('board');
		hgt = canvasHighlight.getContext('2d');
		ctx = canvas.getContext('2d');

		document.querySelector('.turn-tracker strong').innerHTML = currentTurn;

		SQUARE_SIZE = canvas.height / 8;

		// Draw pieces
		pieceImage = new Image();
		pieceImage.src = 'i/book_set_44px.gif';

		pieceImage.onload = function() {
			game.drawPieces(positions.white);
			game.drawPieces(positions.black, true);
		}

		canvas.addEventListener('click', this.board_click, false);		
	};

	this.drawPieces = function (side, isBlack) {
		for (piece in side) {
			if (side.hasOwnProperty(piece) && side[piece]['status'] == 0) {
				game.drawPiece(side[piece].type, side[piece].col, side[piece].row, isBlack)
			}
		}
	},

	this.drawPiece = function (type, col, row, isBlack) {
		ctx.drawImage(pieceImage, type * SQUARE_SIZE, isBlack ? 0 : SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE,col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
	};

	this.board_click = function (event) {
		var x = board.style.left - board.offsetLeft + event.pageX,
			y = board.style.top - board.offsetTop + event.pageY,
			square = {
				"col": Math.floor(x / SQUARE_SIZE),
				"row": Math.floor(y / SQUARE_SIZE)
			},
			clickedPiece = game.selectPiece(square.col, square.row, currentTurn);

		if (clickedPiece !== null) {
			// Check to see if your pieces is clicked
			if (clickedPiece['status'] === 0) {
				game.pieceSelection(clickedPiece);
			}
		} else {
			// If not, check to see if the clicked square is an available move
			for (var i = 0, j = availableSquares.length; i < j; i++) {
				if (square.row == availableSquares[i].row && square.col == availableSquares[i].col) {
					if (selectedPiece.type === 0 && (square.row == selectedPiece.row + 2 || square.row == selectedPiece.row - 2)) {
						enpassant[currentTurn].col = square.col;
						enpassant[currentTurn].row = square.row + (sideModifier * -1);
					} else {
						enpassant[currentTurn] = {};
					}

					// Castling movement
					if (selectedPiece.type === 5) {
						var rook,
							rookSquare = {};

						if (square.col - selectedPiece.col === 2) {
							rook = game.selectPiece(positions[currentTurn][7].col, positions[currentTurn][7].row, currentTurn);
							rookSquare.col = selectedPiece.col + 1;
							rookSquare.row = selectedPiece.row;
							game.movePiece(rook, rookSquare, true);
						}

						if (square.col - selectedPiece.col === -2) {
							rook = game.selectPiece(positions[currentTurn][0].col, positions[currentTurn][0].row, currentTurn);
							rookSquare.col = selectedPiece.col - 1;
							rookSquare.row = selectedPiece.row;
							game.movePiece(rook, rookSquare, true);
						}
					}

					game.movePiece(selectedPiece, square);
					break;
				}
			}
		}

	};

	this.pieceSelection = function (piece) {
		//availableSquares = [];
		selectedPiece = piece;

		game.clearHighlights();
		game.highlightPiece(piece);
		game.availableMoves();

	};

	this.clearHighlights = function () {
		hgt.clearRect (0, 0, 352, 352);
	};

	this.highlightPiece = function (piece) {
		// Draw outline
		hgt.lineWidth = SELECT_LINE_WIDTH;
		hgt.strokeStyle = colour.border;
		hgt.strokeRect(piece.col * SQUARE_SIZE + 1, piece.row * SQUARE_SIZE + 1, SQUARE_SIZE - 2, SQUARE_SIZE - 2);
	};

	this.collisonCheck = function (col, row) {
		var collision = false;

		for (side in positions) {
			for (var i = 0, j = positions[side].length; i < j; i++) {
				if (positions[side][i]['row'] == row && positions[side][i]['col'] == col) {
					collision = side;
				}
			}
		}

		return collision;			
	};

	this.pieceMovement = function (piece, directions, limit) {
		var min = 0,
			max = 7,
			collision,
			col,
			row;

		for (i = 0; i < directions.length; i++) {
			collision = false;
			col = piece.col;
			row = piece.row;
			
			if (limit) {
				for (var k = 0; k < limit; k++) {
					collision = this.moveCheck(col += directions[i][0], row += directions[i][1], piece);
				} 
			} else {
				while (collision == false) {
					collision = this.moveCheck(col += directions[i][0], row += directions[i][1], piece);
				}
			}
		}
	};

	this.moveCheck = function (col, row, piece) {
		var collisonCheck = this.collisonCheck(col, row),
			collision = false;

		if (col < 0 || col > 7 || row < 0 || row > 7) {
			collision = true;
		} else {
			if (collisonCheck === currentTurn) {
				collision = true;
			} else if (collisonCheck === opponentTurn) {
				console.log('Boom')
				availableSquares.push({'col':col, 'row':row});
				game.highlightSquare(col, row, true);
				collision = true;
			} else {
				if (piece.type != 0 || col == piece.col || this.enpassantCheck(col, row)) {
					availableSquares.push({'col':col, 'row':row});
					game.highlightSquare(col, row);
				}
			}
		}
		return collision;
	};

	this.enpassantCheck = function (col, row) {
		var isEnpassant = false;

		if (col == enpassant[opponentTurn].col && row == enpassant[opponentTurn].row) {
			isEnpassant = true;
		}

		return isEnpassant;
	};

	this.availableMoves = function (pieceCheck) {
		var directions = [];

		selectedPiece = pieceCheck ? pieceCheck : selectedPiece;

		// Pawn movement
		if (selectedPiece.type === 0) {
			var adjacentColumns = [-1, 1];

			if (this.collisonCheck(selectedPiece.col, selectedPiece.row + sideModifier) == false) {
				directions.push([0, 1 * sideModifier])
			}

			if ((selectedPiece.row == 6 && currentTurn == 'white' || selectedPiece.row == 1 && currentTurn == 'black') && this.collisonCheck(selectedPiece.col, selectedPiece.row + sideModifier) == false) {
				directions.push([0, 2 * sideModifier]);
			};

			for (var i = 0; i < adjacentColumns.length; i++) {
				var aCol = selectedPiece.col + adjacentColumns[i],
					aRow = selectedPiece.row + sideModifier;

				if (this.collisonCheck(aCol, aRow) === opponentTurn || (aCol === enpassant[opponentTurn].col && aRow === enpassant[opponentTurn].row)) {
					directions.push([adjacentColumns[i], 1 * sideModifier]);
				}
			}

			this.pieceMovement(selectedPiece, directions, 1);
		}

		// Rook movement
		if (selectedPiece.type === 1) {
			directions = [[0, -1],[-1, 0],[0, 1],[1, 0]];
			this.pieceMovement(selectedPiece, directions);
		}

		// Knight movement
		if (selectedPiece.type === 2) {
			var min = 0,
				max = 7,
				col,
				row;

			directions = [[-1, -2], [1, -2], [2, -1], [2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1]];

			for (i = 0; i < directions.length; i++) {
				col = selectedPiece.col - directions[i][0];
				row = selectedPiece.row - directions[i][1];
				if (col >= min && col <= max && row >= min && row <= max && this.collisonCheck(col, row) != currentTurn) {
					availableSquares.push({'col':col, 'row':row});
					game.highlightSquare(col, row);
				}
			}
		}

		// Bishop movement
		if (selectedPiece.type === 3) {
			directions = [[-1, -1],[-1, 1],[1, -1],[1, 1]];
			this.pieceMovement(selectedPiece, directions);
		}

		// Queen movement
		if (selectedPiece.type === 4) {
			directions = [[0, -1],[-1, 0],[0, 1],[1, 0],[-1, -1],[-1, 1],[1, -1],[1, 1]];
			this.pieceMovement(selectedPiece, directions);
		}

		// King movement
		if (selectedPiece.type === 5) {
			directions = [[0, -1],[-1, 0],[0, 1],[1, 0],[-1, -1],[-1, 1],[1, -1],[1, 1]];

			// Castling
			// Need to add in-check logic as well
			if (selectedPiece.moved == false) {
				if (positions[currentTurn][0].moved === false && this.collisonCheck(selectedPiece.col - 1, selectedPiece.row) === false) {
					directions.push([-2, 0])
				}

				if (positions[currentTurn][7].moved === false && this.collisonCheck(selectedPiece.col + 1, selectedPiece.row) === false) {
					directions.push([2, 0])
				}
			}

			this.pieceMovement(selectedPiece, directions, 1);
		}
	};

	this.movePiece = function (piece, square, castling) {
		var pieceToRemove = game.selectPiece(square.col, square.row, opponentTurn),
			eCol,
			eRow;

		// Enpassant
		if (piece.type === 0 && square.col === enpassant[opponentTurn].col && square.row === enpassant[opponentTurn].row) {
			eCol = enpassant[opponentTurn].col;
			eRow = enpassant[opponentTurn].row + (sideModifier * -1);
			this.drawBlock(eCol, eRow);
			pieceToRemove = game.selectPiece(eCol, eRow, opponentTurn);
		}

		if (pieceToRemove !== null) {
			game.drawBlock(pieceToRemove.col, pieceToRemove.row);
			pieceToRemove['status'] = 1;
		}

		// Re-draw the piece being moved
		this.drawBlock(piece.col, piece.row);
		this.drawPiece(piece.type, square.col, square.row, currentTurn == 'black' ? true : false);

		if (piece.moved === false) {
			piece.moved = true;
		}

		game.checkCheck();
		this.updatePosition(piece, square);

		// Update the turn variables
		if (castling !== true) {
			availableSquares = [];
			game.clearHighlights();
			selectedPiece = {};
			selectedSquare = {};
			currentTurn = currentTurn == 'white' ? 'black' : 'white';
			opponentTurn = currentTurn == 'white' ? 'black' : 'white';
			sideModifier = currentTurn == 'white' ? -1 : 1;

			document.querySelector('.turn-tracker strong').innerHTML = currentTurn;

			sessionStorage.setItem('currentTurn', currentTurn)
		}
	};

	this.updatePosition = function (piece, square) {
		for (pieceToMove in positions[currentTurn]) {
			if (positions[currentTurn][pieceToMove]['row'] == piece.row && positions[currentTurn][pieceToMove]['col'] == piece.col) {
				positions[currentTurn][pieceToMove]['row'] = square.row;
				positions[currentTurn][pieceToMove]['col'] = square.col;
				sessionStorage.setItem('positions', JSON.stringify(positions))
			}
		}
	}

	this.selectPiece = function (col, row, turn) {
		var selectedPiece = null;

		for (piece in positions[turn]) {
			if (positions[turn][piece]['col'] === col && positions[turn][piece]['row'] === row) {
				selectedPiece = positions[turn][piece];
			}
		}
		return selectedPiece;
	}

	this.checkCheck = function () {
		for (piece in positions[opponentTurn]) {
			game.availableMoves(piece)
		}
	};

	this.drawBlock = function (col, row) {
		ctx.clearRect(col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
		ctx.stroke();
	};

	this.highlightSquare = function (col, row, take) {
		hgt.fillStyle = take ? colour.takeable : colour.highlight;
		hgt.fillRect(col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
	};

	this.init = function () {
		game.draw();
	};
}

var game = new Game();
game.init();