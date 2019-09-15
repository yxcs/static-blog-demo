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

function eachSourceFile (sourceDir, callback) {
    rd.eachFileFilterSync(sourceDir, /\.md$/, callback)
}

function renderPost (dir, file) {
    var content = fs.readFileSync(file).toString()
    var post = parseSourceContent(content.toString())
    post.content = markdownToHtml(post.source)
    post.layout = post.layout || 'post'
    var config = loadConfig(dir)
    var html = renderFile(path.resolve(dir, '_layout', post.layout + '.html'), {post: post, config: config})
    return html
}

function renderIndex (dir) {
    var list  = []
    var sourceDir = path.resolve(dir, '_posts')
    eachSourceFile(sourceDir, function (f, s) {
        var source =fs.readFileSync(f).toString()
        var post = parseSourceContent(source)
        post.timestamp= new Date(post.date)
        post.url = '/post/' + stripExtname(f.slice(sourceDir.length + 1)) + '.html'
        list.push(post)
    })

    list.sort(function (a, b) {
        return b.timestamp - a.timestamp
    })

    var config = loadConfig(dir)
    var html = renderFile(path.resolve(dir, '_layout', 'index.html'),{ posts: list, config: config })
    return html
}

function loadConfig (dir) {
    var content = fs.readFileSync(path.resolve(dir, 'config.json')).toString()
    var data = JSON.parse(content)
    return data
}

exports.renderPost = renderPost
exports.renderIndex = renderIndex
exports.stripExtname = stripExtname
exports.eachSourceFile = eachSourceFile
exports.loadConfig = loadConfig
 