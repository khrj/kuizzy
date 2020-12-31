const socket = io()

let players = document.createElement("ul")

let loader = document.createElement("div")
loader.classList.add("loader")

socket.on('connected', async () => {
    swal({
        title: "Players:",
        button: "Start",
        content: players,
        closeOnClickOutside: false,
        closeOnEsc: false
    }).then(_ => {
        socket.emit("start")
        swal({
            title: "Waiting for players to answer",
            buttons: false,
            content: loader,
            closeOnClickOutside: false,
            closeOnEsc: false
        })
    })
})

socket.on("timeUp", async (scores) => {
    let scoreDisplay = document.createElement("ul")

    swal({
        title: "Leaderboard:",
        button: "Next",
        content: scoreDisplay,
        closeOnClickOutside: false,
        closeOnEsc: false
    }).then(_ => {
        socket.emit("next")
        swal({
            title: "Waiting for players to answer",
            buttons: false,
            content: loader,
            closeOnClickOutside: false,
            closeOnEsc: false
        })
    })

    for ([player, score] of scores) {
        scoreDisplay.innerHTML += `<li>${player}: ${score}</li>`
    }
})

socket.on('name', async (name) => {
    players.innerHTML += `<li>${name}</li>`
})

socket.on("gameover", async (leaderboard) => {
    let leaderboardDisplay = document.createElement("ul")
    for (player of leaderboard) {
        leaderboardDisplay.innerHTML += `<li>${player[0]}: ${player[1]}</li>`
    }
    swal({
        title: "Game over!",
        icon: "info",
        content: leaderboardDisplay,
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false
    })
})