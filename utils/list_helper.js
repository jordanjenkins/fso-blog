var _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }

  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (previous, current) => {
    return previous.likes > current.likes
      ? previous
      :current
  }

  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const mostBlogs = _(blogs)
    .countBy('author')
    .toPairs()
    .maxBy(1)

  return { author: mostBlogs[0], blogs: mostBlogs[1] }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const totalAuthorLikes = _(blogs)
    .groupBy('author')
    .map((blog, author) => ({
      author: author,
      likes: _.sumBy(blog, 'likes')
    }))
    .orderBy('likes', ['desc'])
    .value()

  return totalAuthorLikes[0]
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}