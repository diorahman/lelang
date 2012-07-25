var request = require('request')
var cheerio = require('cheerio')

var URL = 'http://lpse.depkeu.go.id/eproc/app'

function list(body, cb){	
		var paging = []
		
		var $ = cheerio.load(body)
		var len = $('tr').length
		
		var objs = []
		
		var p = $('tr')[len - 1]
		
		var hasPaging = false
		
		if($(p).find('img').length > 0){
			//console.log($(paging).html())
			hasPaging = true
		}
		
		for(var i = 0; i < len; i++){
			
			var obj = {}
			
			var elem = $('tr')[i]
			
			var considerAll = hasPaging ? i < len - 1 : true
			// content list
			if(i > 0 && considerAll){
				
				// links
				obj.dataLinks = []
				var lines = $(elem).find('a')
				for(var k = 0 ; k < lines.length; k++){
					var line = $(lines[k])
					obj.dataLinks.push({
						text : line.text().trim(),
						href : line.attr('href')
						})
				}
				
				// list
				obj.dataList = []
				var list = $(elem).find('#list').children()
				var next = false
				for(var k = 0 ; k < list.length; k++){
					var line = $(list[k])
					if(next){
						next = false
						obj.dataList.push(line.text().trim())
					}
					if(line.text().trim() == ':') next = true	
				}
				
				// other
				obj.dataOthers = []
				var other = $(elem).find('.horizLineTop')
				for(var k = 0 ; k < other.length; k++){
					var line = $(other[k])
					if(line.find('a').length == 0 && line.text().trim()){
						obj.dataOthers.push(line.text().trim().split('&nbsp;').join(''))
					}
				}
				
				objs.push(obj)
			}
			
			// paging
			else if(i == len -1 && hasPaging) {
				var links = $(elem).find('a')
				for(var j = 0; j < links.length; j++){
					var link = $(links[j])
					if(link.text()){
						paging.push({
							text : link.text(),
							href : link.attr('href').split('&amp;').join('&')
						})
					}
				}
			}
		}
		
		var objRet = {}
		var rets = []
		
		for(var i = 0; i < objs.length; i++){
			var ret = {}
			var o = objs[i]
			
			// details
			ret.name = o.dataLinks[0]
			ret.announcement = o.dataLinks[1]
			ret.audience = o.dataLinks[2]
			ret.offering = o.dataLinks[3]
						
			// list
			ret.category = o.dataList[0] 
			ret.qualification = o.dataList[1]
			ret.method = o.dataList[2]
			
			// others
			ret.index = o.dataOthers[0]
			ret.agency = o.dataOthers[1]
			ret.hps = o.dataOthers[2].split(',').join('.').split(' ')[0]
			ret.order = o.dataOthers[2].split(',').join('.').split(' ')[1].split('M').join('Milyar').split('jt').join('Juta')
			
			
			rets.push(ret)
		}
		
		objRet.data = rets
		objRet.paging = paging
		
		cb(null, objRet)
}


exports.search = function (keyword, category, cb){
	
	var body = 'service=' + 'direct/0/LelangCari/$PublicLelangList.$Form' + '&'
	body += 'sp=' + '5330' + '&'
	body += 'sp=' + '1629563' + '&'
	body += 'Form0=' + '$If,$PropertySelection,$TextField$0' + '&'
	body += '$If=' + 'F' + '&'
	body += '$PropertySelection=' + category + '&'
	body += '$TextField$0=' + escape(keyword)

	var options = {
		url : URL
		, method : 'POST'
		, body : body
		, headers : {
			'Content-type' : 'application/x-www-form-urlencoded ',
			'Referer' : 'http://lpse.depkeu.go.id/eproc/app?service=page/LelangCari'
		}
	}

	request(options, function(a, b, c){
		list(c, function(err, data){
			cb(err, data)
		})	
	})
}






