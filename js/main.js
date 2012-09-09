d3.csv("./data/every_five_seconds.csv", function(data) {
  data = data.map(function(row){
    row.video_time_sec = parseInt(row.video_time_sec)
    return row
  })
  Data = data
  
  // Data = data
  var width = 885
    ,height = 200
    ,image_size = 40

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
    
  getAttrIdx = function(name){
    return {
      video_time:0,
      video_time_sec:1,
      game_time:2,
      team:3,
      narration:4,
      player:5
    }[name]
  }
    
  pop = Popcorn("#mcfc");

  State = {
    idx:0,
    attr:null,
    val: null
  }

  var draw = function(data){
    var prev = function(d,i){
      return data[i - 1] || {video_time_sec:0}
    }

    var players = _.pluck(data, 'player')
    //  Making sure that blank comes first so that I can assign grey
    var unique_players = _.uniq([""].concat(players))
    // console.log('unique players', unique_players)
    var color = d3.scale.category10().domain(unique_players).range(['grey', 'yellow', 'green', 'purple', 'pink'])


    groupEnter
      .append('a')
        .attr('xlink:href', function(d){return '#' + d.game_time})
        .on('click', function(d,i){
          State.idx = i
          State.attr = 'all'
          State.val  = d['all']
          pop.play(d.video_time_sec)
          d3.select('#footnotediv').attr('class', null)
        })
      .append('rect')
        .attr('class', function(d){return "indicator "})
        .attr("y", 2)
        .attr("x", function(d,i){
          return l(prev(d,i).video_time_sec - d3.min(secs))
        })
        .attr("width", function(d,i){
          var diff = d.video_time_sec - prev().video_time_sec
          return l(diff)
        })
        .attr('height',40)
        // .attr("class",  function(d){return d.possession})

    groupEnter
      .append('text')
        .attr("y", 15)
        .attr("x", function(d,i){
          return l(prev(d,i).video_time_sec - (d3.min(secs) - 0.5))
        })
        .text(function(d,i){return   d.game_time})
        .attr('fill', 'white')
        .attr('font-size', '11px')
        // .attr("dy", ".35em")
        // .attr("text-anchor", "middle")



    groupEnter
      .append('a')
        .attr('xlink:href', function(d){return '#' + d.game_time})
        .on('click', function(d,i){
          State.idx = i
          State.attr = 'team'
          State.val  = d['team']
          pop.play(d.video_time_sec)
          d3.select('#footnotediv').attr('class', null)
        })
      .append('rect')
        .attr('class', 'team')
        .attr("y", 40)
        .attr("x", function(d,i){
          return l(prev(d,i).video_time_sec - d3.min(secs))
        })
        .attr("width", function(d,i){
          var diff = d.video_time_sec - prev().video_time_sec
          return l(diff)
        })
        .attr('height',40)
        .attr("class",  function(d){return d.team})

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

    groupEnter
      .append('a')
        .attr('xlink:href', function(d){return '#' + d.game_time})
        .on('click', function(d,i){
          State.idx = i
          State.attr = 'player'
          State.val  = d['player']
          pop.play(d.video_time_sec)
          d3.select('#footnotediv').attr('class', null)
        })
      .append("svg:image")
        .attr("y", 80)
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
   if (this.video.currentTime > 385) {
     pop.pause()
   };
   var element = (d3.selectAll('.indicator')[0][State.idx])
   //  Highlighting element while playing
   
   d3.selectAll('.indicator').attr('class', function(d){return "indicator "})
   d3.select(element).attr('class', 'indicator g')

   var current = data[State.idx]

   // if (data[State.idx].video_time_sec < this.video.currentTime) {
     // console.log('timeupdate', State.idx, data[State.idx].video_time_sec < this.video.currentTime, this.video.currentTime)
   // };
   d3.select('#footnotediv')
    .attr('class', function(d){ return current.team })
    .text(current.narration)
   

   if (current && current.video_time_sec < this.video.currentTime) {
   //   var now = State.idx
   //   var now_event = function(){return data[now]}
   //   // var current_event = function(){return data[State.idx]}
   //   var next_event = function(){return data[State.idx + 1]}
   // 
   //   if (now_event()[State.attr] != next_event()[State.attr]) {
   //     
   //     while(now_event()[State.attr] != next_event()[State.attr]){
   //       console.log('while:','now', now,'idx',State.idx,'current', current_event()[State.attr] ,'next',next_event()[State.attr])
   //       State.idx ++
   //       // console.log(State.idx, State.attr, current_event[State.attr] == next_event[State.attr], 'c',current_event[State.attr],'n', next_event[State.attr])
   //     }
   //      console.log('skipping:','now', now, 'idx',State.idx, 'next idx',State.idx + 1,  next_event()[State.attr], next_event().video_time_sec)
   //      pop.play(current_event().video_time_sec)
   //   }else{
   //     State.idx++
   //   };


     // State.idx++
     var next = data[State.idx + 1]
   
     if (State.val != next[State.attr]) {
       console.log('mismatch', State.val ,next[State.attr])
       while(next && State.val != next[State.attr]){
         console.log('Incrementing ', State.attr, State.val,State.idx, State.val, current[State.attr], next[State.attr])
         State.idx++
         var next = data[State.idx]
       }
       console.log('Skipping ', State.idx)
       if (next) {
         pop.play(next.video_time_sec)
       }else{
         pop.pause()
       };

     
     }else{
       console.log('going to next ', State.idx++, State.val, current[State.attr], next[State.attr])
     };
   
   }
   
   
  })
})
