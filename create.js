// From https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded Unicode,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}


function play() {
    const explanations = [
        document.getElementById("group-1-explanation").value,
        document.getElementById("group-2-explanation").value,
        document.getElementById("group-3-explanation").value,
        document.getElementById("group-4-explanation").value,
    ];
    const group_1 = [
        document.getElementById("group-1-word-1").value,
        document.getElementById("group-1-word-2").value,
        document.getElementById("group-1-word-3").value,
        document.getElementById("group-1-word-4").value,
    ];
    const group_2 = [
        document.getElementById("group-2-word-1").value,
        document.getElementById("group-2-word-2").value,
        document.getElementById("group-2-word-3").value,
        document.getElementById("group-2-word-4").value,
    ];
    const group_3 = [
        document.getElementById("group-3-word-1").value,
        document.getElementById("group-3-word-2").value,
        document.getElementById("group-3-word-3").value,
        document.getElementById("group-3-word-4").value,
    ];
    const group_4 = [
        document.getElementById("group-4-word-1").value,
        document.getElementById("group-4-word-2").value,
        document.getElementById("group-4-word-3").value,
        document.getElementById("group-4-word-4").value,
    ];
    const puzzle = {
        "groups": [group_1, group_2, group_3, group_4],
        "explanations": explanations,
    };
    const base_64 = b64EncodeUnicode(JSON.stringify(puzzle));
    console.log(base_64);
    const url = "index.html?p=" + base_64;
    window.open(url);
}

function setup() {
    document.getElementById("play-creation").onclick = play;
}

setup();
