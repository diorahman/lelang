var eproc = require('../eproc')
var request = require('request')

var ROOT = 'http://lpse.depkeu.go.id'

describe('Search', function(){
	describe('#search()', function(){
		it('should get list of eproc without error', function(done){
			eproc.search('test', 4, function(err, obj){
				console.log(obj.data[0].name.text)
				
				eproc.detail(obj.data[0].name.href, function(err, data){
					console.log(data)
					done()
				})
				
			})
		})
	})
})
