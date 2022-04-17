const Task = require('../models/task')
const express = require('express')
const auth = require('../middleware/auth')
const router = new express.Router()


router.post('/tasks', auth,async (req, res)=>{
    const task = new Task({
        ...req.body, 
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e.message)
    }
})
// /tasks?completed=true
// /tasks?limit=10&sort=20
// /tasks?sortBy=createdTime:desc
router.get('/tasks', auth, async (req, res) => {
    let completed = req.query.completed
    if (!completed) {
        completed = [true, false]
    }
    let sort = {}
    if (req.query.sortBy) {
        let parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        let tasks = await Task.find({owner: req.user._id, completed}, null, {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
        })
        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        let _id = req.params.id
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    let updates = Object.keys(req.body)
    let allowedUpdates = ['description', 'completed']
    let isValid = updates.every(update => allowedUpdates.includes(update))
    if (!isValid) {
        return res.status(400).send({error: "invalid update"})
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }

        updates.forEach(e => task[e] = req.body[e])
        await task.save()

        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner:req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router