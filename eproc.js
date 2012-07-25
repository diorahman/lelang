var request = require('request')
var cheerio = require('cheerio')

var ROOT = 'http://lpse.depkeu.go.id'
var URL = ROOT + '/eproc/app'

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
						href : line.attr('href').split('&amp;').join('&')
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

function qualificationDetail(body, cb){
	var $ = cheerio.load(body)
	
	$('tr').each(function(i, elem){
		$(this).find('td').each(function(i, elem){
			console.log($(this).text())
		})
		
	})
	
	/*$('table').find('table').find('tr').each(function(i, elem){
		$(this).find('td')
	})*/
	
}
function currentStateDetail(body){
	var $ = cheerio.load(body)
	return $('a').html().trim().split('\t').join('').split('<br/>')
}


function nameDetail(body, cb){
	var $ = cheerio.load(body)
	
	var labels = []
	var fields = []
	
	var len = $('label').length
	
	for(var i = 0; i < len; i++){
		var label = $('label')[i]
		var labelText = $(label).text()
		labels.push(labelText)
	}
	
	len = $('span.field').length
	for(var i = 0; i < len; i++){
		var field = $('span.field')[i]
		var fieldText = $(field).html()
		fields.push(fieldText)
	}
	
	len = $('span.field2').length
	for(var i = 0; i < len; i++){
		var field = $('span.field2')[i]
		var fieldText = $(field).html()
		fields.push(fieldText)
	}
	
	var obj = {}
	obj.data = {}
	obj.data.code = fields[0]
	obj.data.name = fields[1].split('&nbsp;').join(' ')
	obj.data.note = fields[2].split('&nbsp;').join(' ')
	obj.data.currentState = currentStateDetail(fields[3])
	obj.data.agency = fields[4]
	obj.data.workUnit = fields[5]
	obj.data.category = fields[6]
	obj.data.companyQualification = fields[8]
	obj.data.source = fields[9]
	obj.data.qualification = fields[10].split('&nbsp;').join('').trim().split('class = "horizLine"').join('').split('class = "selected horizLine"').join('').split('border = "0" cellspacing = "0" cellpadding = "2"').join('').split('class = "titleTop"').join('').split('valign = "top"').join('').split('width = "90%"').join('').split("nowrap").join('')
	obj.data.method = fields[12]
	obj.data.qualificationMethod = fields[13]
	obj.data.documentMethod = fields[14]
	obj.data.evaluationMethod = fields[15]
	obj.data.budgetYear = fields[16]
	obj.data.paguPackageValue = fields[17]
	obj.data.HPSPackageValue = fields[19]
	obj.data.contractTypeKickback = fields[20]
	obj.data.contractTypeDuration = fields[21]
	obj.data.contractTypeNumberOfPlayers = fields[22]
	
	//qualificationDetail(fields[10])
	
	cb(null, obj)
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

exports.detail = function(url, cb){
	var link = ROOT + url.split('&amp;').join('&')
	request(link, function(a, b, body){
		nameDetail(body, cb)
	})
}






