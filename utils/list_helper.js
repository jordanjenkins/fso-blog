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
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}