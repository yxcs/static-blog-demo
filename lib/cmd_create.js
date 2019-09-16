var path = require('path')
var fse = require('fs-extra')
var moment = require('moment')

function newPost (dir, title, content) {
    var data = [
        '---',
        'title: ' + title,
        'date: ' + moment().format('YYYY-MM-DD'),
        '---',
        '',
        content
    ].join('\n')
    var name = moment().format('YYYY-MM-DD') + '/hello-world.md'
    var file = path.resolve(dir, '_posts', name)
    fse.outputFileSync(file, data)
}

module.exports = function (dir) {
    dir = dir || '.'
    fse.mkdirSync(path.resolve(dir, '_layout'))
    fse.mkdirSync(path.resolve(dir, '_posts'))
    fse.mkdirSync(path.resolve(dir, 'assets'))
    fse.mkdirSync(path.resolve(dir, 'posts'))

    var tplDir = path.resolve(__dirname, '../tpl')
    fse.copySync(tplDir, dir)
    newPost(dir, 'hello world', '这是我的第一篇文章')
    console.log('ok')
}