import { Field, FieldContent } from "./Field.js";

export class Game {
    private clicks = 0;
    private timerSeconds = 0;
    private timerMinutes = 0;
    private timerInterval = -1;
    private uncovered = 0;

    private stopped = false;

    fieldsCount: number = 0;
    fields: Field[][] = [];
    mineFields: Field[] = [];

    constructor(
        private targetElement: HTMLElement,
        public timerElement: HTMLElement,
        public clickCounterElement: HTMLElement,
        public onWin: (timerSeconds: number, timerMinutes: number, clicks: number) => void,
        public onExplosion: () => void,
    ) {}

    private reset() {
        this.stopped = false;
        this.timerSeconds = 0;
        this.timerMinutes = 0;
        this.clicks = 0;
        this.uncovered = 0;
        this.fields = [];
        this.mineFields = [];
        this.timerElement.innerText = '00:00';
        this.clickCounterElement.innerText = '0';
        clearInterval(this.timerInterval);
    }

    start(rows: number, columns: number, mines: number) {
        this.reset();
        if(mines >= rows * columns) {
            throw new Error('The amount of mines cannot be higher or equal to the amount of fields');
        }
        this.fieldsCount = rows * columns;
        this.targetElement.innerHTML = '';
        this.initialiseFields(rows, columns, mines);
        this.createBoard();
    }

    showAllMineFields() {
        for(const mineField of this.mineFields) {
            mineField.uncover();
        }
    }

    private getSurroundingFieldsAndMineCount(row: number, column: number): {
        surroundingFields: Field[],
        surroundingMineCount: number;
    } {
        let surroundingMineCount = 0;
        const surroundingFields: Field[] = [];
        // Use an arrow function otherwise 'this' will be rebound/reassigned to the function itself,
        // which would be an issue as we're trying to access the fields property of the game object
        const addFieldAndCheckForMine = (row: number, column: number): void => {
            // It's possible that one of the "surrounding fields" are undefined
            // e.g. the field to the top right of fields[0][0] would be fields[-1][-1], which is undefined
            // as it is outside of the array/board
            // So we will filter out these undefined elements
            if(this.fields[row] === undefined) {
                return undefined;
            }
            const field = this.fields[row][column];
            if(field !== undefined) {
                surroundingFields.push(field);
                if(field.hasMine()) {
                    surroundingMineCount += 1;
                }
            }
        }

        // ? ? ?
        // ? f ?
        // ? ? ?
        // -> There are 8 possible surrounding fields

        addFieldAndCheckForMine(row - 1, column - 1);     // top left
        addFieldAndCheckForMine(row - 1, column);                 // top center
        addFieldAndCheckForMine(row - 1, column + 1);     // top right

        addFieldAndCheckForMine(row, column - 1);              // middle left
        addFieldAndCheckForMine(row, column + 1);              // middle right

        addFieldAndCheckForMine(row + 1, column - 1);     // bottom left
        addFieldAndCheckForMine(row + 1, column);                 // bottom center
        addFieldAndCheckForMine(row + 1, column + 1);     // bottom right

        return {
            surroundingFields,
            surroundingMineCount,
        };
    }

    private initialiseFields(rows: number, columns: number, mines: number): void {
        const mineIndices: number[] = [];
        for(let i = 0; i < mines; i++) {
            // Math.random() generates a number in the interval [0, 1]
            // Multiply that by the number of fields (rows * columns) so
            // the number is now in [0, numberOfFields - 1]
            // Now use Math.round() to make it a whole number/integer
            let index = Math.round(Math.random() * (rows * columns - 1));

            // Use while loop so we don't end up generating 2 random indices
            // that happen to be equal
            while(mineIndices.includes(index)) {
                index = Math.round(Math.random() * (rows * columns - 1))
            }
            mineIndices.push(index);
        }

        // The fields creation process consists of 2 steps:
        // 1. Create the field objects and set their content (mine/empty)
        // 2. Update the field objects with their surrounding fields

        // The reason why we have two steps is because the created field of     e.g. x s s s x ..
        // an iteration won't be able to determine the complete list of              x s f ? ?
        // surrounding fields as some of those surrounding fields won't have         ? ? ? ? ?
        // been created yet
        // It is only after iterating over the full list of created fields
        // that we can determine the complete list of surrounding fields

        // Step 1: create fields and set their content
        let i = 0;
        for(let rowIndex = 0; rowIndex < rows; rowIndex++) {
            const fieldsRow: Field[] = [];
            for(let columnIndex = 0; columnIndex < columns; columnIndex++) {
                const hasMine = mineIndices.includes(i++);
                const field = new Field(
                    hasMine ? FieldContent.Mine : FieldContent.Empty,
                    event => {
                        if(!this.stopped) {
                            this.onFieldLeftClick(field);
                        }
                    },
                    event => {
                        event.preventDefault();
                        if(!this.stopped) {
                            this.onFieldRightClick(field);
                        }
                    },
                );
                fieldsRow.push(field);
                if(hasMine) {
                    this.mineFields.push(field);
                }
            }
            this.fields.push(fieldsRow);
        }

        // Step 2: determine surrounding fields
        for(let rowIndex = 0; rowIndex < rows; rowIndex++) {
            for(let columnIndex = 0; columnIndex < columns; columnIndex++) {
                const field = this.fields[rowIndex][columnIndex];
                const { surroundingFields, surroundingMineCount } = this.getSurroundingFieldsAndMineCount(rowIndex, columnIndex);
                field.initialise(surroundingFields, surroundingMineCount);
            }
        }
    }

    private tick() {
        this.timerSeconds += 1;
        if(this.timerSeconds === 60) {
            this.timerMinutes += 1;
            this.timerSeconds = 0;
        }
        // Make minutes and seconds 2 digit numbers (add 0 to front if it's smaller than 10)
        this.timerElement.innerText = `${this.timerMinutes < 10 ? 0 : ''}${this.timerMinutes}:${this.timerSeconds < 10 ? 0 : ''}${this.timerSeconds}`;
    }

    private addClick() {
        this.clicks += 1;
        this.clickCounterElement.innerText = `${this.clicks}`;

        // Starting game
        if(this.clicks === 1) {
            this.timerInterval = window.setInterval(() => this.tick(), 1000);
        }
    }

    private checkWin() {
        if(this.uncovered === this.fieldsCount - this.mineFields.length) {
            this.showAllMineFields();
            this.stop();
            this.onWin(this.timerSeconds, this.timerMinutes, this.clicks);
        }
    }

    private stop() {
        this.stopped = true;
        clearInterval(this.timerInterval);
    }

    private onFieldLeftClick(field: Field) {
        if(field.isCovered()) {
            this.addClick();
            field.uncover();
            if(field.hasMine()) {
                this.showAllMineFields();
                this.stop();
                this.onExplosion();
                return;
            } else if(field.surroundingMineCount === 0) {
                this.uncovered += 1;
                this.uncovered += field.uncoverSurroundingFields();
            }
            this.checkWin();
        }
    }

    private onFieldRightClick(field: Field) {
        if(field.isCovered()) {
            if(!field.isFlagged()) {
                field.flag();
            } else {
                field.removeFlag();
            }
        }
    }

    private createBoard() {
        const tableElement = document.createElement('table');
        tableElement.id = 'game';

        for(const fieldsRow of this.fields) {
            const rowElement = document.createElement('tr');
            for(const field of fieldsRow) {
                rowElement.appendChild(field.parentElement);
            }
            tableElement.appendChild(rowElement);
        }

        this.targetElement.appendChild(tableElement);
    }
}
