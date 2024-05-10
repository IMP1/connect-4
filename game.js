// From https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}


const selected_words = new Set();
const selected_buttons = new Set();
let puzzle;
let solutions = 0;
let incorrect_guesses = 0;
let game_over = false;
const groups = [];

function select(button) {
    if (game_over) { return; }
    if (button.classList.contains("confirmed")){ return; }

    if (button.classList.contains("pressed")) {
        selected_words.delete(button.textContent);
        selected_buttons.delete(button);
    } else if (selected_words.size < 4) {
        selected_words.add(button.textContent);
        selected_buttons.add(button);
    } else {
        return;
    }
    button.classList.toggle("pressed");
    document.getElementById("submit").disabled = !(selected_words.size === 4);
    document.getElementById("deselect").disabled = !(selected_words.size > 0);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function fitText(outputElement){
    // max font size in pixels
    const maxFontSize = parseFloat(getComputedStyle(outputElement).fontSize);
    // get element's width
    let width = outputElement.clientWidth;
    // get content's width
    let contentWidth = outputElement.scrollWidth;
    // get fontSize
    let fontSize = parseInt(window.getComputedStyle(outputElement, null).getPropertyValue('font-size'),10);
    // if content's width is bigger then elements width - overflow
    if (contentWidth > width){
        fontSize = Math.ceil(fontSize * width/contentWidth,10);
        fontSize =  fontSize > maxFontSize  ? fontSize = maxFontSize  : fontSize - 1;
        outputElement.style.fontSize = fontSize+'px';   
    }
}


function setup() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (!urlParams.has('p')) {
        console.log("No puzzle given.");
        return
    }
    const puzzle_string = urlParams.get('p');
    const puzzle_json = b64DecodeUnicode(puzzle_string);
    
    puzzle = JSON.parse(puzzle_json);
    for (let i = 0; i < puzzle.groups.length; i ++) {
        groups.push(new Set(puzzle.groups[i]));
    }
    const words = puzzle.groups.flat();
    shuffle(words);

    const container = document.getElementById("game-grid");
    for (let i = 0; i < container.childElementCount; i ++) {
        let button = container.children[i];
        button.dataset.index = i
        button.addEventListener("click", function(event) {
            select(button);
        })
        button.textContent = words[i];
        fitText(button);
    }

    const answers = document.getElementById("answers");
    for (let i = 0; i < answers.childElementCount; i ++) {
        let answer = answers.children[i];
        answer.children[0].textContent = puzzle.explanations[i];
        answer.children[1].textContent = puzzle.groups[i].join(", ");
    }

    document.getElementById("deselect").disabled = true;
    document.getElementById("submit").disabled = true;
    document.getElementById("shuffle").onclick = shuffle_words;
    document.getElementById("deselect").onclick = deselect_words;
    document.getElementById("submit").onclick = submit_words;

}

function shuffle_words() {
    const container = document.getElementById("game-grid");
    const children = Array.from(container.children);
    const solved_words = children.slice(0, solutions*4);
    const unsolved_words = children.slice(solutions*4);

    container.replaceChildren(...solved_words.concat(shuffle(unsolved_words)));
}

function deselect_words() {
    const container = document.getElementById("game-grid");
    for (let i = 0; i < container.childElementCount; i ++) {
        let button = container.children[i];
        button.classList.remove("pressed");
    }
    selected_words.clear();
    selected_buttons.clear();
    document.getElementById("submit").disabled = true;
    document.getElementById("deselect").disabled = true;
}

function submit_words() {
    let group_match = -1;
    let one_away = false;
    for (let i = 0; i < groups.length; i ++) {
        const incorrect = groups[i].difference(selected_words);
        if (incorrect.size === 0) {
            group_match = i;
        } else if (incorrect.size === 1) {
            one_away = true;
        }
    }
    
    if (group_match >= 0) {
        correct_guess(group_match);
    } else {
        if (one_away) {
            set_message("One away!");
        }
        incorrect_guess();
    }
}

function incorrect_guess() {
    incorrect_guesses ++;
    const lives = document.getElementById("lives");
    lives.removeChild(lives.lastChild);
    if (incorrect_guesses === 3) {
        lose();
    }
}

function correct_guess(group_match) {
    set_message("Correct!");
    selected_buttons.forEach(function(btn) { 
        btn.classList.add("group-" + (group_match+1)); 
        btn.classList.add("confirmed"); 
        const grid = document.getElementById("game-grid");
        const idx = 4 * solutions;
        grid.insertBefore(btn, grid.children[idx]);
    });
    deselect_words();

    const answer = document.getElementById("answers").children[group_match];
    answer.classList.add("visible");
    const grid = document.getElementById("game-grid").getBoundingClientRect();
    const rect = document.getElementById("game-grid").children[0].getBoundingClientRect();
    const oy = rect.top;
    const h = rect.bottom - rect.top + 8;
    answer.style.top = (oy + ((h + 8) * solutions)) + "px";
    answer.style.left = (grid.left + 8) + "px";
    answer.style.width = (grid.right - grid.left - 16) + "px";
    answer.style.height = (h - 8) + "px";
    answer.classList.add("group-" + (group_match+1));
    fitText(answer.children[0]);
    fitText(answer.children[1]);

    solutions ++;
    if (solutions == 4) {
        win();
    }
}

function win() {
    game_over = true;
    // TODO: Reveal answers!
}

function lose() {
    game_over = true;
    set_message("You lose :(");
    deselect_words();
}

function set_message(text) {
    const message = document.getElementById("message");
    message.textContent = text;
    // Replay animation
    message.classList.remove("fading");
    message.classList.add("fading");
    message.style.animation = 'none';
    message.offsetHeight; // trigger reflow
    message.style.animation = null; 
}

setup();
