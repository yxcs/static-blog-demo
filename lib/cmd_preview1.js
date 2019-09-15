var express = require('express')
var serveStatic = require('serve-static')
var path = require('path')
var fs = require('fs')
var MarkdownIt = require('markdown-it')
var swig = require('swig')
var rd = require('rd')
swig.setDefaults({ cache: false })

var md = new MarkdownIt({
    html: true,
    langPrefix: 'code-'
})

function stripExtname (name) {
    var i = 0 - path.extname(name).length
    if (i === 0) i = name.length
    return name.slice(0, i)
}

function markdownToHtml (content) {
    return md.render(content || '')
}

function parseSourceContent (data) {
    var split = '---\n'
    var i = data.indexOf(split)
    var info = {}
    if (i !== -1) {
        var j = data.indexOf(split, i + split.length)
        if (i !== j) {
            var str = data.slice(i + split.length, j).trim()
            data = data.slice(j + split.length)
            str.split('\n').forEach(function (line) {
                var i = line.indexOf(':')
                if (i !== - 1) {
                    var name = line.slice(0, i).trim()
                    var value = line.slice(i + 1).trim()
                    info[name] = value
                }
            })   
        }
        str.split('\n')
    }
    info.source = data
    return info
}

function renderFile (file, data) {
    return swig.render(fs.readFileSync(file).toString(), {
        filename: file,
        autoescape: false,
        locals: data
    })
}

module.exports = function (dir) {
    dir = dir || '.'
    var app = express()
    var router = express.Router()
    app.use('/assets', serveStatic(path.resolve(dir, 'assets')))
    app.use(router)
    router.get('/post/*', function (req, res, next) {
        var name = stripExtname(req.params[0])
        var file = path.resolve(dir, '_posts', name + '.md')
        fs.readFile(file, function (err, content) {
            if (err) return next(err)
            var post = parseSourceContent(content.toString())
            post.content = markdownToHtml(post.source)
            post.layout = post.layout || 'post'
            var html = renderFile(path.resolve(dir, '_layout', post.layout + '.html'), {post: post, title: '博客详情'})
            res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'})
            res.end(html)
        })
    })
    router.get('/', function (req, res, next) {
        var list  = []
        var sourceDir = path.resolve(dir, '_posts')
        rd.eachFileFilterSync(sourceDir, /\.md$/, function (f, s) {
            var source =fs.readFileSync(f).toString()
            var post = parseSourceContent(source)
            post.timestamp= new Date(post.date)
            post.url = '/post/' + stripExtname(f.slice(sourceDir.length + 1)) + '.html'
            list.push(post)
        })

        list.sort(function (a, b) {
            return b.timestamp - a.timestamp
        })

        var html = renderFile(path.resolve(dir, '_layout', 'index.html'),{ posts: list, title: '博客列表' })

        res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'})
        res.end(html)
    })
    app.listen(3000)
}