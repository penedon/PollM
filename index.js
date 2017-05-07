var express = require('express')
var app = express()
var http = require('http').Server(app);
//var async = require('async')
var io = require('socket.io')(http);

var auxf = require('./auxf');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));



app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/htm/default.htm');
});


app.post('/createdb',function(request,response){
   var code = auxf.CNewPoll(request.body);
   console.log(code);
   response.sendFile(__dirname + '/public/htm/default.htm');
});


var flag = false;

io.on('connection', function(socket){								///SOCKET.IO
  
  var clientIpAddress= socket.request.socket.remoteAddress;
  var user;
  if(clientIpAddress == '::1' || clientIpAddress == '::ffff:127.0.0.1' || clientIpAddress == '127.0.0.1') user = "Admin";
  else user = clientIpAddress;
  console.log(user + ' connected');
  
  socket.on('pollcode', function(Pcode){
	  console.log(user + ' typed: ' + Pcode);
		var fs = require('fs');
		if (fs.existsSync("./public/htm/vote/" + Pcode + ".html")) {
			console.log(user + " found: " + Pcode);
			socket.emit('pollres', 1);
		}else{
			console.log(user + " typed the wrong code");
			socket.emit('pollres', 404);
			
		}

	  //socket.emit('pollcode', somethingElse);
	  
  });
  
  socket.on('createdb', function(FormData){
	var code = auxf.CNewPoll(FormData);
	//console.log(code);
	socket.emit('createdb1', code);

   //response.sendFile(__dirname + '/default.htm');
	  
  });
  
  //socket.on('',function)(){});
  socket.on('LoadPoll',function(Pcode){
	  console.log("UserPoll = " + Pcode);
	  //console.log("F-LoadPoll: LOADED");
	  if(Pcode == 'VoteModel') Pcode = 'xEsR';
	  auxf.DBsearch(Pcode, function(cback) {
        var DBarray = cback; 
		//sconsole.log('Dbarray index.js::' + DBarray);
		  socket.emit('LoadPoll1', DBarray);
	  });
	
	  
	
	  
  });
  
  
  socket.on('disconnect', function(){
	console.log(user + ' disconnected');
  });
  socket.on('votechoice', function(PArray){
	 if(PArray[0] == 'VoteModel') PArray[0] = 'xEsR';
	 
	auxf.CheckUserDB(user,PArray[0],function(flag){
		if(flag != null) {
			auxf.DBupdateSUB(PArray[0],flag,function(){
				auxf.UpdateUserDB(user,PArray[0],PArray[1], function(){
					auxf.DBupdateADD(PArray[0],PArray[1],function(nvm){
					//console.log(user + ": " + PArray[0]+ " | "+ PArray[1]);
	 
						auxf.DBsearch(PArray[0], function(cback) {
							var DBarray = cback; 
							//console.log('Dbarray index.js::' + DBarray);
							io.emit('votechoice1', DBarray);
						});
					});
				});	
			});
					
		}
		else {
			auxf.RegisterUserDB(user,PArray[0],PArray[1]);
			auxf.DBupdateADD(PArray[0],PArray[1],function(nvm){
				//console.log(user + ": " + PArray[0]+ " | "+ PArray[1]);
	 
				auxf.DBsearch(PArray[0], function(cback) {
					var DBarray = cback; 
					//console.log('Dbarray index.js::' + DBarray);
					io.emit('votechoice1', DBarray);
				});
			});
		}
	});
	 
     
	 
  });
  
  
});																	//\SOCKET.IO

http.listen(port = 3000,'0.0.0.0', function(){
  console.log('listening on *:' + port);
  
});