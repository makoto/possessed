d3.csv("./data/every_five_seconds.csv", function(data) {
  data = data.map(function(row){
    row.video_time_sec = parseInt(row.video_time_sec)
    return row
  })
  // Data = data
  var width = 885
    ,height = 100

  var svg = d3.select("#possession").append("svg")
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
    
  pop = Popcorn("#mcfc");

  var idx = 0

  var draw = function(data){
    groupEnter = groupEnter
      .append('a')
        .attr('xlink:href', function(d){return '#' + d.game_time})
        .on('click', function(d,i){
          // Resetting index count to the clicked position
          idx = i
          pop.play(d.video_time_sec)
          d3.select('#footnotediv').attr('class', null)
        })

    var prev = function(d,i){
      return data[i - 1] || {video_time_sec:0}
    }


    groupEnter.append('rect')
      .attr("y", 10)
      .attr("x", function(d,i){
        return l(prev(d,i).video_time_sec - d3.min(secs))
      })
      .attr("width", function(d,i){
        var diff = d.video_time_sec - prev().video_time_sec
        return l(diff)
      })
      .attr('height',40)
      .attr("class",  function(d){return d.possession})

    groupEnter.append("circle")
    .attr("cy", 28.5)
    .attr("cx", function(d,i){
      return l(d.video_time_sec - (d3.min(secs) + 2.5))
    })
    .attr("r", function(d){
      var r = 0
      if (d.narration != '') {r = 4};
      return r;
    })
    .style('fill', 'white')

  }

  draw(data)

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

   if (data[idx] && data[idx].video_time_sec < this.video.currentTime) {
     var current_event = data[idx]
     d3.select('#footnotediv').attr('class', current_event.possession)
     if (current_event.narration != "") {
        d3.select('#footnotediv').text(current_event.narration)
     };

     var element = (d3.selectAll('rect')[0][idx])

     //  Highlighting element while playing
     d3.select(element).attr('class', 'g').transition().delay(5000).attr('class', current_event.possession)

    idx++
   }
  })
})
