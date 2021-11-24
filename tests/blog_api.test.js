const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.listWithManyBlogs)
})

describe('Initially, some blogs are saved', () => {
  test('blogs are returned as JSON', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }, 100000)

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.listWithManyBlogs.length)
  })

  test('unique identifier is named id', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => {
      expect(blog.id).toBeDefined()
    })
  })
})

describe('Viewing a specific blog', () => {
  test.only('A specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
    expect(resultBlog.body).toEqual(processedBlogToView)
  })

  test.only('If blog does not exist, send 404', async () => {
    const validNonExistingId = await helper.nonExistingId()

    await api
      .get(`/api/blogs/${validNonExistingId}`)
      .expect(404)
  })

  test.only('If id is not valid, send 400', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/blogs/${invalidId}`)
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

    await api
      .post('/api/blogs')
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

  test('if likes are missing during POST, default to 0', async () => {
    const newBlog = {
      title: 'The New Blog',
      author: 'Jordan Jenkins',
      url: 'www.jordan.com',
    }

    await api
      .post('/api/blogs')
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

    await api
      .post('/api/blogs')
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

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.listWithManyBlogs.length)
  })
})

describe('Deleting a blog', () => {
  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.listWithManyBlogs.length - 1
    )
  })
})
afterAll(() => {
  mongoose.connection.close()
})