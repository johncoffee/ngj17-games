const gamesURL = 'https://itch.io/api/1/48nK4G3JXgZWEZuK42y118oW8FDq7rUJ67EyJ67e/jams/4069/submissions'
const BASE_URL = 'https://sam-api-1337.appspot.com/ngj17'
const list:ItchSubmission[] = []
let polling = true
let pageNr = 1
const DELAY = 30 // seconds

type ItchResponse = {
  page: number,
  submissions: {
    game: ItchSubmission[]
  }[]
}
type ItchSubmission = {
  id: number,
  title: string,
  url: string
}

async function pollGames(onPollDone:Function) {
  //console.log("polling...")
  let keepTrying = true
  let newBatch:ItchSubmission[] = []
  while (keepTrying) {
    try {
      const games = await loadPage(pageNr++)
      //console.log("page",games.length)
      games.forEach(game => newBatch.push(game))
      keepTrying = (games.length > 0)
    }
    catch (e) {
      //console.debug("Stopped.", e)
    }
  }

  newBatch = newBatch.filter(newGame => !list.find(oldGame => newGame.id === oldGame.id))
  await onPollDone(newBatch)
  // reset
  pageNr = 1
  await waitForSeconds(DELAY)
  if (polling) {
    pollGames(onPollDone)
  }
}

function loadPage(pageNumber:Number):Promise<ItchSubmission[]> {
  //console.log("loading page "+pageNumber)
  return new Promise( (resolve, reject) => {
    let xhr:XMLHttpRequest = new XMLHttpRequest()
    xhr.open("GET", `${BASE_URL}?url=${gamesURL}?page=${pageNumber}`, true)
    xhr.timeout = 5000

    xhr.addEventListener("load", (e:any) => {
      let responseText:string = e.target.response

      if (e.target.status != 200) {
        reject({message: "Not 200 OK", statusCode: e.target.status})
        return
      }

      let responseJson:ItchResponse = JSON.parse(responseText) as ItchResponse

      if (responseJson.submissions instanceof Array) {
        //console.log("Resolve page ", responseJson.submissions.map(item => item.game).length)
        resolve( responseJson.submissions.map(item => item.game) )
      }
      else {
        resolve([])
        //console.info({message: "Stopped. invalid submissions", responseJson})
      }
    })
    xhr.send()
  })
}


function render(text:string) {
  let root:HTMLElement = document.getElementById("games")
  root.innerHTML = text
}

function waitForSeconds(seconds:number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, seconds * 1000)
  })
}

async function onPollDone(games:ItchSubmission[]) {
  let isFirstRun = (list.length === 0)

  if (!isFirstRun) {
    await scrollGames(10, games)
  }

  games.forEach(game => list.push(game))
  render(`${list.length} games.`)
}

async function scrollGames(delay:number, games:ItchSubmission[]) {
  //console.log(games)
  let i:number = 0
  let game
  while (game = games[i++]) {
    //console.log("render", game.title)
    render(game.title)
    await waitForSeconds(delay)
  }

  await waitForSeconds(delay)
  render(`${list.length} games.`)
}

onPollDone([])
pollGames(onPollDone)


