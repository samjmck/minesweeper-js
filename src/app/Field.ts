export enum FieldState {
    Covered = 'covered',
    Uncovered = 'uncovered',
    Flagged = 'flagged',
}

export enum FieldContent {
    Empty = 'empty',
    Mine = 'mine',
}

export class Field {
    private content: FieldContent = FieldContent.Empty;
    private surroundingFields: Field[] = [];
    state = FieldState.Covered;
    surroundingMineCount = 0;
    parentElement: HTMLTableDataCellElement;

    private surroundingMineCountElement: HTMLDivElement;

    constructor(
        content: FieldContent,
        onClick: (event: MouseEvent) => void,
        onRightClick: (event: MouseEvent) => void,
    ) {
        this.parentElement = document.createElement('td');
        this.parentElement.innerHTML = `
            <div class="field-content">
                <div class="surrounding-mine-count"></div>
                <img class="mine" alt="Mine" src="assets/mine.png" />
            </div>
            <img class="flag" alt="Flag" src="assets/flag.png" />
        `;
        this.parentElement.addEventListener('click', onClick);
        this.parentElement.addEventListener('contextmenu', onRightClick);
        this.parentElement.dataset.state = this.state;

        this.setContent(content);

        this.surroundingMineCountElement = <HTMLDivElement> this.parentElement.getElementsByClassName('surrounding-mine-count')[0];
    }

    initialise(surroundingFields: Field[], surroundingMineCount: number) {
        this.surroundingFields = surroundingFields;
        const surroundingMineCountString = String(surroundingMineCount);
        this.parentElement.dataset.surroundingMineCount = surroundingMineCountString;
        this.surroundingMineCountElement.innerText = surroundingMineCountString;
        this.surroundingMineCount = surroundingMineCount;
    }

    // Returns number of fields uncovered
    uncoverSurroundingFields(): number {
        let uncovered = 0;
        for(const surroundingField of this.surroundingFields) {
            if(surroundingField.isCovered() && !surroundingField.isFlagged() && !surroundingField.hasMine()) {
                surroundingField.uncover();
                uncovered += 1;
                if(surroundingField.surroundingMineCount === 0) {
                    uncovered += surroundingField.uncoverSurroundingFields();
                }
            }
        }
        return uncovered;
    }

    setState(state: FieldState) {
        this.state = state;
        // dataset.state is for the CSS styles, it is not used for the logic in the code
        this.parentElement.dataset.state = state;
    }

    setContent(content: FieldContent) {
        this.content = content;
        this.parentElement.dataset.content = content;
    }

    uncover() {
        this.setState(FieldState.Uncovered);
    }

    flag() {
        this.setState(FieldState.Flagged);
    }

    removeFlag() {
        this.setState(FieldState.Covered);
    }

    // Helper functions

    isCovered() {
        return this.state !== FieldState.Uncovered;
    }

    isFlagged() {
        return this.state === FieldState.Flagged;
    }

    hasMine() {
        return this.content === FieldContent.Mine;
    }
}
