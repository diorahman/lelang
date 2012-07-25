var express = require('express')
var server = express.createServer()

server.get('/', function(req, res){
  res.send('yippie!')
})

server.listen(8000)
