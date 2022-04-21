const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {    
    userOneId,
    userOne,
    setupDB
} = require('./fixtures/db')

beforeAll(setupDB)

test('should sign up new user', async () => {
    let response = await request(app).post('/users').send({
        name: 'Andrew',
        email: 'bjfranklin@gmail.com',
        password: 'everside01!'
    }).expect(201)

    let user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    expect(response.body.user).toMatchObject({
        name: 'Andrew',
        email: 'bjfranklin@gmail.com'
    })
})


test('should login', async () => {
    let response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    let user = await User.findById(userOne._id)
    expect(user).not.toBeNull()
    expect(response.body.token).toBe(user.tokens[1].token)

})

test('should not login non-existing user', async () => {
    await request(app).post('/users/login').send({
        email: 'aamad@fau.com',
        password: userOne.password
    }).expect(400)
})

test('get profile from user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('not get profile from unauth user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('upload avatar', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/1.jpg')
        .expect(200)
    let user = await User.findById(userOne._id)
    expect(user).not.toBeNull()
    expect(user.avatar).toEqual(expect.any(Buffer))

})
test('upload update fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ name: 'Ave Maria'})
        .expect(200)
    let user = await User.findById(userOne._id)
    expect(user).not.toBeNull()
    expect(user.name).toBe('Ave Maria')
    
})

test('not upload update invalid fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ location: 'Ave Maria'})
        .expect(400)
})

test('delete profile from user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    let user = await User.findById(userOne._id)
    expect(user).toBeNull()
})

test('not delete profile from unauth user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)

})

