//const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog
    .findById(request.params.id)
    .populate('user', { username: 1, name: 1 })

  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  if(!request.token) {
    return response.status(401)
      .json({ error: 'token missing or invalid' })
  }
  const user = request.user

  const blog = new Blog ({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(200).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  if(!request.token) {
    return response.status(401)
      .json({ error: 'token missing or invalid' })
  }
  const blogId = await request.params.id
  const blogToDel = await Blog.findById(blogId)
  const user = request.user

  if (blogToDel.user.toString() === user._id.toString()) {
    await Blog.findByIdAndRemove(blogId)
    return response.status(204).end()
  }
  return response.status(403)
    .json({ error: 'Forbidden, invalid user' }).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter