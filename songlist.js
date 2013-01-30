var http = require('http'),
	fs = require('fs'),
	optpk = {
		host: 'www.songspk.pk',// this is just default; not in use
		path: '/bombay1992.html'// this is just default; not in use
	}, tmp;
if(process.argv.length < 3) {
	console.log('songspk url for the movie is missing. Exiting now.');
	process.exit(1);
}else {
	tmp = process.argv[2].replace(/http:\/\//, '').split(/\//);
	optpk.host = tmp[0];
	optpk.path = '/'+tmp[1];
	console.log(tmp);
}
var req = http.request(optpk, function(res) {
 //do something
 	var str;
	res.on('data', function (chunk) {
		str += chunk;
	});
	res.on('end', function () {
		var lines = '',
			i, matches = str.match(/(http.*songid=.*)">\n?(.*)<\/a/g),
		info = [];
		for(i = 0; i < matches.length; i++) {
			console.log(matches[i]);
			info.push({
				link: matches[i].replace(/">.*\n?.*/g,''),
				name: matches[i].replace(/.*[0-9]">([\t\n]+)?/g,'').replace(/<\/a/,'.mp3')
			});
		}
		for(i = 0; i < info.length; i++) {
			lines += 'wget '+ info[i].link + ' -O "' + info[i].name + '"\nsleep 5;\n';
		}
		fs.writeFile('/tmp/songlist.sh', lines, function (err) {
		  if (err) {
		  	throw err;
		  	process.exit(1);
		  };
		  console.log('Shell file created!');
		  process.exit(0);
		});
	});
});

req.on('error', function(arg) {
	console.dir(arg);
}).end();
