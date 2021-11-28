const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Blog = require('../models/blog')

const newUserToken = async () => {
  await api
    .post('/api/users')
    .send(helper.user)
  const loginUser = await api
    .post('/api/login')
    .send(helper.user)
  return loginUser.body.token
}


beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.listWithManyBlogs)
})

describe('Initially, some blogs are saved', () => {
  test('blogs are returned as JSON', async () => {

    const token = await newUserToken()
    await api
      .get('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }, 100000)

  test('all blogs are returned', async () => {
    const token = await newUserToken()
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `bearer ${token}`)

    expect(response.body).toHaveLength(helper.listWithManyBlogs.length)
  })

  test('unique identifier is named id', async () => {
    const token = await newUserToken()
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `bearer ${token}`)

    response.body.forEach(blog => {
      expect(blog.id).toBeDefined()
    })
  })
})

describe('Viewing a specific blog', () => {
  test('A specific blog can be viewed', async () => {
    const token = await newUserToken()
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
    expect(resultBlog.body).toEqual(processedBlogToView)
  })

  test('If blog does not exist, send 404', async () => {
    const validNonExistingId = await helper.nonExistingId()
    const token = await newUserToken()
    await api
      .get(`/api/blogs/${validNonExistingId}`)
      .set('Authorization', `bearer ${token}`)
      .expect(404)
  })

  test('If id is not valid, send 400', async () => {
    const invalidId = '5a3d5da59070081a82a3445'
    const token = await newUserToken()
    await api
      .get(`/api/blogs/${invalidId}`)
      .set('Authorization', `bearer ${token}`)
      .expect(400)
  })
})

describe('Addition of a new blog', () => {
  test('blog is successfully added to mongodb', async () => {
    const newBlog = {
      title: 'Breaking Ice',
      author: 'Mike Vasovsky',
      url: 'www.mikey.com',
      likes: 14,
    }

    const token = await newUserToken()
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.listWithManyBlogs.length + 1)

    const contents = blogsAtEnd.map(b => b.title)
    expect(contents).toContain(
      'Breaking Ice'
    )
  })

  test('addition fails without token', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const newBlog = {
      title: 'Having a Laugh',
      author: 'Bob Sandy',
      url: 'www.sandy.com',
      likes: 4,
    }

    await api
      .post('/api/blogs')
      //.set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)

  })

  test('if likes are missing during POST, default to 0', async () => {
    const newBlog = {
      title: 'The New Blog',
      author: 'Jordan Jenkins',
      url: 'www.jordan.com',
    }

    const token = await newUserToken()

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const blogLikes = blogsAtEnd.map(b => b.likes)
    expect(blogLikes.at(-1)).toBe(0)
  })

  test('a blog with missing title is not added', async () => {
    const newBlog = {
      author: 'Jordan Jenkins',
      url: 'myurl.com',
      likes: 55,
    }

    const token = await newUserToken()

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.listWithManyBlogs.length)
  })

  test('a blog with missing url is not added', async () => {
    const newBlog = {
      title: 'Blog Title',
      author: 'Jordan Jenkins',
      likes: 55,
    }

    const token = await newUserToken()

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.listWithManyBlogs.length)
  })
})

describe('deletion of blog', () => {
  let token = null
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'jane', passwordHash })

    await user.save()

    // Login user to get token
    await api
      .post('/api/login')
      .send({ username: 'jane', password: 'password' })
      .then((res) => {
        return (token = res.body.token)
      })

    const newBlog = {
      title: 'Another blog',
      author: 'Jane Doe',
      url: 'http://dummyurl.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    return token
  })

  test('succeeds with status 204 if id is valid', async () => {
    const blogsAtStart = await Blog.find({}).populate('user')

    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await Blog.find({}).populate('user')

    expect(blogsAtStart).toHaveLength(1)
    expect(blogsAtEnd).toHaveLength(0)
    expect(blogsAtEnd).toEqual([])
  })

  test('fails when user is not authorized', async () => {
    const blogsAtStart = await Blog.find({}).populate('user')

    const blogToDelete = blogsAtStart[0]

    token = null

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(401)

    const blogsAtEnd = await Blog.find({}).populate('user')

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    expect(blogsAtStart).toEqual(blogsAtEnd)
  })
})

describe('Updating a blog', () => {
  test('Update a blogs likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const token = await newUserToken()
    const updatedBlogLikes = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 1
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `bearer ${token}`)
      .send(updatedBlogLikes)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const updatedLikes = blogsAtEnd.map(b => b.likes)
    expect(updatedLikes[0]).toBe(blogToUpdate.likes + 1)
  })
})

describe('There is initially one user in the Db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User({ username: 'root', password: 'secret' })
    await user.save()
  })

  test('creation of new user succeeds', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'testuser',
      name: 'Test User',
      password: 'testtest'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('User creation fails with proper status code if username already exists', async () => {
    const usersAtStart = helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'SuperUser',
      password: 'password',
    }

    const result = api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect((await result).body.error).toContain(' expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength((await usersAtStart).length)
  })

  test('User creation fails with proper status code if password does not meet requirements', async () => {
    const usersAtStart = helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'SuperUser',
      password: 'pa',
    }

    const result = api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect((await result).body.error).toContain('Password must be at least')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength((await usersAtStart).length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})