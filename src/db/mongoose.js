const mongoose = require('mongoose')
mongoose.connect(process.env.MONGOBD_URL, {
    useNewUrlParser: true, 
    // useCreateIndex: true
})
