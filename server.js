var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 80;

var fs = require('fs');
var path = require('path');

var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname+'/files')
  }
})

var upload = multer({ storage: storage });


const File = {
		originalname: String,
		encoding: String,
		mimetype: String,
		filename: String,
		data: Date,
		niceDate: String
}

app.use(express.static(path.join(__dirname, '/public')))
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');

var main = express.Router();
app.use('/', main);

app.get('/', function(req,res){
	fs.readdir('./files', function(err, files){
		fs.readFile('./files/files.json', "utf-8", function(err, data){
			var data = data.trim();
			data = JSON.parse(data);
			let page = Math.ceil((data.length / 50));
			data = data.slice(0, 50);
			var directories = [];
			fs.readdir(__dirname+'/files', 'utf-8', function(err, dir){
				for (var i = dir.length - 1; i >= 0; i--) {
					if(fs.lstatSync("./files/"+dir[i]).isDirectory()){
						directories.push(dir[i]);
					}
				}
				// dir.forEach(function(e){
				// 	if(fs.lstatSync("./files/"+e).isDirectory()){
				// 		directories.push(e);
				// 	}
				// })
				res.render('index', {files : data, dir: directories, page: page});
			})
		})
	})


});

app.post('/', function(req,res){
	let currentPage = 1;
	if(req.body.page === "next"){
		if(currentPage === 1){
			fs.readFile('./files/files.json', "utf-8", function(err, data){
				var data = data.trim();
				let start, end;
				data = JSON.parse(data);
				let page = Math.ceil((data.length / 50));
				if(currentPage == 1){
					start = (currentPage - 1) * 50;
				}else{
					start = (currentPage - 1) * 50 + 1;
				}
				end = (currentPage * 50);
				data = data.slice(start, end);
				res.json(data);
			})
		}
	}else if(req.body.page === "previous"){

	}else{

		fs.readdir('./files', function(err, files){
			fs.readFile('./files/files.json', "utf-8", function(err, data){
				var data = data.trim();
				let start, end;
				data = JSON.parse(data);
				let page = Math.ceil((data.length / 50));
				if(req.body.page == 1){
					start = (req.body.page - 1) * 50;
				}else{
					start = (req.body.page - 1) * 50 + 1;
				}
				end = (req.body.page * 50);
				data = data.slice(start, end);
				res.json(data);
			})
		})
	}
})

var fileWatcher = io.of('/');
app.post('/uploadFile', upload.array('files'), function(req,res){
	let data = fs.readFileSync('./files/files.json', "utf-8")
	data = data.trim();
	data = JSON.parse(data);

	function formatDate(value)
	{
	   return value.getMonth()+1 + "/" + value.getDate() + "/" + value.getFullYear();
	}
	const date = new Date();
	req.files.forEach(function(e){

		const current = Object.create(File);
		if(req.body.newOriginalName && req.files.length == 1){
			current.originalname = req.body.newOriginalName;
		}else{
			current.originalname = e.originalname;
		}
		current.encoding = e.encoding;
		current.mimetype = e.mimetype;
		current.filename = e.filename;
		current.date = date;
		current.niceDate = formatDate(date);
		data.push(current);
		fs.writeFileSync(__dirname+'/files/files.json', JSON.stringify(data));
		fileWatcher.emit('file change', current);
	})
	res.redirect('/');
})

app.post('/file/:id/:name', function(req,res){
	res.download("./files/"+req.params.id, req.params.name);
});

app.post('/remove/:id/:name', function(req,res){

	fs.readFile('./files/files.json', "utf-8", function(err, data){
		var data = data.trim();
		data = JSON.parse(data);

		data.forEach(function(e,i){
			if(e.filename == req.params.id){
				data.splice(i, 1);
			}
		})
		
		fs.writeFile(__dirname+'/files/files.json', JSON.stringify(data), function(err){

		});
		fs.unlink("./files/"+req.params.id, function(err){
			res.redirect('/');
		});
	})

});

app.post('/newFolder', function(req,res){
	fs.mkdir(`./files/${req.body.newFolderName}`, function(err){
		if (err) throw err;

		fs.writeFile(`./files/${req.body.newFolderName}/files.json`, '[]', function(err){
			if (err) throw err;
		})

		res.redirect('/');
	})

})

app.post('/getDir', function(req,res){
	fs.readFile(`./files/${req.body.dir}/files.json`, "utf-8", function(err, data){
		if(data){
			data = data.trim();
			data = JSON.parse(data);
			data.unshift(req.body.dir);
			res.json(data);
		}else{
			res.json([req.body.dir]);
		}
	})
})

app.post('/uploadFileToDir/:dir', function(req,res){
	var upload = multer({ dest: 'files/' + req.params.dir }).array('files');
	let data = fs.readFileSync(`./files/${req.params.dir}/files.json`, "utf-8")
	data = data.trim();
	data = JSON.parse(data);

	upload(req, res, function(err) {
	    if(err) {
	        return res.end("Error uploading file.");
	    }
	    
	

		function formatDate(value)
		{
		   return value.getMonth()+1 + "/" + value.getDate() + "/" + value.getFullYear();
		}
		const date = new Date();
		req.files.forEach(function(e){

			const current = Object.create(File);
			if(req.body.newOriginalName && req.files.length == 1){
				current.originalname = req.body.newOriginalName;
			}else{
				current.originalname = e.originalname;
			}
			current.encoding = e.encoding;
			current.mimetype = e.mimetype;
			current.filename = e.filename;
			current.date = date;
			current.niceDate = formatDate(date);
			data.push(current);
			fs.writeFileSync(__dirname+`/files/${req.params.dir}/files.json`, JSON.stringify(data));
			fileWatcher.emit('file change', current);
		})
		res.redirect('/');
	});
})

app.post('/payload', function(req,res){
	console.log(req);
})

fileWatcher.on('file sent', function(msg){
	console.log("file sent!");
	fileWatcher.emit('file change', msg);
});
fileWatcher.on('connection', function(socket){
})

http.listen(port, "10.0.0.199");
console.log('Server running on port: ' + port);