const request = require('request')
const fs = require('fs')
const open = require('open')
const glob = require('glob')
var categories = 2
var articles = 2

process.argv.forEach((val, index) => {
  if (index === 2) categories = val
  if (index === 3) articles = val
});

// Find files
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

getCategories(categories, '')

function getCategories(amount, after) {
  request('http://www.reddit.com/subreddits.json?after=' + after, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let obj = JSON.parse(body)
      let k = amount > 25 ? 25 : amount
      for(let i = 0; i < k; i++){

        let htmlHead = '<!DOCTYPE html><html><head><meta charset="utf-8">'
        let htmlBody = '<body><ol>'

        let category = obj['data']['children'][i]['data']['url']
        let categoryUrl = category.slice(0, -1)
        htmlHead += '<title>' + category.split('/')[2] + '</title></head>'
        let cat = category.split('/')[2]
        getArticles(cat, categoryUrl, articles, '', htmlHead, htmlBody)
      }

      if(amount > 25) getCategories(amount - 25, obj['data']['after'])
    }
  })
}



function getArticles(cat ,categoryUrl, amount, after, htmlHead, htmlBody) {
  request('http://www.reddit.com' + categoryUrl + '.json?after=' + after, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let categoryObj = JSON.parse(body)
      let k = amount > 25 ? 25 : amount
      for(let j = 0; j < k; j++){
        htmlBody += '<li><a href="' + categoryObj['data']['children'][j]['data']['url'] + '" >' + categoryObj['data']['children'][j]['data']['title'] + '</a></li>'
      }

      if(amount > 25) getArticles(cat, categoryUrl, amount - 25, categoryObj['data']['after'], htmlHead, htmlBody)

      htmlBody += '</ol></body></html>'
      let html = htmlHead + htmlBody
      fs.writeFile('html/' + cat + '.html', html, function(err) {
          if(err) {
              return console.log(err)
          }
          console.log(cat + '.html was saved!')
          // open('html/' + cat + '.html')
      })
    }
  })
}
