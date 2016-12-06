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

request('http://www.reddit.com/subreddits.json', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    let obj = JSON.parse(body)
    for(let i = 0; i < categories; i++){

      let htmlHead = '<!DOCTYPE html><html><head><meta charset="utf-8">'
      let htmlBody = '<body><ul>'

      let category = obj['data']['children'][i]['data']['url']
      let categoryUrl = category.slice(0, -1)
      htmlHead += '<title>' + category.split('/')[2] + '</title></head>'

      request('http://www.reddit.com' + categoryUrl + '.json', function (error, response, body) {
        console.log(category, ' = ', categoryUrl)
        if (!error && response.statusCode == 200) {
          let categoryObj = JSON.parse(body)
          for(let j = 0; j < articles; j++){
            htmlBody += '<li><a href="' + categoryObj['data']['children'][j]['data']['url'] + '" >' + categoryObj['data']['children'][j]['data']['title'] + '</a></li>'
          }
          htmlBody += '</ul></body></html>'

          let cat = category.split('/')[2]
          let html = htmlHead + htmlBody
          fs.writeFile('html/' + cat + '.html', html, function(err) {
              if(err) {
                  return console.log(err)
              }
              console.log(cat + '.html was saved!')
              open('html/' + cat + '.html')
          })
        }
      })
    }
  }
})
