var query_cnt =0;
var query_array = [];
var evnt_name = '';
var vidlist = '';

function vid_list_get() {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', '_data/video.log', false);
    xhr.send(null);

    vidlist = xhr.responseText.split('\n');

}

vid_list_get()
console.log('vidlist', vidlist);


$(function(){
	var height = $(document).height();
	$('#main').css('height',height);
	draw_viz();
    if(localStorage['event'].length!=0){
        //load proper video clip
        evnt_name = localStorage['event'];
        for(var i=0;i<5;i++){
            $('#sidebar ul').append('<li><a href="detail.html"><img src="_img/'+vidlist[i]+'.png"/></a></li>');
            //$('#sidebar ul').append('<a href="detail.html"><li><img src="_img/'+evnt_name+'/'+i+'.png"/></li></a>'); <-- orig bryan
        }
        $('#video source').attr('src',"_video/"+evnt_name+".mp4");
    }

    $('#sidebar li').click(function(){
        var urlstr = $(this).children().children('img').attr('src');
        var start = urlstr.indexOf("/");
        var event_name =urlstr.slice(start+1,urlstr.lastIndexOf('.png'));
        localStorage.setItem("event", event_name);
    });
    console.log(localStorage['event']);
});


// Save the event name of the image to localstorage
$('#select li').click(function(){
    var urlstr = $(this).children().children('img').attr('src');
    var start = urlstr.indexOf("/");
    var event_name =urlstr.slice(start+1,urlstr.lastIndexOf('.png')-2);
    localStorage.setItem("event", event_name);
});



$('#select li').mouseenter(function() {
    $(this).children().children('.cover').show();
  })
  .mouseleave(function() {
    $(this).children().children('.cover').hide();
});

//button event
$('button').on('click',function(){
//    var counter = 0;

    // start numbering of image set (2,3,4,5) | (6,7,8,9)
//    var start_cnt = $('#sidebar li').eq(0).children('img').attr('src').slice(-5,-4);
//    var new_start_cnt =0;

//    if (start_cnt ==2){
//        new_start_cnt =6;
//    }else{
//        new_start_cnt =2;
//    }
//    $('#sidebar ul').html('');

//   var interval = setInterval(function() {
//       $('#sidebar ul').append('<li><img src="_img/'+evnt_name+'/'+parseInt(parseInt(new_start_cnt) + parseInt(counter))+'.png"/></li>').fadeIn(50);
//       counter++;
//       if(counter == 4){
//           counter = 0;
//           clearInterval(interval);
//       }
//   }, 100);


    var str = query_array.join(', ');   // URL encoded spaces separating array entries
    var params = "array=" + str;
    var http = new XMLHttpRequest();
    http.open("POST", "write.php", true);

//Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    console.log(params.length);
    //http.setRequestHeader("Content-length", params.length);
    //http.setRequestHeader("Connection", "close");

    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
        }
    }
    http.send(params);

    $.ajax({ url: 'clear.php' });
//    $('button').hide();
//    $('#result').html('');
    setTimeout(function(){location.reload()}, 3000);
//    draw_viz();
    $('#query ul').html('');
    $('#sidebar ul').html('');
    query_cnt=0;
    query_array.length=0;
});
function addElement(ui, type, bgcolor, precolor){
	// console.log(ui, type, bgcolor, precolor);

    $("button").show();
	$('#query ul').append('<li class="q_elmt" style="background-color:'+bgcolor+'"><span class="q_icon icon-'+type+'"></span><span id="'+precolor+'" class="q_time">'+ui.substring(7)+'</span><span id="'+ui+'" class="icon-cross"></span> <script> $("li #'+ui+'").on("click",function(){$(this).parent().remove(); if($("#query ul li").length == 0){$("button").hide();query_cnt=0;}else{query_cnt -= 1; } var pre_id = "#"+$(this).attr("id"); var pre_color = $(this).parent().children("span:nth-child(2)").attr("id"); $(pre_id).css("fill",pre_color);})</script></li>');
}

function draw_viz(){

    var margin = {top: 30, right: 0, bottom: 0, left: 0},
        width = 520,
        height =130;

    var start_time = 0,
        end_time = 0;

    var c = d3.scale.category20c();

    var x = d3.scale.linear()
        .range([0, width-50]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("top");

    var color = d3.scale.linear()
    	.domain([0,.5])
    	.range(["#F9EBFF","#D184FF"])

        // .domain([0,1/6,2/6,3/6,4/6,5/6,1])
        // .range(["#ffffd4","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"])

    var svg = d3.select("#result").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-left", margin.left + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var concepts =["Visual","Audio","Motion"];

    var dataset =[];
    var dsource = (localStorage['event']);
    d3.text("_data/"+dsource+".csv", function(text) {
            dataset = d3.csv.parseRows(text).map(function(row) {
                return row.map(function(value) {
                  return +value;
                });
            });
            end_time = dataset.length;
            console.log(end_time);
            x.domain([start_time, end_time]);

            var xScale = d3.scale.linear()
                .domain([start_time, end_time])
                .range([0, 4.7]); //Bryan look here

            // X axis
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(55.5,10)")
                .style("fill", 'white')
                .style('font-size','10')
                .call(xAxis);
            // X axis label
            svg.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", width/2 + 55)
                .attr("y", -20)
                .text("Time (10ms)")
                .style('fill','white')
                .style('font-size','10');

        for (var j = 0; j < dataset.length; j++) {
            var g = svg.append("g").attr("class","journal");
            var rects = g.selectAll("rect")
                .data(dataset[j])
                .enter()
                .append("rect");

            var text = g.selectAll("text")
                // .data(data[j]['Time'])
                .data(dataset[j])
                .enter()
                .append("text");

            rects   
                .attr("id", function(d,i){
                	var type ='';
					if(i==0){
						type = 'visual';
					}
					else if(i==1){
						type = 'audio_';
					}
					else if(i==2){
						type = 'motion';
					}
                	return type+'-'+j;
                }) 
                .attr("x", function(d) {return 55+xScale(j*100+1); })
                .attr("y", function(d,i) { return i*40+10; })
                .attr("width",55)
                .attr("height",31)
                .style("fill", function(d){return color(d);})
                .on("click",function(d,i){
                    // console.log($(this).attr('id'));
                    // console.log()
                    myPlayer = _V_("detail_video");
                    myPlayer.currentTime($(this).attr('id').substring(7)/100);
                    myPlayer.play();
                    // console.log(this.style);
                    var bgcolor='';
                    var precolor='';
                    var type='';

					if(i==0){
						type = 'visual';
						bgcolor = '#0099ff';
					}
					else if(i==1){
						type = 'audio_';
						bgcolor = '#54ad00';
					}
					else if(i==2){
						type = 'motion';
						bgcolor = '#00D3FF';
					}
                    if(query_cnt<6 && $.inArray($(this).attr('id'),query_array)==-1){
                        console.log('add');
                        query_array.push($(this).attr('id'));
						//added by bryan
						console.log(query_array);
                        query_cnt++;
    					precolor = $(this).css('fill');
                        $(this).css('fill',bgcolor);
                        $(this).append('<span class="icon-'+type+'"></span>');
    					addElement($(this).attr('id'), type, bgcolor, precolor);
                    }else{
                        console.log('exceed 6 queries');
                    }
                });
         	$('#modality').show();
            // g.append("text")
            //     .attr("y", function(d){ return j*40+35})
            //     .attr("x", 0)
            //     .attr("class","label")
            //     .text(function(d,i){return concepts[j]})
            //     .style("fill", 'white')
            //     .style("font-size",'16')
            //     .on("mouseover", mouseover)
            //     .on("mouseout", mouseout);
        }

        function mouseover(p) {
            var g = d3.select(this).node().parentNode;
            d3.select(g).selectAll("rect").style("display","none");
            d3.select(g).selectAll("text.value").style("display","block");
        }

        function mouseout(p) {
            var g = d3.select(this).node().parentNode;
            d3.select(g).selectAll("rect").style("display","block");
            d3.select(g).selectAll("text.value").style("display","none");
        }
	});
}
