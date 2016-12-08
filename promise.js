const request = require('request')
const fs = require('fs')
const open = require('open')
const glob = require('glob')

let categoriesAmount = 2
let articlesAmount = 2

let redditUrl = 'http://www.reddit.com/'
let subredditsUrl = redditUrl + 'subreddits.json'

process.argv.forEach((val, index) => {
  if (index === 2) categoriesAmount = val
  if (index === 3) articlesAmount = val
});

glob('html/*.html',function(err, files){
     if (err) throw err
     files.forEach(function(item, index, array){
          console.log(item + ' found')
     });
     // Delete files
     files.forEach(function(item, index, array){
          fs.unlink(item, function(err){
               if (err) throw err
               console.log(item + ' deleted')
          })
     })
})

// let asyncTmp = async () => {
//   hi = await myPromise()
//   console.log(hi + ' world')
// }
//
// function myPromise()  {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve('hello')
//     }, 2000)
//   })
// }
// asyncTmp()

// let asyncGetCategories = async (categories, after) => {
//   let subredditsObj = await getCategoriesPromise(categories, after)
//   console.log(subredditsObj)
// }

function promiseRequest (url) {
  return new Promise((resolve, reject) => {
    request(url, (error, res, body) => {
      if (error) {
        return reject(error)
      }

      try {
        resolve(JSON.parse(body))
      } catch (e) {
        reject(e)
      }
    })
  })
}

let getArticles = async (articlesUrl) => {
  let articles = []
  while (articles.length < articlesAmount) {
    const { data: {children, after} } = await promiseRequest(articlesUrl)

    while (articles.length < articlesAmount && children.length) {
      articles.push(children.shift())
    }

    articlesUrl = `${articlesUrl}.json?after=${after}&count=${articles.length}`
  }

  articles = articles.map(el => ({
    title: el.data.title,
    url: el.data.url
  }))
  return articles
}

const main = async () => {
  let categories = []
  let categoriesUrl = subredditsUrl
  while (categories.length < categoriesAmount) {
    const { data: { children, after } } = await promiseRequest(categoriesUrl)

    while (categories.length < categoriesAmount && children.length) {
      categories.push(children.shift())
    }

    categoriesUrl = `${subredditsUrl}?after=${after}&count=${categories.length}`
  }

  categories = categories.map(el => ({
    title: el.data.title,
    url: el.data.url
  }))

  for (let i = 0; i < categories.length; i++) {
    categories[i].articles = await getArticles(redditUrl + categories[i].url + '.json')
  }

  console.log(categories)
}

main()
// (async () => {
//   let data = await promiseRequest('https://www.reddit.com/r/AskReddit.json')
//   console.log(data)
// })()

// function getCategoriesPromise(amount, after) {
//     return new Promise((resolve, reject) => {
//       request(subredditsUrl + after, function (error, res, body) {
//         if (error) reject(error)
//         let returnObj = {}
//         let subredditsObj = JSON.parse(body)
//         let k = amount > 25 ? 25 : amount
//         for(let i = 0; i < k; i++){
//           let categoryUrl = subredditsObj['data']['children'][i]['data']['url'].slice(0, -1)
//           let categotyName = categoryUrl.split('/')[2]
//           returnObj[categotyName] = categoryUrl
//         }
//         let newObj = {}
//
//         if(amount > 25) (async () => {
//           newObj = await getCategoriesPromise(amount - 25, subredditsObj['data']['after'])
//         })()
//         returnObj = _extends({}, returnObj, newObj)
//         resolve(returnObj)
//       })
//     })
// }
//
// asyncGetCategories(categories, '')
//
// function main() {
//
// }
