// must be white listed sam-api-1337.appspot.com
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const gamesURL = 'https://itch.io/api/1/48nK4G3JXgZWEZuK42y118oW8FDq7rUJ67EyJ67e/jams/4069/submissions';
const BASE_URL = 'https://sam-api-1337.appspot.com/ngj17';
const list = [];
let polling = true;
let pageNr = 1;
const DELAY = 60; // seconds
function pollGames(onPollDone) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("polling...");
        let keepTrying = true;
        while (keepTrying) {
            try {
                const games = yield loadPage(pageNr++);
                games.forEach(game => list.push(game));
            }
            catch (e) {
                console.log("Stopped.", e);
                keepTrying = false;
            }
        }
        onPollDone();
        // reset
        list.length = 0;
        pageNr = 1;
        yield waitForSeconds(DELAY);
        if (polling) {
            pollGames(onPollDone);
        }
    });
}
function loadPage(pageNumber) {
    console.log("loading page " + pageNumber);
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", `${BASE_URL}?url=${gamesURL}?page=${pageNumber}`, true);
        xhr.addEventListener("load", (e) => __awaiter(this, void 0, void 0, function* () {
            let responseText = e.target.response;
            if (!e.target.status || e.target.status != 200) {
                reject({ message: "Not 200 OK" });
                return;
            }
            let responseJson = JSON.parse(responseText);
            if (responseJson.submissions instanceof Array == false) {
                reject({ message: "invalid submissions", responseJson });
            }
            console.log("count " + responseJson.submissions.length);
            resolve(responseJson.submissions);
        }));
        xhr.send();
    });
}
function render(root) {
    root.innerHTML = `${list.length} games.`;
}
function waitForSeconds(seconds) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}
function onPollDone() {
    render(document.getElementById("games"));
}
onPollDone();
pollGames(onPollDone);
//# sourceMappingURL=games.js.map