const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridAPIKey)



const sendWelcome = (email, name) => {
    sgMail.send({
        to: email,
        from: 'obemasss@gmail.com',
        subject: 'thnx for joning!',
        html: `<p style="color:#fcba03">Welcome ${name}</p>'`})
}

const sendBie = (email, name) => {
    sgMail.send({
        to: email,
        from: 'obemasss@gmail.com',
        subject: 'bie',
        html: `<p style="color:#30267a">Bie ${name}</p>'`})
}


module.exports = {
    sendWelcome,
    sendBie
}