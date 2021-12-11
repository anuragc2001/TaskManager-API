const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const Multer = require('multer')
const Sharp = require('sharp')
const router = new express.Router()


router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send("An error has occurred :(")
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.put('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const upload = Multer({
    limits: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("File must be a PDF"))
        }
        cb(undefined, true)
    }
})


router.post('/users/me/avatar', auth, upload.single("avatar"), async (req, res) => {
    const buffer = await Sharp(req.file.buffer).resize({ width: 200, height: 200 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send("File Uploaded Successfully!!!")
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete("/users/me/avatar", auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send("Avatar deleted Successfully!!!")
    } catch (e) {
        res.status(400).send({ e: e.message })
    }
})

router.get("/users/me/avatar", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set("Content-Type", "image/png")
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send(error.message)
    }
})



module.exports = router