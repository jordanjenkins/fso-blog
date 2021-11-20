var _ = require('lodash')

const dummy = (blogs) => {
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
    const blogCount = _.countBy(blogs, 'author')
    const countPairs = _.toPairs(blogCount)
    const prolificAuthor = _.maxBy(countPairs, 1)
    
    const mostBlogsObject = {
        author: prolificAuthor[0],
        blogs: prolificAuthor[1]
    }
    return mostBlogsObject
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}