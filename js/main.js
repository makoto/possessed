
d3.csv("./data/every_five_seconds.csv", function(data) {
  data = data.map(function(row){
    row.video_time_sec = parseInt(row.video_time_sec)
    return row
  })
  // Data = data
  var width = 885
    ,height = 100
    // ,data = [2,4,6, 10];


  var svg = d3.select("#posession").append("svg")
      .attr("class", "svg")
      .attr("width", width)
      .attr("height", height)

  var secs = _.pluck(data, 'video_time_sec')
  var color = d3.scale.category10().domain(['s', 'm', 'q']).range(['grey', 'blue', 'red'])
  
  var l = d3.scale.linear()
      .domain([0, d3.max(secs) - d3.min(secs)])
      .range([0, width]);
  
  var group = svg.selectAll(".group")
      .data(data, function(d){return d});

  var groupEnter = group.enter().append('g')
    .attr('class', 'group')

  var groupUpdate = group.transition().duration(1000)

  var groupExit = d3.transition(group.exit())
    .remove()
  
  groupEnter.append('rect')
    .attr("y", 10)
    .attr("x", function(d,i){
      var prev = data[i - 1] || {video_time_sec:0}
      // console.log(d.video_time_sec, prev.video_time_sec, d.video_time_sec - prev.video_time_sec)
      return l(prev.video_time_sec - d3.min(secs))
    })
    .attr("width", function(d,i){
      var prev = data[i - 1] || {video_time_sec:0}
      // console.log(d.video_time_sec, prev.video_time_sec, d.video_time_sec - prev.video_time_sec)
      var diff = d.video_time_sec - prev.video_time_sec
      return l(diff)
    })
    .attr('height',10)
    .attr("class",  function(d){return d.possession})

  // groupUpdate.select('rect')
  //   .attr("y", function(d){return l(d)})
  
    
  
  
  
  // Create a popcorn instance by calling Popcorn("#id-of-my-video")
  var pop = Popcorn("#mcfc");

  pop.cue( 1, function() {
    //  Play from last 5 min of the game
     var start_time = (60 * 4) + 25
     this.play( start_time );
  });

  // Callback when paused
  // , 'timeupdate'
  // ['pause', 'play', 'seeked', 'seeking', 'playing'].forEach(function(e){
  //   pop.on(e, function(a){Paused = this; console.log(e, this.video.currentTime)})
  // })
  pop.on('timeupdate', function(a){
   if (data.length > 0 && data[0].video_time_sec < this.video.currentTime) {
     var current_event = data.shift()
     console.log('passed', this.video.currentTime, current_event , data.length)
     d3.select('#footnotediv').attr('class', current_event.possession)
     var text = ""
     if (current_event.narration != "") {
       text = text + current_event.narration
     };

     pop.footnote({
       start: current_event.video_time_sec + 1,
       end: current_event.video_time_sec + 5 ,
       text: text,
       target: "footnotediv"
     });
   }
  })

  // play the video right away
  // pop.play();
})
