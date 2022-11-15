let drMemGame = function() {
    let debugFlag = false;
    let serverOnly = true;
    let cards = ["Car", "Train", "Bike", "Scooter", "Plane", "Helicopter" ];
    let grid = [4, 3];
    let states;

    let debug = (_debug) => {
        debugFlag = _debug;
    }
    
    let d = (msg) => {
        if (debugFlag) {
            console.log(msg);
        }
    }
    
    function Card(name) {
        this.name = name;
        this.flipped = false;
        this.index = -1;
        this.valid = true;
    }
    
    Card.prototype.toString = function() {
        return this.name;
    }
    
    let shuffle = (arr) => {
        let shuffledCards = [];
        let i = 0;
        while (i < arr.length) {
            const rnd = Math.floor(Math.random() * arr.length);
            const card = arr.splice(rnd,1)[0];
            shuffledCards.push(card);
        }
        return shuffledCards;
    }

    let init = (cardsArr, gridArr) => {
        if (cardsArr && gridArr) {
            if ( (cardsArr.length*2) != (gridArr[0]*gridArr[1]) ) {
                    p("Make sure your cards fit exactly into the array.");
            } else {
                cards = cardsArr;
                grid = gridArr;
            }
        } 
        states = {
            moves: 0,
            flippedCardsInRound: 0b00,
            plane: shuffle([cards, cards]
                .flat()
                .map(name => new Card(name)))
                .map((card, index) => {
                    card.index = index;
                    return card;
                }),
                gameOver: false
        }
    }  
    
    let p = (msg) => {
        console.log(msg);
    }

    let printStatus = () => {
        if (debugFlag) console.log(states);
    }

    let checkPlayable = (pos) => {
        let playable = true;
        if (states.gameOver) {
            p("---------------------------");
            p(`| Game Over with ${states.moves} moves |`);
            p("---------------------------");
            playable = false;
        }
        
        if (pos && !states.plane[pos].valid) {
            p(`${states.plane[pos].name} is not in the game anymore`);
            playable = false;
        }
        return playable;
    }

    let flip = (pos) => {
        if (!checkPlayable(pos)) return;
        
        if (states.plane[pos].flipped) {
            p(`${states.plane[pos]} is already flipped`);
            
        } else if (states.flippedCardsInRound < 2) {
            states.plane[pos].flipped = true;
            states.flippedCardsInRound += 0b01;
            states.moves++;
            p(`${states.plane[pos].name} flipped to true`);
            
        } else {
            p("Can't flip anymore.");
        }
        
        board();
        if (serverOnly && states.flippedCardsInRound == 2) settle();
    }

    let setIfGameOver = () => {
        for (let i = 0, len = states.plane.length; i < len; i++) {
            if (states.plane[i].valid) {
                return;
            }
        }
        states.gameOver = true;
        checkPlayable();
    }

    let settle = () => {
        if (!checkPlayable()) return;
        let match = false;
        if (states.flippedCardsInRound == 2) {
            let flippedCards = states.plane.reduce((res, cur) => {
                return cur.valid && cur.flipped ? res.concat(cur) : res;
            }, []);

            match = (flippedCards.length == 2 && flippedCards[0].name === flippedCards[1].name);
            if (match) {
                states.plane[flippedCards[0].index].valid = false;
                states.plane[flippedCards[1].index].valid = false;
                p(`Cards [${flippedCards[0].name}, ${flippedCards[1].name}] match.`);
                setIfGameOver();
            } else {
                states.plane[flippedCards[0].index].flipped = false;
                states.plane[flippedCards[1].index].flipped = false;
                p(`Cards [${flippedCards[0].name}, ${flippedCards[1].name}] don\'t match.`);
            }
            states.flippedCardsInRound = 0b00;
        } else if (states.flippedCardsInRound < 2) {
            p("Flip another card.");
        } else {
            p("An error has occured.");
        }
        board();
        return match;
    }

    let board = () => {
        for (let x = 0, lenX = grid[0]; x < lenX; x++) {
            let row = "...";
            for (let y = 0, lenY = grid[1]; y < lenY; y++) {
                let pos = (x * grid[1] + y);
                let printedStr = "";
                if (states.plane[pos].valid) {
                    if (states.plane[pos].flipped) {
                        printedStr = states.plane[pos].name;
                    } else {
                        printedStr = "***";
                    }
                }
                let item = `(${ pos }) ${printedStr.padEnd(15,".")}`;
                row += item;
            }
            p(row);
        }
    }

    //* Test code
    let test_provokeMatchingCards = (item) => {
        for (let i = 0, len = states.plane.length; i < len; i++) {
            if (states.plane[i].name === item) {
                flip(i);
            }
        }
    }

    init();

    return {
        flip,
        print:printStatus,
        debug,
        init,
        board
    }
}();