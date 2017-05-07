module.exports = {
	InsertDB: function(rcode,dataArray){
		var sqlite3 = require('sqlite3').verbose();
		var db = new sqlite3.Database('./public/db/votes_db.db'); // newdata is the name of my database

		db.serialize(function() {
		//db.run("CREATE TABLE IF NOT EXISTS lorem (info TEXT)"); // I will create a new table if not exists

			var date = new Date().toISOString().
				replace(/T/, ' ').      // replace T with a space
				replace(/\..+/, '');     // delete the dot and everything after 
			
		
			var stmt = db.prepare("INSERT INTO VOTE (VID, Vname, Vdatecreated) VALUES (?,?,?)");
			stmt.run([rcode, dataArray[0], date]); // I will insert in my database "Hello World"
			stmt.finalize();
			
			for(var i = 1; i < dataArray.length; i++){
				var stmt = db.prepare("INSERT INTO QUESTION (VID, Qname, Qnumber, Qvotes) VALUES (?,?,?,?)");
				stmt.run([rcode, dataArray[i], i, 0]); // I will insert in my database "Hello World"
				stmt.finalize()
				
			}

			db.each("SELECT * FROM VOTE", function(err, row) {
				console.log(row.VID + ": " + row.Vname);
			});
		});

		db.close();
	
	},
	
	RegisterUserDB: function(userIP, Pollcode, LastVoted){
		var sqlite3 = require('sqlite3').verbose();
		var db = new sqlite3.Database('./public/db/votes_db.db'); // newdata is the name of my database

		
		db.serialize(function() {
		//db.run("CREATE TABLE IF NOT EXISTS lorem (info TEXT)"); // I will create a new table if not exists
			
			var stmt = db.prepare("INSERT INTO USER (UID, VID, Qlastvoted) VALUES (?,?,?)");
			stmt.run([userIP, Pollcode, LastVoted]); // I will insert in my database "Hello World"
			stmt.finalize();
			
		console.log(userIP +" registered");

		});

		db.close();
	
	},
	
	UpdateUserDB: function(userIP,Pollcode, LastVoted, callback){
		var sqlite3 = require('sqlite3').verbose();
		var db = new sqlite3.Database('./public/db/votes_db.db'); // newdata is the name of my database

		db.serialize(function() {
			db.run("UPDATE USER SET Qlastvoted = '"+ LastVoted +"' WHERE UID = '" + userIP +"' AND VID = '" + Pollcode + "';"); // I will insert in my database "Hello World"
		});

		db.close();
		db.run("ROLLBACK;", function(e) {
			return callback();
		});
	},
	
	CheckUserDB: function(userIP, Pollcode, callback){
		var sqlite3 = require('sqlite3').verbose();
		var db = new sqlite3.Database('./public/db/votes_db.db'); // newdata is the name of my database
		var queryGetAll = "SELECT UID, VID, Qlastvoted FROM USER WHERE UID = '"+ userIP + "' AND VID = '"+Pollcode+"';";
		var flag;
		db.all(queryGetAll, function(err, rows){
			//	console.log("Test2");
				if(err) return callback(err);
				if(rows.length == 0){
					flag = null;
				} 
				else{
					flag = rows[0].Qlastvoted;
				} 
				db.close();
			callback(flag);
		});		
		
		
	
	},
	
	
	DBsearch: function(Pcode,callback){
		var sqlite3 = require('sqlite3').verbose();
		var db = new sqlite3.Database('./public/db/votes_db.db'); // newdata is the name of my database
		var DBarray = new Array();
		var queryGetAll = "SELECT Vote.VID, Vname, Qname,Qvotes FROM Vote LEFT OUTER JOIN question ON vote.VID = question.VID WHERE Vote.VID = '"+ Pcode +"';";
		//console.log("Test1");
			db.all(queryGetAll, function(err, rows){
			//	console.log("Test2");
				if(err) return callback(err);
				let i = 0; 
				rows.forEach(function (row) { 
					if(i==0){
						 DBarray.push(row.VID);
						 DBarray.push(row.Vname);
						 i=2;
					}
					 DBarray.push(row.Qname);
					 DBarray.push(row.Qvotes);
				});
				//console.log(DBarray);  
				//console.log("Test3");
				db.close();
				callback(DBarray);
			});		
	},

	DBupdateADD: function(Pcode,QUname,callback){
		var sqlite3 = require('sqlite3').verbose();
		var db = new sqlite3.Database('./public/db/votes_db.db'); // newdata is the name of my database

		db.serialize(function() {
			db.run("UPDATE QUESTION SET Qvotes = Qvotes + 1 WHERE Qname = '" + QUname +"' AND VID = '" + Pcode + "';"); // I will insert in my database "Hello World"
		});

		db.close();
		db.run("ROLLBACK;", function(e) {
			return callback();
		});
	},
	
	DBupdateSUB: function(Pcode,QUname,callback){
		var sqlite3 = require('sqlite3').verbose();
		var db = new sqlite3.Database('./public/db/votes_db.db'); // newdata is the name of my database

		db.serialize(function() {
			db.run("UPDATE QUESTION SET Qvotes = Qvotes -1 WHERE Qname = '" + QUname +"' AND VID = '" + Pcode + "';"); // I will insert in my database "Hello World"
		});

		db.close();
		db.run("ROLLBACK;", function(e) {
			return callback();
		});
	},

	generatecode: function(){
		var code = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	
		for (var i = 0; i<4; i++)
			code += possible.charAt(Math.floor(Math.random()*possible.length));
		
		return code;
		
	},
	
	ObjtoArray: function(dataObj){
		var arr = Object.keys(dataObj).map(function (key) { return dataObj[key]; });
		return arr;
	},


	CNewPoll: function(dArray){
		var fs = require('fs');
		var rurl = this.generatecode();
		//console.log();
		//var dArray = this.ObjtoArray(dataObj);
		this.InsertDB(rurl, dArray);
		var stream = fs.createWriteStream("./public/htm/vote/" + rurl + ".html");	
		stream.once('open', function(fd) {
		stream.write("<!doctype html>"+
			"<html>"+
				"<head>"+
					'<meta charset="utf-8">'+
					'<link rel="stylesheet" href="../../css/design.css">'+
					'<link rel="stylesheet" href="../../css/modal.css">'+
					'<link rel="stylesheet" href="../../css/pie3.css">'+
					"<title>Poll Maker</title>"+
				"</head>"+
				'<body background="../../png/bg-2.png">'+
					'<div id="myModal" class="modal">'+
						'<div class="modal-content">'+
							'<div class="info-modal-header"><table><tr><td><h2 style="color:white">Poll Results</h2></td><td align="right"><span class="bclose">&times;</span></td></tr></table></div>'+
							'<div class="modal-body" style="background-color: #eeeeee"><section class="row"><div class="column"><div class="donut-chart" data-donut-chart="1"></div></div><div class="column"><div class="legend"></div></div></section></div>'+
						'</div>'+
					'</div>'+
					'<div class="header">'+
						'<a class="back" href="javascript:window.history.back()"> &#60 </a>'+
					'</div>'+
					'<div id="lang" class="language">English(US)</div>'+
					'<div class="container">'+
						'<div class="menu" id="mmenu">'+
							'<h1 id="Pname">Your Question</h1>'+
							'<form id="Ballot"><ul id="ulform"></ul></form>'+
							'<input type="submit" value="See Results" onclick="updateModal()"><br><br>'+
						'</div>'+
					'<div class="footer"> Created by Gustavo Penedo </div>'+
					'</div>'+
					'<script src="../../js-f/Pie3.js"></script>'+
					'<script src="/socket.io/socket.io.js"></script>'+
					'<script src="http://code.jquery.com/jquery-1.11.1.js"></script>'+
					'<script src="../../js-f/Poll.js"></script>'+
				'</body>'+
			'</html>'
		);
		stream.end();
		});
	return rurl;
	}
}


