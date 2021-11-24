const listHelper = require('../utils/list_helper')
const helper = require('../tests/test_helper')



test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {

  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])
    expect(result).toBe(0)
  })
  test('when list has only one blog, equals the like of that blog', () => {
    const result = listHelper.totalLikes(helper.listWithOneBlog)
    expect(result).toBe(5)
  })
  test('of a big list, likes calculated correctly', () => {
    const result = listHelper.totalLikes(helper.listWithManyBlogs)
    expect(result).toBe(36)
  })
})

describe('favorite blog', () => {

  test('of empty list is zero', () => {
    const result = listHelper.favoriteBlog([])
    expect(result).toEqual(0)
  })

  test('when list has only one blog,the favorite is that blog', () => {
    const result = listHelper.favoriteBlog(helper.listWithOneBlog)
    expect(result).toEqual(helper.listWithOneBlog[0])
  })

  test('when list has many blogs,the favorite is the blog with the most likes', () => {
    const result = listHelper.favoriteBlog(helper.listWithManyBlogs)
    expect(result).toEqual(helper.listWithManyBlogs[2])
  })
})

describe('most blogs', () => {
  test('empty list is null', () => {
    const result = listHelper.mostBlogs([])
    expect(result).toEqual(null)
  })

  test('when list has only one blog, return the author of the blog and count one', () => {
    const result = listHelper.mostBlogs(helper.listWithOneBlog)
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      blogs: 1
    })
  })

  test('when list has many blogs, return the author with the highest count', () => {
    const result = listHelper.mostBlogs(helper.listWithManyBlogs)
    expect(result).toEqual({
      author: 'Robert C. Martin',
      blogs: 3
    })
  })
})

describe('most likes', () => {
  test('empty list is null', () => {
    const result = listHelper.mostBlogs([])
    expect(result).toEqual(null)
  })
  test('when list has only one blog, return the author of the blog and number of likes', () => {
    const result =  listHelper.mostLikes(helper.listWithOneBlog)
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 5
    })
  })
  test('when list has many blogs, return the author with the most number of likes', () => {
    const result =  listHelper.mostLikes(helper.listWithManyBlogs)
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 17
    })
  })
})