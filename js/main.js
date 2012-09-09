d3.csv("./data/every_five_seconds.csv", function(data) {
  data = data.map(function(row){
    row.video_time_sec = parseInt(row.video_time_sec)
    return row
  })
  // Data = data
  var width = 885
    ,height = 100
    ,image_size = 38

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
    var prev = function(d,i){
      return data[i - 1] || {video_time_sec:0}
    }

    var players = _.pluck(data, 'player')
    //  Making sure that blank comes first so that I can assign grey
    var unique_players = _.uniq([""].concat(players))
    console.log('unique players', unique_players)
    var color = d3.scale.category10().domain(unique_players).range(['grey', 'yellow', 'green', 'purple', 'pink'])


    groupEnter
      .append('rect')
        .attr('class', function(d){return "indicator " + d.possession})
        .attr("y", 2)
        .attr("x", function(d,i){
          return l(prev(d,i).video_time_sec - d3.min(secs))
        })
        .attr("width", function(d,i){
          var diff = d.video_time_sec - prev().video_time_sec
          return l(diff)
        })
        .attr('height',10)
        // .attr("class",  function(d){return d.possession})


    groupEnter
      .append('a')
        .attr('xlink:href', function(d){return '#' + d.game_time})
        .on('click', function(d,i){
          idx = i
          pop.play(d.video_time_sec)
          d3.select('#footnotediv').attr('class', null)
        })
      .append('rect')
        .attr('class', 'team')
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

    groupEnter.append("svg:image")
        .attr("y", 60)
        .attr("x", function(d,i){
          return l(prev(d,i).video_time_sec - d3.min(secs))
        })
        .attr("width", image_size) 
        .attr("height", image_size)
        .attr("xlink:href",function(d){
          var name = d.player
          return 'image/' + (d.player || 'blank') + '.png';
        }) 
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
     d3.select('#footnotediv')
      .attr('class', current_event.possession)
      .text(current_event.narration)

     Idx = idx
     var element = (d3.selectAll('.indicator')[0][idx])
     // console.log('element', element)
     //  Highlighting element while playing
     d3.select(element).attr('class', 'indicator g').transition().delay(5000).attr('class', "indicator " + current_event.possession)

    idx++
   }
  })
})
