const request = require('supertest')
const Task = require('../src/models/task')
const User = require('../src/models/user')
const app = require('../src/app')
const {    
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDB
} = require('./fixtures/db')

beforeAll(setupDB)

test('create new task', async () => {
    let res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send( {description: 'All Right'} )
        .expect(201)
    let task = await Task.findById(res.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})


test("get all userOne's tasks", async () => {
    let res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200)
    expect(res.body.length).toBe(3)

    console.log(res.body)
})

test("fail to delete stranger's task", async () => {
    let res = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .expect(404)
})

test("delete own task", async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200)
})