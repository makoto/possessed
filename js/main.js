
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
    
  var pop = Popcorn("#mcfc");

  groupEnter = groupEnter
    .append('a')
      .attr('xlink:href', function(d){return '#' + d.game_time})
      .on('click', function(d){
        pop.play(d.video_time_sec)
        d3.select('#footnotediv').attr('class', null)
      })
  
  groupEnter.append('rect')
    .attr("y", 10)
    .attr("x", function(d,i){
      var prev = data[i - 1] || {video_time_sec:0}
      return l(prev.video_time_sec - d3.min(secs))
    })
    .attr("width", function(d,i){
      var prev = data[i - 1] || {video_time_sec:0}
      var diff = d.video_time_sec - prev.video_time_sec
      return l(diff)
    })
    .attr('height',20)
    .attr("class",  function(d){return d.possession})


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
  idx = 0
  pop.on('timeupdate', function(a){
   // console.log('idx', idx, data[idx])
   if (data[idx] && data[idx].video_time_sec < this.video.currentTime) {
     var current_event = data[idx]
     // console.log(idx,'passed', this.video.currentTime, current_event , data.length)
     d3.select('#footnotediv').attr('class', current_event.possession)
     var text = ""
     if (current_event.narration != "") {
       text = text + current_event.narration
     };
     var element = (d3.selectAll('rect')[0][idx])

     d3.select(element)
      .style('stroke', 'gold')

     pop.footnote({
       start: current_event.video_time_sec + 1,
       end: current_event.video_time_sec + 5 ,
       text: text,
       target: "footnotediv"
     });
    idx++
   }
  })

  // play the video right away
  // pop.play();
})
