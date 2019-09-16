var express = require('express')
var serveStatic = require('serve-static')
var path = require('path')
var open = require('open')
var fse = require('fs-extra')
var utils = require('./utils')

module.exports = function (dir) {
    dir = dir || '.'
    var app = express()
    var router = express.Router()
    app.use('/assets', serveStatic(path.resolve(dir, 'assets')))
    app.use(router)
    router.get('/post/*', function (req, res, next) {
        var name = utils.stripExtname(req.params[0])
        var file = path.resolve(dir, '_posts', name + '.md')
        var html = ''
        if (fse.pathExistsSync(file)) {
            html = utils.renderPost(dir, file)
        } else {
            html = utils.renderError(dir)
        }
        res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'})
        res.end(html)
    })
    router.get('/', function (req, res, next) {
        var html = utils.renderIndex(dir)
        res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'})
        res.end(html)
    })
    router.get('*', function (req, res, next) {
        var html = utils.renderError(dir)
        res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'})
        res.end(html)
    })

    var config = utils.loadConfig(dir)
    var port = config.port || 3000
    var url = 'http://localhost:' + port
    app.listen(port)
    open(url)
}