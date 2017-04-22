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
const DELAY = 30; // seconds
function pollGames(onPollDone) {
    return __awaiter(this, void 0, void 0, function* () {
        //console.log("polling...")
        let keepTrying = true;
        let newBatch = [];
        while (keepTrying) {
            try {
                const games = yield loadPage(pageNr++);
                //console.log("page",games.length)
                games.forEach(game => newBatch.push(game));
                keepTrying = (games.length > 0);
            }
            catch (e) {
                //console.debug("Stopped.", e)
            }
        }
        newBatch = newBatch.filter(newGame => !list.find(oldGame => newGame.id === oldGame.id));
        yield onPollDone(newBatch);
        // reset
        pageNr = 1;
        yield waitForSeconds(DELAY);
        if (polling) {
            pollGames(onPollDone);
        }
    });
}
function loadPage(pageNumber) {
    //console.log("loading page "+pageNumber)
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", `${BASE_URL}?url=${gamesURL}?page=${pageNumber}`, true);
        xhr.timeout = 5000;
        xhr.addEventListener("load", (e) => {
            let responseText = e.target.response;
            if (e.target.status != 200) {
                reject({ message: "Not 200 OK", statusCode: e.target.status });
                return;
            }
            let responseJson = JSON.parse(responseText);
            if (responseJson.submissions instanceof Array) {
                //console.log("Resolve page ", responseJson.submissions.map(item => item.game).length)
                resolve(responseJson.submissions.map(item => item.game));
            }
            else {
                resolve([]);
                //console.info({message: "Stopped. invalid submissions", responseJson})
            }
        });
        xhr.send();
    });
}
function render(text) {
    let root = document.getElementById("games");
    root.innerHTML = text;
}
function waitForSeconds(seconds) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}
function onPollDone(games) {
    return __awaiter(this, void 0, void 0, function* () {
        let isFirstRun = (list.length === 0);
        if (!isFirstRun) {
            yield scrollGames(10, games);
        }
        games.forEach(game => list.push(game));
        render(`${list.length} games.`);
    });
}
function scrollGames(delay, games) {
    return __awaiter(this, void 0, void 0, function* () {
        //console.log(games)
        let i = 0;
        let game;
        while (game = games[i++]) {
            //console.log("render", game.title)
            render(game.title);
            yield waitForSeconds(delay);
        }
        yield waitForSeconds(delay);
        render(`${list.length} games.`);
    });
}
onPollDone([]);
pollGames(onPollDone);
//# sourceMappingURL=games.js.map