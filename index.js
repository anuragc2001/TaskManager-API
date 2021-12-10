const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000

// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled')
//     } else {
//         next()
//     }
// })

// app.use((req, res, next) => {
//     res.status(503).send('Site is currently down. Check back soon!')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


const Task = require('./models/task')
const User = require('./models/user')

async function main() {
    const task = await Task.findById('61b30a01c10d27b6e555e06b').populate('owner').exec()
    console.log(task)
}
async function man() {
    const user = await User.findById('61b30854e30d34273f762845').populate('task').exec()
    console.log(user.task)
}
// main()
man()

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
