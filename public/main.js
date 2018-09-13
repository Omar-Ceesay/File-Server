function sortList(){
	var list, i, switching, b, shouldSwitch, dir, switchcount = 0;
	list = document.getElementById("files");
	switching = true;
	// Set the sorting direction to ascending:
	dir = "asc"; 
	while (switching) {
	    // Start by saying: no switching is done:
	    switching = false;
	    b = list.getElementsByClassName("MainList");
	    // Loop through all list-items:
	    for (i = 0; i < (b.length - 1); i++) {
	      // Start by saying there should be no switching:
	      shouldSwitch = false;
	      /* Check if the next item should switch place with the current item,
	      based on the sorting direction (asc or desc): */
	      if (dir == "asc") {
	        if (b[i].innerHTML.toLowerCase() > b[i + 1].innerHTML.toLowerCase()) {
	          /* If next item is alphabetically lower than current item,
	          mark as a switch and break the loop: */
	          shouldSwitch = true;
	          break;
	        }
	      } else if (dir == "desc") {
	        if (b[i].innerHTML.toLowerCase() < b[i + 1].innerHTML.toLowerCase()) {
	          /* If next item is alphabetically higher than current item,
	          mark as a switch and break the loop: */
	          shouldSwitch= true;
	          break;
	        }
	      }
	    }
	    if (shouldSwitch) {
	      /* If a switch has been marked, make the switch
	      and mark that a switch has been done: */
	      b[i].parentNode.insertBefore(b[i + 1], b[i]);
	      switching = true;
	      // Each time a switch is done, increase switchcount by 1:
	      switchcount ++;
	    } else {
	      /* If no switching has been done AND the direction is "asc",
	      set the direction to "desc" and run the while loop again. */
	      if (switchcount == 0 && dir == "asc") {
	        dir = "desc";
	        switching = true;
	      }
	    }
	  }
}


function showNewFolder(){
	if(document.getElementById('hiddenForm').hidden){
		document.getElementById('hiddenForm').hidden = false;
	}else{
		document.getElementById('hiddenForm').hidden = true;
	}
}

function getDirContent(name){
	var data = {dir: name}
	if ($( `[name="${name}item"]` ).text()) {
		if ( $( `[name="${name}item"]` ).is( ":hidden" ) ) {
		  $( `[name="${name}item"]` ).slideDown(0);
		} else {
		  $( `[name="${name}item"]` ).hide();
		}
	}else{
	    $.post('/getDir', data, function(resp) {
	    	var id = resp[0];
	        if ( $( `[name="${id}item"]` ).is( ":hidden" ) ) {
			  $( `[name="${id}item"]` ).slideDown(0);
			} else {
			  $( `[name="${id}item"]` ).hide();
			}
	    	if(resp.length == 1){
	    		$(`[name="${id}thing"]`)
	    				.after($('<tr>').addClass('table-danger').append($('<td>')
	    					.attr('Colspan', "4")
	    					.attr('name', id+"item").text('Not files found in that directory')));
	    	}else{

		    	resp.forEach(function(e, i){
		    		if(i === 0){

		    		}else{
		    			$(`[name="${id}thing"]`)
		    				.after($('<tr>').addClass('table-info').append($('<td>')
		    					.attr('Colspan', "4")
		    					.attr('name', id+"item").text(e.originalname)));
		    		}
		    	})
	    	}
	    });
	}
}
function nextData(e){
	var data = {page: e}
	$.post('/', data, function(resp){
		$(".MainList").remove();
		console.log(resp.length)
		resp.forEach(function(e){
			$(`tbody:last-child`)
			    				.append($('<tr>').addClass('MainList').append($('<td>')
			    					.text(e.originalname)).append($('<td>')
			    					.text(e.niceDate)).append($('<td>')
			    					.append($('<div>').addClass('btn-group').addClass('col-md-12')
			    					.append($('<form>')
			    					.attr(`action`, `/file/${e.filename}/${e.originalname}`).attr("method",'post')
			    					.append($("<button>").addClass("btn btn-primary").text("Download").attr("type", "submit")))
			    					.append($("<form>")
			    					.attr(`action`, `/remove/${e.filename}/${e.originalname}`).attr("method",'post')
			    					.append($("<button>").addClass('btn btn-danger').attr('type', 'submit').text('Delete'))))));
		})
	});
}

// function showForm(){
// 	if(s){
// 		s = false;
// 		console.log('hide')
// 		$("#addFileToDir").hide();
// 	}else{
// 		s = true;
// 		$("#addFileToDir").show();
// 		console.log('show')
// 	}
// }