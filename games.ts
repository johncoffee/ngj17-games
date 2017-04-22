// must be white listed sam-api-1337.appspot.com

const gamesURL = 'https://itch.io/api/1/48nK4G3JXgZWEZuK42y118oW8FDq7rUJ67EyJ67e/jams/4069/submissions'
const BASE_URL = 'https://sam-api-1337.appspot.com/ngj17'
const list:ItchSubmission[] = []
let polling = true
let pageNr = 1
const DELAY = 60 // seconds

type ItchResponse = {
  page: number,
  submissions: ItchSubmission[]
}
type ItchSubmission = {
  id: number,
  url: string
}

async function pollGames(onPollDone:Function) {
  console.log("polling...")
  let keepTrying = true
  while (keepTrying) {
    try {
      const games = await loadPage(pageNr++)
      games.forEach(game => list.push(game))
    }
    catch (e) {
      console.log("Stopped.", e)
      keepTrying = false
    }
  }

  onPollDone()
  // reset
  list.length = 0
  pageNr = 1
  await waitForSeconds(DELAY)
  if (polling) {
    pollGames(onPollDone)
  }
}

function loadPage(pageNumber:Number):Promise<ItchSubmission[]> {
  console.log("loading page "+pageNumber)
  return new Promise( (resolve, reject) => {
    let xhr:XMLHttpRequest = new XMLHttpRequest()
    xhr.open("GET", `${BASE_URL}?url=${gamesURL}?page=${pageNumber}`, true)

    xhr.addEventListener("load", async (e:any) => {
      let responseText:string = e.target.response

      if (!e.target.status || e.target.status != 200) {
        reject({message: "Not 200 OK"})
        return
      }

      let responseJson:ItchResponse = JSON.parse(responseText) as ItchResponse

      if (responseJson.submissions instanceof Array == false) {
        reject({message: "invalid submissions", responseJson})
      }
      console.log("count " + responseJson.submissions.length)

      resolve(responseJson.submissions)
    })
    xhr.send()
  })
}


function render(root:HTMLElement) {
  root.innerHTML = `${list.length} games.`
}

function waitForSeconds(seconds:number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, seconds * 1000)
  })
}

function onPollDone() {
    render(document.getElementById("games"))
}
onPollDone()
pollGames(onPollDone)


