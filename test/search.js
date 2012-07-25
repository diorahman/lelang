var eproc = require('../eproc')

describe('Search', function(){
	describe('#search()', function(){
		it('should get list of eproc without error', function(done){
			eproc.search('test', 4, function(err, data){
				console.log(data)
				done()
			})
		})
	})
})
