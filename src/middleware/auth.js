const User = require('../models/user')
const jwt = require('jsonwebtoken')
const auth = async (req, res, next) => {
    try {
        let token = req.header('Authorization').replace('Bearer ', '')
        let decoded = jwt.verify(token, process.env.JSW_TOKEN)
        const user = await User.findOne({_id: decoded._id, 'tokens.token':token})
        if (!user) {
            throw new Error()
        }
        req.token = token
        req.user = user
        req._id = user._id
        next()
    } catch {
        res.status(401).send({error: 'Pls Authrize'})
    }
}

module.exports = auth