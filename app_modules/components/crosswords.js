import { myError } from "../error.js";

export class Crosswords {
    constructor (data) {

        let { element, crosswords } = data;
        this.element = element;
        this.crosswords = crosswords;
        this.direction = "h";

        element.innerHTML = `
            <div class="cross"></div>
            <div class="legend">Förklaring</div>
            <div class="keyboard"></div>
        `;

        data = {...data, main: this};
        this.Cross = new Cross({ ...data });
        this.Keyboard = new Keyboard({...data});
    }

    getElement (which) {
        if (!which) return this.element;
        else return this.element.querySelector(`.${which}`);
    }

    keyboardClick (char) {
        let cellUpdating = Cell.updating;
        if (cellUpdating) {

            if (char === "clear") {
                cellUpdating.element.textContent = "";
            } else {
                cellUpdating.element.textContent = char;
            }

            // Next cell in word is updating
            let nextCell = Word.active.nextCell(cellUpdating);
            console.log(nextCell);
            if (nextCell !== null) {
                nextCell.isUpdating();
            } else {
                cellUpdating.isUpdating(false);
            }

        }
    }

    showLegend (description) {
        this.element.querySelector(".legend").textContent = description.text;
    }
}

class Cross {
    constructor (data) {
        this.data = data;

        // Get the size of the crosswords
        let width = 0;
        let height = 0;
        this.data.crosswords.words.forEach( word => {
            if (word.direction === "h") {
                width = Math.max(width, word.origin[0] + word.length );
            } else {
                height = Math.max(height, word.origin[1] + word.length );
            }
        });

        
        // Update the CSS
        console.log(data);
        let element = data.main.getElement("cross");
        let wElement = parseInt(getComputedStyle(element).width);
        let hElement = ( wElement * height / width ) + "px";
        element.style.height = hElement;
        element.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
        element.style.gridTemplateRows = `repeat(${height}, 1fr)`;
        element.style.setProperty("--szFontCross", `${0.6 * parseInt(hElement) / height}px`);
    

        // Create cells
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                let multiplier = data.crosswords.multipliers.find( m => samePos(m.origin, [col, row]));
                multiplier = multiplier ? multiplier.factor : 1;
                let cell = (new Cell({ 
                                        origin: [col, row],
                                        multiplier,
                                        main: this.data.main
                                    })).element;
                element.append(cell);
            }
        }


        // Create words
        data.crosswords.words.forEach( word => {
            new Word({ ...data, ...word });
        });

        
        // Fill empty squares
        Cell.all.forEach( cell => {
            if (cell.inWords.length === 0) {
                cell.isEmpty();
            }
        });

        console.log((Word.all));
        console.log((Cell.all));        

    }
}

class Word {

    static all = [];
    static get active() {
        return Word.all.find( w => w.active );
    }

    constructor (data) {
        this.data = data;
        Word.all.push(this);

        this.cells = [];

        if (this.data.direction === "h") {
            for (let col = 0; col < this.data.length; col++) {
                this.cells.push(Cell.all.find(c => samePos(c.data.origin, [this.data.origin[0] + col, this.data.origin[1]])));
            }
        } else {
            for (let row = 0; row < this.data.length; row++) {
                this.cells.push(Cell.all.find(c => samePos(c.data.origin, [this.data.origin[0], this.data.origin[1] + row])));
            }
        }

    }

    get active () {
        return this._active || (this._active = false);
    }
    activate (boolean = true) {

        let currentlyActive = Word.active;
        (currentlyActive && currentlyActive !== this) && currentlyActive.activate(false);
        
        this._active = boolean;
        let action = boolean ? "add" : "remove";
        this.cells.forEach( cell => {
            cell.element.classList[action]("active");
        });

        this.data.main.showLegend(this.data.description);

    }
    nextCell (cell) {

        let index = this.cells.indexOf(cell);
        console.log(index);
        if (index >= this.cells.length - 1) {
            return null;
        } else {
            return this.cells[index + 1];
        }

    }
}

class Cell {

    static all = [];
    static get updating () { return Cell.all.find(c => c._updating); }

    constructor (data) {
        this.data = data;
        this.data._isEmpty = false;

        Cell.all.push(this);
    }

    get element () {
        
        if (this._element) return this._element;
        
        let element = document.createElement("div");
        element.classList.add("cell");
        if (this.data.multiplier !== 1) {
            element.classList.add(`mult${this.data.multiplier}`);
            element.classList.add(`multiplier`);
        }

        let object = this;
        element.click({
            callback: () => {

                if (element === document.querySelector(".cell.updating")) {
                    let temp = this.data.main.direction;
                    this.data.main.direction = temp === "h" ? "v": "h";
                }

                object.myCurrentWord.activate();
                Cell.updating && Cell.updating.isUpdating(false);
                this.isUpdating();

            }
        });

        return this._element = element;
    }
    get inWords () {
        if (this._words) return this._words;
        let words = Word.all.filter( w => w.cells.some(c => samePos(this.data.origin, c.data.origin)));
        return this._words = words;
    }
    get myCurrentWord() {
        let word = this.inWords[0];
        if (this.inWords.length > 1) {
            word = this.inWords.find( w => w.data.direction === this.data.main.direction );
        }
        if (!word) {
            myError.throw();
        }
        return word;
    }
    get updating () {
        return this._updating || (this._updating = false);
    }
    isUpdating (boolean = true) {

        let currentlyUpdating = Cell.updating;
        (currentlyUpdating && currentlyUpdating !== this) && currentlyUpdating.isUpdating(false);

        this._updating = boolean;
        let action = boolean ? "add" : "remove";
        this.element.classList[action]("updating");

    }
    isEmpty () {
        this._isEmpty = true;
        this.element.classList.add("empty");
    }
}

class Keyboard {

    static decalees = ["Z", "X", "C", "V", "B", "N", "M", "clear"];

    constructor(data) {
        this.data = data;
        let element = data.main.getElement("keyboard");

        let _querty = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "Å", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Ö", "Ä", null, null, "Z", "X", "C", "V", "B", "N", "M", "clear"];
        _querty.forEach( char => {
            element.append( new Key({...data, char}).element );
        });
    }
}

class Key {

    constructor (data) {
        this.data = data;

        this.element = document.createElement("button");
        
        if (data.char) {
            if (data.char === "clear") {
                this.element.classList.add("clear");
            }
            if (Keyboard.decalees.includes(data.char)) {
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