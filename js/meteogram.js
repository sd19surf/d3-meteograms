/* js to make meteograms
Long term project to build meteograms on the fly for AF weather forecasters
use perl derived tarp data from any model.
*/

// Build a display container using d3.js

function titleArea(icao,div){

    d3.json("./data/"+icao+"_gfs_tarp.json", function(error, data) {
        if (error) throw error;
        // format the data
      d3.select(div).append("span")
        d3.select("span").append("p")
       // .append("img")
       // .attr("src","./img/1-WXG-(Metallic).png")
       // .attr("width", "50px")
       // .attr("height", "50px")
        .attr("text",data["ICAO"])
        .text("Meteogram for "+data.ICAO+" Lat: "+data.LAT+ " Lon: "+data.LON+" Valid:" +d3.min(data["LAND-surface()"], function(d) { return getDate(d); })+" to "+d3.max(data["LAND-surface()"], function(d) { return getDate(d); }));
   
    });
}

function lineGraph(icao,div,parameter,add){
// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 175 - margin.top - margin.bottom;


// set the ranges
var x = d3.scaleBand().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);



// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
if (add){
var svg = d3.select(div).select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
}else{
    var svg = d3.select(div).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")"); 
}
// gridlines in x axis function
function make_x_gridlines() {		
    return d3.axisBottom(x)
        .ticks(5)
}

// gridlines in y axis function
function make_y_gridlines() {		
    return d3.axisLeft(y)
        .ticks(5)
}

// Get the data
d3.json("./data/"+icao+"_gfs_tarp.json", function(error, data) {
  if (error) throw error;
    var lineType = parameter.split("-");
    console.log(data);
  // format the data
  data[parameter].forEach(function(d) {
      d.time = d.time;
	    d.value = +d.value;
    
  });

  // define the line
if(lineType == "TMP"){
var valueline = d3.line()
.x(function(d) { return x(getDate(d)); })
.y(function(d) { return y(KToC(d.value)); });
}else{
    var valueline = d3.line()
    .x(function(d) { return x(getDate(d)); })
    .y(function(d) { return y(d.value); });

}
  // Scale the range of the data
  if(lineType=="TMP"){
  x.domain(data[parameter].map(function(d) {return getDate(d); }));
  y.domain([d3.min(data[parameter], function(d) { return KToC(d.value); })-1, d3.max(data[parameter], function(d) { return KToC(d.value); })+1]);
  }else{
    x.domain(data[parameter].map(function(d) {return getDate(d); }));
    y.domain([d3.min(data[parameter], function(d) { return d.value; })-1, d3.max(data[parameter], function(d) { return d.value; })+1]);
        
  }
  // add the X gridlines
  svg.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
          .tickSize(-height)
          .tickFormat("")
      )

  // add the Y gridlines
  if(add){
  }else{
  svg.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
      )
  }

          // text label for the y axis
          svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text(parameter);

  // add the valueline path.
  svg.append("path")
      .data([data[parameter]])
      .attr("class", lineType[0]+"-line")
      .attr("d", valueline);

  // add the X Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .text("Date")
      .call(d3.axisBottom(x));

  // add the Y Axis
  if(add){
  svg.append("g")
      .attr("transform", "translate(-30,0)")
      .call(d3.axisLeft(y));
  }else{
    svg.append("g")
      .call(d3.axisLeft(y));    
  }

});



}//end lineGraph

function zoomLineGraph(icao,div,parameter,add,options){

  //need to check options and assign defaults
  //can take 2 parameters


  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = 1000 - margin.left - margin.right,
      height = 175 - margin.top - margin.bottom;
  
  // append the svg object to the body of the page
  var svg = d3.select(div)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


var dataset = []; 
  //Read the data
  d3.json("./data/"+icao+"_gfs_tarp.json",function(error, data) {
          if (error) {
              throw error;
          }else{
            //change to accept param1 and param2 with optional units
                data[parameter.param1].forEach(function(d){
                  data[parameter.param2].forEach(function(d1){
                    if (d.time == d1.time){
                          dataset.push({
                            "time": d.time,
                            "dewpt": unitConvert("dewpt",[unitConvert("C",d1.value),d.value]),
                            "temp": unitConvert("C",d1.value)
                          })
                        }
                      })
                    })
                  }
  
   // Add X axis --> it is a date format
   var x = d3.scaleTime()
        .domain(d3.extent(dataset, function(d) { return new Date(d.time); }))
        .range([ 0, width ]);
      xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "zoomline")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d/%HZ")));
  
      // Add Y axis
      var y = d3.scaleLinear()
        .domain([d3.min(dataset, function(d) { return d.dewpt; }), d3.max(dataset, function(d) { return d.temp; })])
        .range([ height, 0 ]);
      yAxis = svg.append("g")
        .call(d3.axisLeft(y));


  // gridlines in x axis function
  function make_x_gridlines() {		
    return d3.axisBottom(x)
        .ticks(10)
  }
  
  // gridlines in y axis function
  function make_y_gridlines() {		
    return d3.axisLeft(y)
        .ticks(10)
  }

         // add the X gridlines
         svg.append("g")			
         .attr("class", "grid")
         .attr("transform", "translate(0," + height + ")")
         .call(make_x_gridlines()
             .tickSize(-height)
             .tickFormat("")
         )
   
     // add the Y gridlines
     svg.append("g")			
         .attr("class", "grid")
         .call(make_y_gridlines()
             .tickSize(-width)
             .tickFormat("")
         )
     
  
    
      

        // text label for the y axis
  svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x",0 - (height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("stroke", options.LabelColor)
  .style("fill", options.LabelColor)
  .text(options.LabelText +" "+ options.units);

 
      // Add a clipPath: everything out of this area won't be drawn.
          var clip = svg.append("defs").append("svg:clipPath")
          .attr("id", "clip")
          .append("svg:rect")
          .attr("width", width )
          .attr("height", height )
          .attr("x", 0)
          .attr("y", 0);
  
      // Add brushing
      var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
          .extent( [ [0,0], [width,height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
          .on("end", updateChart)               // Each time the brush selection changes, trigger the 'updateChart' function
  
      // Create the line variable: where both the line and the brush take place
      var line = svg.append('g')
        .attr("clip-path", "url(#clip)")
  
          // Add the line
          line.append("path")
        .datum(dataset)
        .on("mouseover", onMouseOver) //Add listener for the mouseover event
        .on("mouseout", onMouseOut)   //Add listener for the mouse
        .attr("class", "line")  // I add the class line to be able to modify this line later on.
        .attr("fill", "none")
        .attr("stroke", options.LabelColor)
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return x(new Date(d.time)) })
          .y(function(d) { return y(d.dewpt) })
          )

          // Add the line2
          var line2 = svg.append('g')
          .attr("clip-path", "url(#clip)")
          line2.append("path")
        .datum(dataset)
        .on("mouseover", onMouseOver) //Add listener for the mouseover event
        .on("mouseout", onMouseOut)   //Add listener for the mouse
        .attr("class", "line2")  // I add the class line to be able to modify this line later on.
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return x(new Date(d.time)) })
          .y(function(d) { return y(d.temp) })
          )

  
      // Add the brushing
      line
        .append("g")
          .attr("class", "brush")
          .call(brush);
      line2
      .append("g")
      .attr("class", "brush")
      .call(brush);       
  
      // A function that set idleTimeOut to null
      var idleTimeout
      function idled() { idleTimeout = null; }
  
      // A function that update the chart for given boundaries
      function updateChart() {
  
        // What are the selected boundaries?
        extent = d3.event.selection
  
        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if(!extent){
          if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
          x.domain([ 4,8])
        }else{
          x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
          line.select(".brush").call(brush.move, null)
          //line2.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }
  
        // Update axis and line position
        xAxis.transition().duration(1000).call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d/%HZ")))
        line
            .select('.line')
            .transition()
            .duration(1000)
            .attr("d", d3.line()
              .x(function(d) { return x(new Date(d.time)) })
              .y(function(d) { return y(d.dewpt) })
            )
        line2
            .select('.line2')
            .transition()
            .duration(1000)
            .attr("d", d3.line()
              .x(function(d) { return x(new Date(d.time)) })
              .y(function(d) { return y(d.temp) })
            )

      }
  
      // If user double click, reinitialize the chart
      svg.on("dblclick",function(){
        x.domain(d3.extent(dataset, function(d) { return new Date(d.time); }))
        xAxis.transition().call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d/%HZ")))
        line
          .select('.line')
          .transition()
          .attr("d", d3.line()
            .x(function(d) { return x(new Date(d.time)) })
            .y(function(d) { return y(d.dewpt) })
        )
        line2
          .select('.line2')
          .transition()
          .attr("d", d3.line()
            .x(function(d) { return x(new Date(d.time)) })
            .y(function(d) { return y(d.temp) })
        )
      })

      //mouseover event handler function
function onMouseOver(d, i) {
  d3.select(this).attr('class', 'highlight');
  svg.append("text")
   .attr('class', 'val') 
   .attr('x', function() {
       return x(new Date(d.time));
   })
   .attr('y', function() {
       return y(d.dewpt) - 15;
   })
   .text(function() {
       return [ d.dewpt +" "+getDate(d)];  // Value of the text
   });
}

//mouseout event handler function
function onMouseOut(d, i) {
  // use the text label class to remove label on mouseout
  d3.select(this).attr('class', 'line');
  d3.selectAll('.val')
    .remove()
}
  
        
  });
  } //end zoomable linegraph

function zoomBarGraph(icao,div,parameter,add,options){
   // set the dimensions and margins of the graph
   var margin = {top: 20, right: 20, bottom: 30, left: 50},
   width = 1000 - margin.left - margin.right,
   height = 175 - margin.top - margin.bottom;


// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
if (add){
var svg = d3.select(div).select("svg")
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
 .append("g")
   .attr("transform",
         "translate(" + margin.left + "," + margin.top + ")");
}else{
   var svg = d3.select(div).append("svg")
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
 .append("g")
   .attr("transform",
         "translate(" + margin.left + "," + margin.top + ")"); 
}


// Parse the Data
d3.json("./data/"+icao+"_gfs_tarp.json", function(error, data) {
    if (error) throw error;
      var lineType = parameter.split("-");
    // format the data
    data[parameter].forEach(function(d) {
        d.time = new Date (d.time);
        d.value = unitConvert(options.units,d.value);
  
    });
// X axis

   // Add X axis --> it is a date format
   let x = d3.scaleTime()
        .domain(d3.extent(data[parameter], function(d) { return new Date(d.time); }))
        .range([ 0, width ]);
      xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d/%HZ")));
  
      // Add Y axis
      let y = d3.scaleLinear()
        .domain([d3.min(data[parameter], function(d) { return unitConvert(options.units,d.value); }), d3.max(data[parameter], function(d) { return unitConvert(options.units,d.value); })])
        .range([ height, 0 ]);
      yAxis = svg.append("g")
        .call(d3.axisLeft(y));

  // gridlines in x axis function
function make_x_gridlines() {		
  return d3.axisBottom(x)
      .ticks(20)
}

// gridlines in y axis function
function make_y_gridlines() {		
  return d3.axisLeft(y)
      .ticks(10)
}
  // add the X gridlines
  svg.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
          .tickSize(-height)
          .tickFormat("")
      )

  // add the Y gridlines
  if(add){
  }else{
  svg.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
      )
  }


svg.append("g")
  .call(d3.axisLeft(y));

        // text label for the y axis
        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(options.LabelText+" "+options.units);

// Bars
svg.selectAll("mybar")
    .data(data[parameter])
    .enter()
  .append("rect")
    .on("mouseover", onMouseOver) //Add listener for the mouseover event
    .on("mouseout", onMouseOut)   //Add listener for the mouse
    .attr("x", function(d) { return x(new Date(d.time)); })
    .attr("y", function(d) { return y(unitConvert(options.units,d.value)); })
    .attr("width", 10)
    .attr("height", function(d) { return height - y(unitConvert(options.units,d.value)); })
    .attr("fill-opacity", "0.5;")
    .attr("fill",options.LabelColor)



//mouseover event handler function
function onMouseOver(d, i) {
    d3.select(this).attr('class', 'highlight');
    d3.select(this)
      .transition()     // adds animation
      .duration(400)
      .attr('width', 10 + 3)
      .attr("y", function(d) { return y(unitConvert(options.units,d.value)) - 10; })
      .attr("height", function(d) { return height - y(unitConvert(options.units,d.value)) + 10; });

    svg.append("text")
     .attr('class', 'val') 
     .attr('x', function() {
         return x(new Date(d.time));
     })
     .attr('y', function() {
         return y(unitConvert(options.units,d.value)) - 15;
     })
     .text(function() {
         return [ unitConvert(options.units,d.value)+""+options.units+" at "+getDate(d)];  // Value of the text
     });
}

//mouseout event handler function
function onMouseOut(d, i) {
    // use the text label class to remove label on mouseout
    d3.select(this).attr('class', 'bar');
    d3.select(this)
      .transition()     // adds animation
      .duration(400)
      .attr('width', 10)
      .attr("y", function(d) { return y(unitConvert(options.units,d.value)); })
      .attr("height", function(d) { return height - y(unitConvert(options.units,d.value)); });

    d3.selectAll('.val')
      .remove()
}



})
  } // end zoomable bargraph

function barGraph(icao,div,parameter,add,options){
      // set the dimensions and margins of the graph
      var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 1000 - margin.left - margin.right,
      height = 175 - margin.top - margin.bottom;
   
   
   // set the ranges
   var x = d3.scaleBand().range([0, width]);
   var y = d3.scaleLinear().range([height, 0]);
   
   
   
   // append the svg obgect to the body of the page
   // appends a 'group' element to 'svg'
   // moves the 'group' element to the top left margin
   if (add){
   var svg = d3.select(div).select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
   }else{
      var svg = d3.select(div).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")"); 
   }
   // gridlines in x axis function
   function make_x_gridlines() {		
      return d3.axisBottom(x)
          .ticks(20)
   }
   
   // gridlines in y axis function
   function make_y_gridlines() {		
      return d3.axisLeft(y)
          .ticks(10)
   }
   
   
   
   // Parse the Data
   d3.json("./data/"+icao+"_gfs_tarp.json", function(error, data) {
       if (error) throw error;
         var lineType = parameter.split("-");
       // format the data
       data[parameter].forEach(function(d) {
           d.time = new Date (d.time);
           d.value = +d.value;
     
       });
   // X axis
   
   x.domain(data[parameter].map(function(d) {return getDate(d); }));
   y.domain([d3.min(data[parameter], function(d) { return d.value; })-1, d3.max(data[parameter], function(d) { return d.value; })+1]);
   
     // add the X gridlines
     svg.append("g")			
         .attr("class", "grid")
         .attr("transform", "translate(0," + height + ")")
         .call(make_x_gridlines()
             .tickSize(-height)
             .tickFormat("")
         )
   
     // add the Y gridlines
     if(add){
     }else{
     svg.append("g")			
         .attr("class", "grid")
         .call(make_y_gridlines()
             .tickSize(-width)
             .tickFormat("")
         )
     }
   
   svg.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x))
     .selectAll("text")
       .attr("transform", "translate(-10,0)rotate(-45)")
       .style("text-anchor", "end");
   
   // Add Y axis
   
   svg.append("g")
     .call(d3.axisLeft(y));
   
           // text label for the y axis
           svg.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 0 - margin.left)
           .attr("x",0 - (height / 2))
           .attr("dy", "1em")
           .style("text-anchor", "middle")
           .text(options.LabelText+""+options.units);
   
   // Bars
   svg.selectAll("mybar")
       .data(data[parameter])
       .enter()
     .append("rect")
       .on("mouseover", onMouseOver) //Add listener for the mouseover event
       .on("mouseout", onMouseOut)   //Add listener for the mouse
       .attr("x", function(d) { return x(getDate(d)); })
       .attr("y", function(d) { return y(d.value); })
       .attr("width", x.bandwidth())
       .attr("height", function(d) { return height - y(d.value); })
       .attr("fill-opacity", "0.5;")
       .attr("fill","#69b3a2")
   
   
   
   //mouseover event handler function
   function onMouseOver(d, i) {
       d3.select(this).attr('class', 'highlight');
       d3.select(this)
         .transition()     // adds animation
         .duration(400)
         .attr('width', x.bandwidth() + 5)
         .attr("y", function(d) { return y(d.value) - 10; })
         .attr("height", function(d) { return height - y(d.value) + 10; });
   
       svg.append("text")
        .attr('class', 'val') 
        .attr('x', function() {
            return x(getDate(d));
        })
        .attr('y', function() {
            return y(d.value) - 15;
        })
        .text(function() {
            return [ d.value+"% at "+getDate(d)];  // Value of the text
        });
   }
   
   //mouseout event handler function
   function onMouseOut(d, i) {
       // use the text label class to remove label on mouseout
       d3.select(this).attr('class', 'bar');
       d3.select(this)
         .transition()     // adds animation
         .duration(400)
         .attr('width', x.bandwidth())
         .attr("y", function(d) { return y(d.value); })
         .attr("height", function(d) { return height - y(d.value); });
   
       d3.selectAll('.val')
         .remove()
   }
   
   
   
   })
  } // end regular bargraph





function topContourGraph(icao,div,parameterInfo,add){
  //levels: "200,250,500,700,850,925,1000",
  //parameterShortName: "RH,TMP,UGRD,VGRD"

 var parameter = parameterInfo.parameterShortName[0]+'-'+parameterInfo.levels[0]+' mb()';
  // loop through each level and each param and plot accordingly
 var topDataset=[];
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    var svg = d3.select(div)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
    
    // read data
    d3.json("./data/"+icao+"_gfs_tarp.json", function(error, data) {
        if (error) throw error;
        // build datasets for the winds etc...
        for (var i = 0; i < parameterInfo.levels.length; i++){
          var tempDataset=[];
          var lev = parameterInfo.levels[i];
          var levelName = "H"+lev+"mb";
            data["RH-"+lev+" mb()"].forEach(function(d){
              data["TMP-"+lev+" mb()"].forEach(function(d1){
                data["UGRD-"+lev+" mb()"].forEach(function(d2){
                  data["VGRD-"+lev+" mb()"].forEach(function(d3){
                    if (d.time == d1.time && d.time == d2.time && d.time == d3.time){
                      tempDataset.push({
                        "level": lev,
                        "time": d.time,
                        "rh": d.value,
                        "temp": unitConvert("C",d1.value),
                        "wspd": windSpeed(d2.value,d3.value),
                        "wdir": windDirection(d2.value,d3.value)
                      })
                    }
                  })
                })
              })
            })
          var key = levelName;
          var obj = {};
          obj[key]=tempDataset;
          topDataset.push(obj);
        }
       // console.log(topDataset);
     
 // Add X axis --> it is a date format
 var x = d3.scaleTime()
      .domain(d3.extent(data[parameter], function(d) { return new Date(d.time); }))
      .range([ 0, width ]);
    xAxis = svg.append("g")
      //.attr("class","windGraph")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d/%HZ")));

    // Add Y axis
    var y = d3.scaleLinear()   
      .domain([d3.max(parameterInfo.levels),d3.min(parameterInfo.levels)])
      .range([ height, 0 ]);
    yAxis = svg.append("g")
      .call(d3.axisLeft(y)); 
      

    
      // Prepare a color palette
      var color = d3.scaleLinear()
          .domain([0, 100]) // Points per square pixel.
          .range(["white", "darkgreen"])
    
          // add the X gridlines
      svg.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
          .tickSize(-height)
          .tickFormat("")
      )
    
    // add the Y gridlines
    if(add){
    }else{
    svg.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
      )
    }
    
    
    // gridlines in x axis function
    function make_x_gridlines() {		
    return d3.axisBottom(x)
        .ticks(20)
    }
    
    // gridlines in y axis function
    function make_y_gridlines() {		
    return d3.axisLeft(y)
        .ticks(10)
    }
makeBarbTemplates(svg);

//build the winds
for (var i=0;i<topDataset.length;i++){
    svg.selectAll("barbs")
    .data(topDataset[i]['H'+parameterInfo.levels[i]+'mb'])
    .enter()
    .append("g")
    .on("mouseover", onMouseOver) //Add listener for the mouseover event
    .on("mouseout", onMouseOut)   //Add listener for the mouse
    .attr("class", "windbarb")
    //.attr("id", parameterInfo.levels[i]+" "+pad(d.wdir,3)+pad(d.wspd,2))
    .append(function(d) { 
        var wndspd = Math.round(d.wspd/5)*5;
        if (wndspd > 0){
        var barbWnd = document.getElementById('barb'+wndspd);
        var clone = barbWnd.cloneNode(true);
        clone.setAttribute('id','clone_barb_'+wndspd);
        return clone;
        }else{
          var circles = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circles.setAttribute("r",5);
          return circles;
        }
     })
     .attr("transform", function(d) {
      var rotateDir;

      if (parseFloat(d.wdir) >= 180){
        rotateDir = parseFloat(d.wdir) - 180;
      }else{
        rotateDir = parseFloat(d.wdir) + 180;
      }
        return "translate("+x(new Date(d.time))+","+y(d.level)+") rotate("+(rotateDir)+")"; })
    }
    // build the data displays 
    
     //compute the density data
  for(var i = 0;i < topDataset.length; i++){
      var densityData = d3.contourDensity()
        .x(function(d) { return x(new Date(d.time)); })
        .y(function(d) { return y(d.level); })
        .weight(function(d) {return d.rh*1000;})
        .size([width, height])
        .bandwidth(15)
        //(topDataset)
        (topDataset[i]['H'+parameterInfo.levels[i]+'mb'])
    
      // show the shape!
 
      svg.insert("g", "g")
        .selectAll("path")
        .data(densityData,function(d){})
        .enter().append("path")
          .attr("d", d3.geoPath())
          //.attr("fill", "none")
          //.attr("stroke", "#69b3a2")
         // .attr("stroke-linejoin", "round")
          .attr("fill", function(d) { return color(d.value); })
          .attr("opacity",function(d){return d.value/100;})

  }

       //compute the temp data lines
       // build a rect on top of the original graph with
    // Add a Y 2 Axis
    var y2 = d3.scaleLinear()
        .domain(-20,40)
        .range([height,0]);
      y2Axis = svg.append("g")
        .attr("transform","translate("+width+",0)")
        .call(d3.axisRight(y2));



//mouseover event handler function
function onMouseOver(d, i) {
  d3.select(this).attr('class', 'windbarb');
  svg.append("text")
   .attr('class', 'val') 
   .attr('x', function() {
       return x(new Date(d.time));
   })
   .attr('y', function() {
       return y(d.level) - 15;
   })
   .text(function() {
       return [ pad(d.wdir,3)+""+pad(d.wspd,2)+"kt at "+getDate(d)+"\n"+d.rh];  // Value of the text
   })
   .attr("fill",function(d){return "red"});
}

//mouseout event handler function
function onMouseOut(d, i) {
  // use the text label class to remove label on mouseout
  d3.select(this).attr('class', 'windbarb');
  d3.selectAll('.val')
    .remove()
}

    })
  
    }

function windGraph(icao,div,parameter,add,options){
//requires three parameters param,param1,param2
// param = spd of winds to be graphed
// param1 = u component of wind level
// param2 = v component of wind level

  //plots the u and v components as wind barbs across a graph
   // set the dimensions and margins of the graph
   var margin = {top: 20, right: 20, bottom: 30, left: 50},
   width = 1000 - margin.left - margin.right,
   height = 175 - margin.top - margin.bottom;

  var svg = d3.select('#temp_section').append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")"); 


makeBarbTemplates(svg); //create and append a library of all wind barbs from 0 to 200kts

// Parse the Data
d3.json("./data/"+icao+"_gfs_tarp.json", function(error, data) {
  if (error) throw error;
  // format the data
  //build dataset for winds
  var windDataset =[];
  //console.log(data);
  data[parameter.param1].forEach(function(d) {
    data[parameter.param2].forEach(function(d1){
        if(d.time == d1.time){
          windDataset.push({
            "time": d.time,
            "wdir": windDirection(d.value,d1.value),
            "wspd": windSpeed(d.value,d1.value)
          });
        }
    })
      d.time = new Date (d.time);
      d.value = unitConvert(options.units,d.value);
  })
  
  //});
// X axis

 // Add X axis --> it is a date format
 var x = d3.scaleTime()
      .domain(d3.extent(data[parameter.param], function(d) { return new Date(d.time); }))
      .range([ 0, width ]);
    xAxis = svg.append("g")
      //.attr("class","windGraph")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()   
      .domain([d3.min(data[parameter.param], function(d) { return unitConvert(options.units,d.value); }), d3.max(data[parameter.param], function(d) { return unitConvert(options.units,d.value); })])
      .range([ height, 0 ]);
    yAxis = svg.append("g")
      .call(d3.axisLeft(y));

// gridlines in x axis function
function make_x_gridlines() {		
return d3.axisBottom(x)
    .ticks(5)
}

// gridlines in y axis function
function make_y_gridlines() {		
return d3.axisLeft(y)
    .ticks(5)
}
// add the X gridlines
svg.append("g")			
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .call(make_x_gridlines()
        .tickSize(-height)
        .tickFormat("")
    )

// add the Y gridlines
if(add){
}else{
svg.append("g")			
    .attr("class", "grid")
    .call(make_y_gridlines()
        .tickSize(-width)
        .tickFormat("")
    )
}


svg.append("g")
.call(d3.axisLeft(y));

      // text label for the y axis
      svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(options.LabelText+" "+options.units);

      svg.selectAll("mygusts")
      .data(data[parameter.param])
      .enter()
    .append("circle")
      //.on("mouseover", onMouseOver) //Add listener for the mouseover event
      //.on("mouseout", onMouseOut)   //Add listener for the mouse
      .attr("r",3)
      .attr("cx", function(d) { return x(new Date(d.time)); })
      .attr("cy", function(d) { return y(unitConvert(options.units,d.value)); })
      //.attr("width", 10)
      //.attr("height", function(d) { return height - y(unitConvert(options.units,d.value)); })
      .attr("fill-opacity", "0.5;")
      .attr("fill",options.LabelColor)

      svg.selectAll("barbs")
      .data(windDataset)
      .enter()
      .append("g")
      .attr("class", "windbarb")
      .attr("transform", function(d) { return "translate("+x(new Date(d.time))+","+y(height)+") rotate("+(d.wdir+180)+")"; })
      .append(function(d) { 
          var wndspd = Math.round(d.wspd/5)*5;
          if (wndspd > 0){
          var barbWnd = document.getElementById('barb'+wndspd);
          var clone = barbWnd.cloneNode(true);
          clone.setAttribute('id','clone_barb_'+wndspd);
          return clone;
          }else{
            var circles = document.createElementNS("http://www.w3.org/2000/svg", "circle");
              circles.setAttribute("r",5);
            return circles;
          }
       })
      

});



}

// weather functions...might need to break these out as another library

function windSpeed(ucomp, vcomp){
  return windKTs(Math.sqrt((ucomp*ucomp)+(vcomp*vcomp))).toFixed(0);
}

function windDirection(ucomp,vcomp){  
  var radians = Math.atan((vcomp/ucomp));
  var windDir;
  if (ucomp > 0 && vcomp > 0){
    windDir = (180/Math.PI)*radians;
  }else if (ucomp < 0 && vcomp < 0 ){
    windDir = ((180/Math.PI)*radians)+180;
  }else if (ucomp > 0 && vcomp < 0){
    windDir = ((180/Math.PI)*radians)+360;
  }else if(ucomp < 0 && vcomp > 0){
   windDir = ((180/Math.PI)*radians)+180;
  }
 return windDir.toFixed(0);
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
    }

    function getDate(d) {
    var dt = new Date(d.time);
    dayTime = dt.getDate()+"/"+pad(dt.getHours(),2)+"Z";
    return dayTime;
}

	function KToC(temp){
		return temp - 273.15;

  }
  
  function millibars(rawPress){
    return rawPress/100;
  }

  function mbToinHG(rawPress){
    var pressure = millibars(rawPress)*0.02953;
    return pressure.toFixed(2);
  }

  function windKTs(mps){
    //meters per sec to knots
    return mps*1.94384449;
  }

  function unitConvert(unit,value){

    switch(unit){
      case "mb":
        return millibars(value);
        break;
      case "C":
        return KToC(value);
        break;
      case "kts":
        return windKTs(value);
        break;
      case "inHg":
        return mbToinHG(value);
        break;
      case "dewpt":
        return RHtoDewpt(value);
        break;
      case "abshum":
        return absHum(value);
        break;
      default:
        return value;
    }
  }
 //absolute Humidity g/m3
  function absHum([temp, dewpt]){
    //accepts array of temp and dewpt in C returns abs in g/m3  
    return ((2165 * ((6.11*10^(7.5*dewpt/(237.7+dewpt))) * 0.1)) / (temp + 273.16));

  }
//lifted index
function liftedIndex(){}

//altimeter setting
function alstg(elevation, stationpressure){
  return (stationpressure - 0.3) * (1 + (((1013.25^0.190284 * 0.0065)/288) * (elevation/(stationpressure -0.3)^0.190284)))^(1/0.190287);
}

// Dewpoint from RH and Temp
function RHtoDewpt([Tc,RH]){

  return (Tc - (14.55 + 0.114 * Tc) * (1 - (0.01 * RH)) - ((2.5 + 0.007 * Tc) * (1 - (0.01 * RH))) ^ 3 - (15.9 + 0.117 * Tc) * (1 - (0.01 * RH)) ^ 14)
}








var makeBarbTemplates = function(svg){
  var container = svg.append("g").attr("id", "container"); //container 
  var barbsize = 25;
		var speeds = d3.range(5,200,5);
		var barbdef = container.append('defs')
		speeds.forEach(function(d) {
			var thisbarb = barbdef.append('g').attr('id', 'barb'+d);
			var flags = Math.floor(d/50);
			var pennants = Math.floor((d - flags*50)/10);
			var halfpennants = Math.floor((d - flags*50 - pennants*10)/5);
			var px = barbsize;
			// Draw wind barb stems
			thisbarb.append("line").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", barbsize);
			// Draw wind barb flags and pennants for each stem
			for (var i=0; i<flags; i++) {
				thisbarb.append("polyline")
					.attr("points", "0,"+px+" -10,"+(px)+" 0,"+(px-4))
					.attr("class", "flag");
				px -= 7;
			}
			// Draw pennants on each barb
			for (i=0; i<pennants; i++) {
				thisbarb.append("line")
					.attr("x1", 0)
					.attr("x2", -10)
					.attr("y1", px)
					.attr("y2", px+4)
				px -= 3;
			}
			// Draw half-pennants on each barb
			for (i=0; i<halfpennants; i++) {
				thisbarb.append("line")
					.attr("x1", 0)
					.attr("x2", -5)
					.attr("y1", px)
					.attr("y2", px+2)
				px -= 3;
			}
    });	
    return container;	
  }
  

 