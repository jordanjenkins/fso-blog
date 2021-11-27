const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

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
  const decodedToken = jwt.verify(request.token, process.env.JWT_SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401)
      .json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)
  console.log(user)
  const blog = new Blog ({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  console.log(user)
  await user.save({ runValidators:false })

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const blogId = await request.params.id
  const blog = await Blog.findById(blogId)

  const token = request.token
  console.log('token', token)
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
  console.log('Decoded Token', decodedToken)

  if (!token || !decodedToken.id) {
    return response.status(401)
      .json({ error: 'token missing or invalid' })
  }

  if (blog.user.toString() === decodedToken.id) {
    await Blog.findByIdAndRemove(blogId)
    response.status(204).end()
  } else {
    return response.status(403)
      .json({ error: 'Forbidden, invalid user' })
  }
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