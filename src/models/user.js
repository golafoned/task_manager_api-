const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt =  require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true, 
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Must be positive age')
            }
        }
    },
    password: {
        type: String,
        validate(password) {
            if (password.length<7) {
                throw new Error('Password must has 6 or more letters')
            }
        },
        required: true,
        trim: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne( {email} )
    if (!user) {
        return new Error('No User')
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        return new Error('Wrong Pasword')
    }

    return user
}

userSchema.pre('save', async function(next) {
    const user = this
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    let token = jwt.sign({_id:user._id.toString()}, 'scarythings', {expiresIn: '7d'})
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.tokens
    delete userObject.password
    delete userObject._id
    delete userObject.__v
    delete userObject.avatar
    return userObject
}
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// Delete  user tasks 

userSchema.methods.deleteWithRoots = async function () {
    let user = this
    await User.deleteOne({_id:user._id.valueOf()})
    await Task.deleteMany({owner:user._id.valueOf()})
}

const User = mongoose.model('User', userSchema)
module.exports = User