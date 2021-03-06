import { ApiBridge } from "../apiBridge.js";
import { myError } from "../error.js";
import { State } from "../state.js";
import { SubPub } from "../subpub.js";



export class Crosswords {
    constructor (data) {

        let { element, crosswords, toneicID } = data;
        this.toneicID = toneicID;
        this.element = element;
        this.crosswords = crosswords;
        this.direction = "h";

        element.innerHTML = `
            <div class="cross"></div>
            <div class="keyboard"></div>
            <div class="legend">
                <button class="close"></button>
                <div class="image">
                    <img>
                </div>
                <div class="text"></div>
                <div class="podcastTime"></div>
            </div>
        `;

        data = {...data, main: this};
        this.Cross = new Cross({ ...data });
        this.Keyboard = new Keyboard({...data});

        element.querySelector("button.close").click({
            callback: () => {
                element.querySelector(".legend").classList.remove("visible");
            }
        });

        SubPub.subscribe({
            event: "event::crosswords:latestActions:success",
            listener: (response) => {
                console.log(response);
                let { actions, init } = response.payload.data;

                if (init) {
                    this.Cross.reset();
                }

                actions.sort((a, b) => a.number - b.number);
                actions.forEach((action, index) => {
                    setTimeout(() => {
                        
                        switch (action.kind) {
                            case "letterUpdate":
                                this.Cross.cellFromOrigin(action.origin).element.textContent = action.value;
                                break;
                            default:
                                myError.throw();
                        }


                    }, index * 200);
                });
            }
        });

        SubPub.subscribe({
            event: "event::team:join:success",
            listener: (response) => {
                console.log(State.local);
                ApiBridge.crosswordsLatestActions({                    
                    toneicID: State.local.currentToneicID,
                    init: true,
                });
            }
        });
    
    }

    getElement (which) {
        if (!which) return this.element;
        else return this.element.querySelector(`.${which}`);
    }
    keyboardClick (char) {
        // let cellUpdating = Cell.updating;
        let cellUpdating = this.Cross.cellUpdating;
        if (cellUpdating) {

            let value = char === "clear" ? "" : char;

            ApiBridge.crosswordsNewAction({
                toneicID: this.toneicID,
                origin: cellUpdating.data.origin,
                value,
                callback: (response) => {
                    if (!response.success || !response.payload.data.updated) {

                        // TODO: What to do?
                        console.log("response");
                        myError.throw();

                    } else {
                        
                        cellUpdating.updateLetter(value);

                    }
    
                }
            });

            // Next cell in word becomes updating
            let nextCell = this.Cross.activeWord.nextCell(cellUpdating);
            if (nextCell !== null) {
                nextCell.isUpdating();
            } else {
                cellUpdating.isUpdating(false);
            }

        }
    }
    showLegend (description) {

        console.log("Show Legend", description, this.element);

        let legend = this.element.querySelector(".legend");
        legend.querySelectorAll(".legend > *").forEach( e => e.classList.add("invisible") );

        if (description.text || description.image) {

            setTimeout(() => {
    
                legend.querySelector(".legend .text").textContent = "";
                legend.querySelector(".legend img").setAttribute("src", "");
        
                legend.querySelector(".legend .text").textContent = description.text;
                if (description.image) {
                    let imageSrc = `./db/toneics/${State.local.currentToneicID}/${description.image}`;
                    legend.querySelector(".legend img").setAttribute("src", imageSrc);    
                }
    
                // if (!description.text && !description.image) {
                //     legend.querySelector(".legend .text").textContent = "Ledtr??dar i podcasten";
                // }
    
                legend.querySelectorAll(".legend > *").forEach( e => e.classList.remove("invisible") );
                legend.classList.add("visible");
                        
            }, 500);
        }

    }
}

class Cross {
    constructor (data) {
        this.data = data;


        // Create words
        this._allWords = [];
        data.crosswords.words.forEach( word => {
            this._allWords.push( new Word({ ...data, ...word, Cross: this }) );
        });

                
        // Get the size of the crosswords
        let width = 0, height = 0;
        this.allWords.forEach( word => {
            width = Math.max(width, word.dims.width);
            height = Math.max(height, word.dims.height);
        });

        
        // Update the CSS
        let element = data.main.getElement("cross");
        let wElement = parseInt(getComputedStyle(element).width);
        let hElement = ( wElement * height / width ) + "px";
        element.style.height = hElement;
        element.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
        element.style.gridTemplateRows = `repeat(${height}, 1fr)`;
        element.style.setProperty("--szFontCross", `${0.6 * parseInt(hElement) / height}px`);
    

        // Create cells
        this._allCells = [];
        let allTurns = [];
        data.crosswords.words.filter(w => w.turns).forEach(w => {
            allTurns = [...allTurns, ...w.turns.map((t, index) => {
                return {
                    origin: t.corner,
                    direction: index % 2 === 0 ? (w.direction === "h" ? "v" : "h") : w.direction
                };
            })]
        });
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                
                let multiplier = data.crosswords.multipliers.find( m => samePos(m.origin, [col, row]));
                multiplier = multiplier ? multiplier.factor : 1;

                let turn = allTurns.find( t => samePos(t.origin, [col, row]));
                turn = turn ? turn.direction : null;

                let cell = new Cell({ 
                    origin: [col, row],
                    multiplier,
                    turn,
                    main: this.data.main,
                    Cross: this,
                });
                this._allCells.push(cell);
                element.append(cell.element);
            }
        }

        // Fill empty squares
        this.allCells.forEach( cell => {
            if (cell.inWords.length === 0) {
                cell.empty = true;
            }
        });


        // Numbers for letter cells
        let repeats = 0;
        data.crosswords.words.forEach( (word, index) => {
            if (index > 0 && samePos(word.origin, data.crosswords.words[index - 1])) {
                // this word has same origin as last one.
                repeats++;
            }
            this.cellFromOrigin(word.origin).addNumber(index - repeats);
        });

    }

    reset () {
        this.allCells.forEach( cell => {
            !cell.empty && cell.updateLetter("");
        });
    }

    get allWords () {
        return this._allWords;
    }
    get activeWord () {
        return this.allWords.find( w => w.active );
    }
    get allCells () {
        return this._allCells;
    }
    get cellUpdating () {
        return this.allCells.find(c => c._updating);
    }
    cellFromOrigin (origin) {
        return this.allCells.find(c => samePos(c.data.origin, origin));
    }
}

class Word {

    constructor (data) {
        this.data = data;
    }

    get active () {
        return this._active || (this._active = false);
    }
    get dims() {
        if (this._dims) {
            return this._dims;
        }

        let wordClone = {...this.data};
        wordClone.turns = this.data.turns ? [...this.data.turns] : undefined;
        return this._dims = calculateDims(wordClone, {
            width: this.data.origin[0],
            height: this.data.origin[1]
          });

        function calculateDims(word, dims) {
            const key = word.direction === "h" ? "width" : "height";
            const index = key === "width" ? 0 : 1;
            if (word.turns && word.turns.length) {
                const length = word.turns[0].corner[index] - word.origin[index];
                dims[key] += length;

                word.origin = word.turns[0].corner;
                word.direction = word.direction === "h" ? "v" : "h";
                word.turns.splice(0, 1);
                word.length -= length;
                return calculateDims(word, dims);
            } else {
                dims[key] += word.length;
                return dims;
            }
        }
    }
    get cells () {
        if (this._cells) {
            return this._cells;
        }
        const allCells = this.data.Cross.allCells;

        let wordClone = {...this.data};
        wordClone.turns = this.data.turns ? [...this.data.turns] : undefined; // We splice this one so we need aclone of it too
        
        this._cells = assignCells(wordClone);

        // Mark word separations
        // Direction depends on turns, but we can check it by looking at the position of the next cell
        let word = this;
        this.data.spaces.forEach( sp => {
            const cell1 = word.cells[sp];
            const cell2 = word.cells[sp + 1]; // Words cannot have a space at the end
            const direction = cell1.data.origin[0] === cell2.data.origin[0] ? "v" : "h";
            cell1.element.classList.add(direction + "_separator");
        });


        return this._cells;

        function assignCells (word, cells = []) {
            if (word.turns && word.turns.length) {
                cells = [...cells, ...cellsToCell(word, word.turns[0].corner)];

                word.origin = word.turns[0].corner;
                word.direction = word.direction === "h" ? "v" : "h";
                word.turns.splice(0, 1);
                return assignCells(word, cells);
            } else {
                cells = [...cells, ...cellsToCell(word)];
                return cells;
            }
        }
        function cellsToCell (word, end = null) {
            let cells = [];
            const index = word.direction === "h" ? 0 : 1;
            const length = end ? end[index] - word.origin[index] : word.length;
            word.length -= length;
            if (word.direction === "h") {
                for (let col = 0; col < length; col++) {
                    cells.push(allCells.find(c => samePos(c.data.origin, [word.origin[0] + col, word.origin[1]])));
                }
            } else {
                for (let row = 0; row < length; row++) {
                    cells.push(allCells.find(c => samePos(c.data.origin, [word.origin[0], word.origin[1] + row])));
                }
            }
            return cells;
        }
    }
    activate (boolean = true) {

        let currentlyActive = this.data.Cross.activeWord;

        console.log("Activate Word", boolean, currentlyActive, this.data.origin);

        if (currentlyActive && currentlyActive !== this) {
            currentlyActive.activate(false);
        }
        
        this._active = boolean;
        let action = boolean ? "add" : "remove";
        this.cells.forEach( cell => {
            cell.element.classList[action]("active");
        });

        boolean && this.data.main.showLegend(this.data.description);

        // if (currentlyActive !== this) {
        //     this.data.main.showLegend(this.data.description);
        // }

    }

    nextCell (cell) {

        let index = this.cells.indexOf(cell);
        if (index >= this.cells.length - 1) {
            return null;
        } else {
            return this.cells[index + 1];
        }

    }
}

class Cell {

    constructor (data) {
        this.data = data;
        this.data._empty = false;
    }

    get element () {
        
        if (this._element) return this._element;
        
        let element = document.createElement("div");
        element.classList.add("cell");

        if (this.data.multiplier !== 1) {
            element.classList.add(`mult${this.data.multiplier}`);
            element.classList.add(`multiplier`);
        }
        if (this.data.turn) {
            element.classList.add(`turn_${this.data.turn}`);
            // element.classList.add(`multiplier`);
        }

        let object = this;
        element.click({
            callback: () => {

                if (element === document.querySelector(".cell.updating")) {
                    let temp = this.data.main.direction;
                    this.data.main.direction = temp === "h" ? "v": "h";
                }

                object.myCurrentWord.activate();
                this.data.Cross.cellUpdating && this.data.Cross.cellUpdating.isUpdating(false);
                // Cell.updating && Cell.updating.isUpdating(false);
                this.isUpdating();

            }
        });

        return this._element = element;
    }
    get empty () {
        return this.data._empty;
    }
    set empty (boolean) {
        this.data._empty = boolean;
        this.element.classList[boolean ? "add" : "remove"]("empty");
    }
    get inWords () {
        if (this._words) return this._words;
        let words = this.data.Cross.allWords.filter( w => w.cells.some(c => samePos(this.data.origin, c.data.origin)));
        return this._words = words;
    }
    get myCurrentWord() {
        let word = this.inWords[0];
        if (this.inWords.length > 1) {
            word = this.inWords.find( w => w.data.direction === this.data.main.direction );
        }
        if (!word) {
            console.log(this.inWords);
            myError.throw();
        }
        return word;
    }
    get updating () {
        return this._updating || (this._updating = false);
    }
    addNumber (number) {
        this.element.style.setProperty("--number", `"${number.toString()}"`);
        this.element.classList.add("number");
    }
    isUpdating (boolean = true) {

        // let currentlyUpdating = Cell.updating;
        let currentlyUpdating = this.data.Cross.cellUpdating;
        (currentlyUpdating && currentlyUpdating !== this) && currentlyUpdating.isUpdating(false);

        this._updating = boolean;
        let action = boolean ? "add" : "remove";
        this.element.classList[action]("updating");

    }

    updateLetter (value) {
        this.element.textContent = value;
    }
}

class Keyboard {

    constructor(data) {
        this.data = data;
        let element = data.main.getElement("keyboard");

        let _querty = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "??", "A", "S", "D", "F", "G", "H", "J", "K", "L", "??", "??", null, null, "Z", "X", "C", "V", "B", "N", "M", "clear"];
        _querty.forEach( char => {
            element.append( new Key({...data, char}).element );
        });
    }
}

class Key {

    constructor (data) {
        this.data = data;

        this.element = document.createElement("button");
        
        const Decalees = ["Z", "X", "C", "V", "B", "N", "M", "clear"];        

        if (data.char) {
            if (data.char === "clear") {
                this.element.classList.add("clear");
            }
            if (Decalees.includes(data.char)) {
                this.element.classList.add("decalee");
            }
            this.element.textContent = data.char;
            this.element.click({
                callback: function() {
                    data.main.keyboardClick(data.char);
                }
            })
        } else {
            this.element.classList.add("null");
        }

    }
}

function samePos(a1, a2) {
    return a1[0] === a2[0] && a1[1] === a2[1];
}