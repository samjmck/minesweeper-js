import { Game } from "./app/Game.js";

// Default settings
let rows = 10;
let columns = 10;
let mines = 10;

const mainElement = document.getElementById('main');
const timerElement = document.getElementById('timer');
const clicksElement = document.getElementById('clicks');
const rowsInputElement = <HTMLInputElement> document.getElementById('rows');
const columnsInputElement = <HTMLInputElement> document.getElementById('columns');
const minesInputElement = <HTMLInputElement> document.getElementById('mines');
const updateElement = document.getElementById('update');
const restartElement = document.getElementById('restart');

const game = new Game(
    mainElement,
    timerElement,
    clicksElement,
    onWin,
    onExplosion,
);

function onWin(timerSeconds: number, timerMinutes: number, clicks: number) {
    alert(`Congratulations, you won! You were able to finish the game in ${timerMinutes} minutes and ${timerSeconds} seconds with ${clicks} clicks.`);
}

function onExplosion() { }

if(hasVisitedBefore()) {
    [rows, columns, mines] = getLocalStorageSettings();
} else {
    // Save default settings
    updateLocalStorageSettings(rows, columns, mines);
    window.localStorage.setItem('has-visited-before', 'true');
}

game.start(rows, columns, mines);
updateInputElementsValues(rows, columns, mines);

updateElement.addEventListener('click', () => {
    [rows, columns, mines] = getInputElementsValues();

    try {
        game.start(rows, columns, mines);
        updateLocalStorageSettings(rows, columns, mines);
    } catch(error) {
        alert(error);
    }
});

restartElement.addEventListener('click', () => {
   game.start(rows, columns, mines);
});

function hasVisitedBefore() {
    return window.localStorage.getItem('has-visited-before') !== null;
}

function getLocalStorageSettings(): [number, number, number] {
    return [
        Number(window.localStorage.getItem('rows')),
        Number(window.localStorage.getItem('columns')),
        Number(window.localStorage.getItem('mines')),
    ];
}

function updateLocalStorageSettings(rows: number, columns: number, mines: number) {
    window.localStorage.setItem('rows', String(rows));
    window.localStorage.setItem('columns', String(columns));
    window.localStorage.setItem('mines', String(mines));
}

function getInputElementsValues(): [number, number, number] {
    return [
        Number(rowsInputElement.value),
        Number(columnsInputElement.value),
        Number(minesInputElement.value),
    ];
}

function updateInputElementsValues(rows: number, columns: number, mines: number) {
    rowsInputElement.value = String(rows);
    columnsInputElement.value = String(columns);
    minesInputElement.value = String(mines);
}
