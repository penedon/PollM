socket = io();
var Qnumber = 1;
var PollSize;

	function pastelColors(){
		var r = (Math.round(Math.random()* 127) + 127).toString(16);
		var g = (Math.round(Math.random()* 127) + 127).toString(16);
		var b = (Math.round(Math.random()* 127) + 127).toString(16);
		return '#' + r + g + b;
	}
	
	function updateModal(){
		modal.style.display = 'block';
		Chart1.update({data: chartDataDEF});
	}
	
	var chartDataDEF = {total:0, wedges:[]};
	var sid = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	
	
					var Pcode = window.location.href.split(/(\\|\/)/g).pop();
					Pcode = Pcode.slice(0,Pcode.search(".html"));
					socket.emit('LoadPoll', Pcode );
					socket.on('LoadPoll1', function(DBarray){
						
						var Ccolor = [];
						PollSize=(DBarray.length-2)/2;
						document.title = "[" + DBarray[0] + "] " + DBarray[1];
						$('.legend').html('<h1>'+DBarray[1]+'</h1><br>');
						for(var i = 0; i < PollSize; i++){
							$('#Pname').html(DBarray[1]);
							$('<li>').attr('id','li'+i).appendTo('#ulform');
							$('<input>').attr('type','radio').attr('id','option'+i).attr('name','selector').attr('value',DBarray[2+i*2] ).appendTo('#li'+i);
							$('<label>'+i).attr('for','option'+i).attr('id','label'+i).appendTo('#li'+i);
							$('#label'+i).html(DBarray[2+i*2] + " | " + DBarray[3+i*2] );
							$('<div>').attr('id','licheck'+i).attr('class', 'check').appendTo('#li'+i);
							$('<div>').attr('class', 'inside').appendTo('#licheck'+i);
							$('<hr>').appendTo("#li"+i);
							//Chart Legend builder
							$('<canvas>').attr('id','myCanvas'+i).attr('width','13').attr('height','13').attr('style','border:1px solid #d3d3d3;' ).appendTo('.legend');
							$('<p>').attr('id','para'+i).attr('syle','color:black').appendTo('.legend');
							$('#para'+i).html(' ' + DBarray[2+i*2]);
							$('<br>').appendTo('.legend');
							//Chart stuff
							Ccolor.push(pastelColors());
							chartDataDEF.wedges.push({ id: sid.charAt(i), color: Ccolor[i], value: DBarray[3+i*2] });
							chartDataDEF.total += DBarray[3+i*2];
							var c = document.getElementById("myCanvas"+i);
							var ctx = c.getContext("2d");
							ctx.fillStyle=Ccolor[i];
							ctx.fillRect(0, 0, 13, 13);
							

							
						}
						//chartDataDEF.wedges.push({ id: 'a', color: '#4FC1E9', value: DBarray[3+0*2] });
						//chartDataDEF.wedges.push({ id: 'b', color: '#A0D468', value: DBarray[3+1*2] });
						//chartDataDEF.total = DBarray[3+0*2] + DBarray[3+1*2];

						//alert(charDataDEF.wedges);.
						Chart1.update({data: chartDataDEF});
						
						$('#Ballot input').on('change', function() {
							var Pquestion = $('form input[type=radio]:checked').val();
							//alert(text);
							var voteArray = [Pcode, Pquestion];
							socket.emit('votechoice', voteArray);
							
						});	
					
					});
					socket.on('votechoice1',function(DBarray){
						//delete chartDataDEF;
						
								chartDataDEF.total =0;
								for(var i = 0; i < PollSize; i++){
									$("#label"+i).html(DBarray[2+i*2] + " | " + DBarray[3+i*2] );
									
									chartDataDEF.wedges[i].value = DBarray[3+i*2];
									//chartDataDEF.wedges.push({ id: i, color: Ccolor[i], value: DBarray[3+i*2] });
									
									chartDataDEF.total += DBarray[3+i*2];
									
									
								}
								Chart1.update({data: chartDataDEF});
					});
					
					var modal = document.getElementById('myModal');
			// Get the <span> element that closes the modal
			var span = document.getElementsByClassName("bclose")[0];
			// When the user clicks on <span> (x), close the modal
			span.onclick = function() {
				modal.style.display = "none";
			}
			// When the user clicks anywhere outside of the modal, close it
			window.onclick = function(event) {
				if (event.target == modal) {
					modal.style.display = "none";
				}
			}