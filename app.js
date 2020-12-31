const { createSocket } = require('dgram')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const events = require('events')
const timeUpEvent = new events.EventEmitter()

const questions = [
    {
        text: "In Spain, people eat 12 ____ right before midnight. One for each bell strike.",
        time: 5,
        answers: [
            "olives",
            "tapas",
            "grapes",
            "pieces of bread"
        ],
        correctAnswer: "grapes"
    },
    {
        text: "Which country has a giant hour glass wheel that needs to be turned on its head at midnight?",
        time: 10,
        answers: [
            "Hungary",
            "Romania",
            "Belgium",
            "Switzerland"
        ],
        correctAnswer: "Hungary"
    },
    {
        text: "In Belgium, kids prepare ______ in school for their grandparents and godparents.",
        time: 10,
        answers: [
            "small gifts",
            "party crowns and hats",
            "songs",
            "New Year's letters"
        ],
        correctAnswer: "New Year's letters"
    },
    {
        text: "Which country calls New Year's Eve Hogmanay?",
        time: 10,
        answers: [
            "Ireland",
            "Scotland",
            "Greenland",
            "England"
        ],
        correctAnswer: "Scotland"
    },
    {
        text: "People in Finland predict what'll happen in the new year by _______.",
        time: 10,
        answers: [
            "reading tea leaves",
            "reading palms",
            "casting molten tin into water and interpreting the shape",
            "visiting fortune tellers"
        ],
        correctAnswer: "casting molten tin into water and interpreting the shape"
    },
    {
        text: "What is baked into sweets as a good luck token in Bolivia?",
        time: 10,
        answers: [
            "Pomegranate seeds",
            "Grapes",
            "Almonds",
            "Coins"
        ],
        correctAnswer: "Coins"
    },
    {
        text: "In which city in the U.S. do millions of people gather to watch the ball drop at midnight?",
        time: 10,
        answers: [
            "New York City, NY",
            "Washington, D.C.",
            "Austin, TX",
            "Dallas, TX"
        ],
        correctAnswer: "New York City, NY"
    },
    {
        text: "In Russia, people write down wishes on paper. What do they do with them afterwards?",
        time: 10,
        answers: [
            "Put them in a jar and keep it closed for a year.",
            "Burn them, throw it in a Champagne glass and drink it.",
            "Burn them in the fire place.",
            "Tie them to balloons and let them fly away."
        ],
        correctAnswer: "Burn them, throw it in a Champagne glass and drink it."
    },
    {
        text: "People in Colombia believe that _____ will increase their chances to travel in the new year.",
        time: 10,
        answers: [
            "packing their suitcases by midnight",
            "making a wish on their passports",
            "buying a new suitcase by midnight",
            "running around the block with their suitcases"
        ],
        correctAnswer: "running around the block with their suitcases"
    },
    {
        text: "Why do Ecuadorians burn homemade puppets at midnight?",
        time: 10,
        answers: [
            "It's a replacement for fireworks, as those are illegal.",
            "To burn away the old year and start with a clean slate.",
            "They believe puppets are evil.",
            "To protect themselves against spirits."
        ],
        correctAnswer: "To burn away the old year and start with a clean slate."
    },
]

let userPointsMap = {
    /*
    SOCKETID: ["<PLAYERNAME>", POINTS]
    Example -- 
    dfwaogruhdslfsdljf: ["Khushraj", 0]
    */
}

io.on('connection', (socket) => {
    let attempt = ""

    console.log('A user connected')
    socket.emit('connected')
    socket.once("name", (name) => {
        userPointsMap[socket.id] = [name, 0]
        io.emit("name", name)
    })

    socket.once("start", async () => {
        for (const question of questions) {
            await new Promise(async (resolve) => {
                const toSend = { ...question }

                setTimeout(() => {
                    timeUpEvent.emit("timeUp", question.correctAnswer)
                    const sortedValues = Object.values(userPointsMap).sort(([, a], [, b]) => b - a)
                    const top5 = sortedValues.slice(0, 5)

                    io.emit("timeUp", top5)

                    socket.once("next", () => {
                        resolve()
                    })
                }, question.time * 1000)

                delete toSend.correctAnswer
                io.emit('question', toSend)
            })
        }
        const sortedValues = Object.values(userPointsMap).sort(([, a], [, b]) => b - a)
        io.emit("gameover", sortedValues)
        process.exit(0)
    })

    socket.on("answer", answer => {
        attempt = answer
    })

    timeUpEvent.on("timeUp", (correctAnswer) => {
        if (attempt) {
            if (attempt === correctAnswer) {
                userPointsMap[socket.id][1]++
                socket.emit("correct")
            } else {
                socket.emit("incorrect")
            }
            attempt = ""
        } else {
            socket.emit("noAnswer")
        }
    })
})

app.use(express.static('public'))
http.listen(3000, () => {
    console.log('listening on *:3000')
})