const jwt = require('jsonwebtoken')
const request = require('supertest')

const { app, server } = require('../app/server')
const db = require('../app/models')

const User = db.User
const basePath = '/auth'

const dummyUser = {
  name: 'foo',
  email: 'foo@email.com',
  password: 'foofoo',
  confirmPassword: 'foofoo',
}

describe('users (auth)', () => {
  beforeEach((done) => {
    User.destroy({ truncate: true }).then(() => done())
  })

  afterAll(() => {
    server.close()
  })

  describe(`POST ${basePath}/register`, () => {
    test('A valid user should be created', (done) => {
      request(app)
        .post(`${basePath}/register`)
        .send(dummyUser)
        .end((err, res) => {
          expect(res.status).toBe(201)
          expect(res.body.token).toBeDefined()

          User.findAll({ where: { email: dummyUser.email } })
            .then((users) => {

              const [user] = users
              expect(user.name).toBe(dummyUser.name)
              expect(user.email).toBe(dummyUser.email)
              expect(user.verifyPassword(dummyUser.password)).toBeTruthy()
              done()
            })
            .catch((err) => {
              done(err)
            })
        })
    })

    test('Creating a user with an email already registered should fail', (done) => {
      const user = User.build(dummyUser)
      user.setPassword(dummyUser.password)

      user
        .save()
        .then(() => {
          request(app)
            .post(`${basePath}/register`)
            .send(dummyUser)
            .end((err, res) => {
              expect(res.status).toBe(409)
              expect(res.body.message).toBeDefined()
              expect(res.text.includes('email')).toBeTruthy()
              done()
            })
        })
        .catch((err) => {
          done(err)
        })
    })

    test('If the passwords do not match, the user should not be created', (done) => {
      request(app)
        .post(`${basePath}/register`)
        .send({
          ...dummyUser,
          confirmPassword: 'foo',
        })
        .end((err, res) => {
          expect(res.status).toBe(400)
          expect(res.body).toBeInstanceOf(Array)
          expect(res.body).toHaveLength(1)
          expect(res.text.includes('confirmPassword')).toBeTruthy()
          done()
        })
    })

    test('A user with an invalid email should not be created', (done) => {
      request(app)
        .post(`${basePath}/register`)
        .send({
          ...dummyUser,
          email: '@email.com',
        })
        .end((err, res) => {
          expect(res.status).toBe(400)
          expect(res.body).toBeInstanceOf(Array)
          expect(res.body).toHaveLength(1)
          expect(res.text.includes('email')).toBeTruthy()
          done()
        })
    })

    test('The email must be stored in lowercase', (done) => {
      request(app)
        .post(`${basePath}/register`)
        .send({
          ...dummyUser,
          email: dummyUser.email.toUpperCase(),
        })
        .end((err, res) => {
          expect(res.status).toBe(201)
          expect(res.body.token).toBeDefined()

          User.findAll({ where: { email: dummyUser.email } })
            .then((users) => {

              const [user] = users
              expect(user.email).toBe(dummyUser.email)
              done()
            })
            .catch((err) => {
              done(err)
            })
        })
    })
  })

  describe(`POST ${basePath}/login`, () => {
    test('Login with correct credentials, returns a token', (done) => {
      const user = User.build(dummyUser)
      user.setPassword(dummyUser.password)

      user
        .save()
        .then((newUser) => {
          request(app)
            .post(`${basePath}/login`)
            .send({
              email: dummyUser.email,
              password: dummyUser.password,
            })
            .end((err, res) => {
              expect(res.status).toBe(200)
              expect(res.body.token).toEqual(newUser.generateJwt())
              done()
            })
        })
        .catch((err) => {
          done(err)
        })
    })

    test('Login with wrong credentials [email]', (done) => {
      const user = User.build(dummyUser)
      user.setPassword(dummyUser.password)

      user
        .save()
        .then(() => {
          request(app)
            .post(`${basePath}/login`)
            .send({
              email: 'bar@email.com',
              password: dummyUser.password,
            })
            .end((err, res) => {
              expect(res.status).toBe(400)
              expect(res.body.message).toBeDefined()
              done()
            })
        })
        .catch((err) => {
          done(err)
        })
    })

    test('Login with wrong credentials [password]', (done) => {
      const user = User.build(dummyUser)
      user.setPassword(dummyUser.password)

      user
        .save()
        .then(() => {
          request(app)
            .post(`${basePath}/login`)
            .send({
              email: dummyUser.email,
              password: 'qwerty',
            })
            .end((err, res) => {
              expect(res.status).toBe(400)
              expect(res.body.message).toBeDefined()
              done()
            })
        })
        .catch((err) => {
          done(err)
        })
    })

    test('When logging in, email is not case sensitive', (done) => {
      const user = User.build(dummyUser)
      user.setPassword(dummyUser.password)

      user
        .save()
        .then((newUser) => {
          request(app)
            .post(`${basePath}/login`)
            .send({
              email: dummyUser.email.toUpperCase(),
              password: dummyUser.password,
            })
            .end((err, res) => {
              expect(res.status).toBe(200)
              expect(res.body.token).toEqual(newUser.generateJwt())
              done()
            })
        })
        .catch((err) => {
          done(err)
        })
    })

    test('Login without password, returns a status 400', (done) => {
      request(app)
        .post(`${basePath}/login`)
        .send({ email: 'foo@email.com' })
        .end((err, res) => {
          expect(res.status).toBe(400)
          expect(res.body).toBeInstanceOf(Array)
          expect(res.body).toHaveLength(1)
          done()
        })
    })

    test('Login without email, returns a status 400', (done) => {
      request(app)
        .post(`${basePath}/login`)
        .send({ password: 'secret' })
        .end((err, res) => {
          expect(res.status).toBe(400)
          expect(res.body).toBeInstanceOf(Array)
          expect(res.body).toHaveLength(1)
          done()
        })
    })
  })

  test('Check password', () => {
    const user = User.build(dummyUser)
    user.setPassword(dummyUser.password)

    expect(user.verifyPassword(dummyUser.password)).toBeTruthy()
    expect(user.verifyPassword('secret')).toBeFalsy()
  })

  test('JWT', () => {
    const user = User.build(dummyUser)
    const token = user.generateJwt()
    const decoded = jwt.verify(token, process.env.JWT_SECRET||'jwtsecret')

    expect(decoded.email).toBe(user.email)
    expect(() => jwt.verify(token, 'qwerty')).toThrow(jwt.JsonWebTokenError)
  })
})
