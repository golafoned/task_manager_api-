const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcome, sendBie } = require('../emails/account')
let upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            return cb(new Error('file must be pic'))
        }
        cb(undefined, true)
    }
})



router.post('/users', async (req, res)=>{
    let user = new User(req.body)

    try {
        await user.save()
        sendWelcome(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})

    } catch (error) {
         res.status(400).send(error)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        console.log(req.user.tokens)
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
    try {
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/:id', async (req, res) => {
    try {
        let user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(500).send()
    }

})

router.patch('/users/me', auth, async (req, res) => {
    let updates = Object.keys(req.body)
    let allowedUpdates = ['name', 'email', 'password','age']
    let isValid = updates.every(update => allowedUpdates.includes(update))
    if (!isValid) {
        return res.status(400).send({error: "invalid update"})
    }
    try {
        const user = req.user
        updates.forEach(e => user[e] = req.body[e])
        await user.save()
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth ,async (req, res) => {
    try {
        await req.user.deleteWithRoots()
        sendBie(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send('oki doki')
}, (err, req, res, next) => {
    res.status(400).send({error:err.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send('pic has been deteted')
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        let user = await User.findById(req.params.id)
        if (!user) {
            throw Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router