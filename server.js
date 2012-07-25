var express = require('express')
var server = express.createServer()
var eproc = require('./eproc')

server.get('/', function(req, res){
	var obj = {
		'endpoints' : [
		{ 'path' : '/search', method : 'GET', query: ['key', 'cat'], example : 'GET /search?key=test&cat=4', note: 'cat -> category [0:pengadaan-barang, 1:konsultasi, 2:pekerjaan-konstruksi, 3:jasa-lainnya, 4:semua]'}, 
		{ 'path' : '/detail', method : 'GET', query: ['url'], example : 'GET /detail?url', note: 'url -> data[index].name.href ; data -> search result'}, 
		]
	}
	
	res.send(obj)
	
})

server.get('/search', function(req, res){
	var key = req.query.key ? req.query.key : ''
	var cat = req.query.cat ? req.query.cat : '4'
	eproc.search(key, cat, function(err, obj){
		res.send(obj)
	})
})

server.get('/detail', function(req, res){
	var url = req.query.url ? req.query.url : ''
	var sp = req.query.sp
	
	if(url && sp){
		url += '&sp=' + sp[0]
		url += '&sp=' + sp[1]
		
		eproc.detail(url, function(err, obj){
			res.send(obj)
		})
	}else{
		res.send(400)
	}
})


server.listen(8000)
