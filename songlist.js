var http = require('http'),
	fs = require('fs'),
	url = require('url'),
	jsdom = require('jsdom'),
	optpk = {
		host: 'www.songspk.pk',// this is just default; not in use
		path: '/bombay1992.html'// this is just default; not in use
	}, tmp;
if(process.argv.length < 3) {
	console.log('songspk url for the movie is missing. Exiting now.');
	process.exit(1);
}else {
	optpk = url.parse(process.argv[2]);
	optpk["user-agent"] =  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:21.0) Gecko/20100101 Firefox/21.0";
}

function getLinks(str, fn) {
  var songs = [];
  fn = fn || function() {};
  jsdom.env(str, ["http://code.jquery.com/jquery.js"], function(a, win) {
    var $ = win.jQuery;
    $('a[href*="songid"]').each(function() {
      songs.push({
        name: $(this).text(),
        url: $(this).attr('href')
      });
    });
    fn(songs);
  });
}

var req = http.get(optpk, function(res) {
    var str = '';
  if(res.statusCode == 200) {
    res.on('data', function (chunk) {
      str += chunk;
    });
    res.on('end', function () {
      console.log('Got page.. sending for parsing');
      getLinks(str, function(list) {
        var i, lines = '#!/bin/sh' + '\n';
        for(i = 0; i < list.length; i++) {
          lines += 'wget --user-agent="Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:21.0) Gecko/20100101 Firefox/21.0" '+ list[i].url + ' -O "' + list[i].name + '.mp3' + '"\nsleep 5;\n';
        }
        fs.writeFile('/tmp/songlist.sh', lines, function (err) {
          if (err) {
            throw err;
            process.exit(1);
          };
          console.log('Shell file created! Run the following command from the directory where you want to download the songs.');
          console.log('sh /tmp/songlist.sh');
          process.exit(0);
        });
      });
    });
  }else {
    console.log('Response is: ', res.statusCode);
  }
});

req.on('error', function(arg) {
	console.dir(arg);
}).end();
