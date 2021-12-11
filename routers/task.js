const express = require('express')
const Task = require('../models/task')
const auth = require("../middleware/auth")
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/tasks', auth, async (req, res) => {

    const query = {
        limit: 0,
        skip: 0,
        sort: {}
    }

    const match = {
        ...query,
        limit: req.query.limit === undefined ? 0 : parseInt(req.query.limit),
        skip: req.query.skip === undefined ? 0 : parseInt(req.query.skip),
        sort: req.query.sortBy ? { [req.query.sortBy.split('_')[0]]: req.query.sortBy.split('_')[1] === 'desc' ? -1 : 1 } : {}
    }

    try {

        if (req.query.completed) {
            const tasks = await Task
                .find({ owner: req.user._id, completed: req.query.completed === 'true' })
                .limit(match.limit)
                .skip(match.skip)
                .sort(match.sort)
            res.send(tasks)
        } else {
            const tasks = await Task
                .find({ owner: req.user._id })
                .limit(match.limit)
                .skip(match.skip)
                .sort(match.sort)

            res.send(tasks)
        }
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.put('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()


        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            res.status(404).send()
        }
        res.send(task)
        await task.remove()
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router