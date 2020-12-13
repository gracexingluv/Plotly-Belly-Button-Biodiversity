var path = "/samples.json";
var currentIndex = 0;

d3.json(path).then((data) => {
    // load drop down menu is number of option is 0
    var options = d3.select("#selDataset");
    options.selectAll("option").data(data.names).enter().append("option").text(function(d) {return d});
    
    makeVis(data);
});

var makeVis = function(data) {
    // function to handle change in drop down menu
    var dropdownChange = function() {
        var currentOption = d3.select(this).property('value');
        currentIndex = data.names.indexOf(currentOption);
        // console.log(currentIndex);

        candidataData = searchByIndex(data, currentIndex)

        // redraw on change
        drawBar(candidataData, "bar", newPlot=false);
        drawBubble(candidataData, "bubble", newPlot=false);
        drawGauge(candidataData, "gauge", newPlot=false);
        showCandidateInfo(candidataData.metadata, "candidate-metadata");
    }

    // Handler for dropdown value change
    var dropdown = d3.select("#selDataset")
        .on("change", dropdownChange);

    // first draw!
    var candidataData = searchByIndex(data, 0);
    drawBar(candidataData, "bar", newPlot=true);
    drawBubble(candidataData, "bubble", newPlot=true);
    drawGauge(candidataData, "gauge", newPlot=true);
    showCandidateInfo(candidataData.metadata, "candidate-metadata");
}

// function for drawing bar chart
function drawBar(data, divName, newPlot=true) {
    var data = [{
        type: 'bar',
        x: data.otuValues,
        y: data.otuTextIDs,
        orientation: 'h',
        text: data.otuLabels
    }];

    var layout = { width: 500, height: 250, margin: { t: 30, b: 0 } };
    
    if (newPlot) {
        Plotly.newPlot(divName, data, layout);
    }
    else {
        Plotly.animate(
            divName, 
            {
                data: data,
                traces: [0],
                layout: 0
            }, 
            {
                transition: {
                    duration: 600,
                    easing: 'cubic-in-out'
                },
                frame: {
                    duration: 500
                }            
            }
        )
    } 
}

// function for drawing bubble chart
function drawBubble(data, divName, newPlot=true) {
    // reorder data by otu ID
    var reorderData = data;
   
    reorderData.sort(function(first, second) {
        return first.otuIDs - second.otuIDs;
    });

    var data = [{
        mode: 'markers',
        x: reorderData.map(x => x.otuTextIDs),
        y: reorderData.map(x => x.otuValues),
        text: reorderData.map(x => x.otuLabels),
        marker: {
            color: reorderData.map(x => x.otuIDs),
            size: reorderData.map(x => x.otuValues)
        }
    }];

    var layout = { width: 1000, height: 500, margin: { t: 30, b: 50 } };

    if (newPlot) {
        Plotly.newPlot(divName, data, layout);
    }
    else {
        Plotly.animate(
            divName, 
            {
                data: data,
                traces: [0],
                layout: 0
            }, 
            {
                transition: {
                    duration: 500,
                    easing: 'cubic-in-out'
                },
                frame: {
                    duration: 500
                }            
            }
        )
    } 
}

// function for drawing gauge
function drawGauge(data, divName, newPlot=true) {
    var data = [
        {
            domain: { x: [0, 1], y: [0, 1] },
            delta: {increasing: { color: "RebeccaPurple" } },
            value: data.metadata.wfreq,
            title: {text: "Belly Button Washing Frequency"},
            type: "indicator",
            mode: "gauge+number",
            gauge: {
                axis: { range: [null, 9], tickwidth: 1},
                bar: { color: "darkblue" },
                bgcolor: "white",
                borderwidth: 2,
                bordercolor: "gray",
              }
        }
    ];
    
    var layout = { width: 500, height: 250, margin: { t: 30, b: 0 } };

    if (newPlot) {
        Plotly.newPlot(divName, data, layout);
    }
    else {
        Plotly.animate(
            divName, 
            {
                data: data,
                traces: [0],
                layout: 0
            }, 
            {
                transition: {
                    duration: 300,
                    easing: 'cubic-in-out'
                },
                frame: {
                    duration: 800
                }            
            },
            layout
        )
    } 
}

// function to display candidate info
function showCandidateInfo(data, divName) {
    tag = document.getElementById(divName)
    while(tag.firstChild) { 
        tag.removeChild(tag.firstChild); 
    }
    for (attr in data) {
        var node = document.createElement("p");                 
        var textnode = document.createTextNode(attr[0].toUpperCase() + attr.slice(1, attr.length) + ":" + data[attr]);         
        node.appendChild(textnode);                              
        tag.appendChild(node);  
    };
}

// search individual's info by index
function searchByIndex(data, p, maxNum=10) {
    candidataData = {
        "otuTextIDs": data.samples[p]["otu_ids"].slice(0, maxNum).reverse().map(id => 'OTU ' + id.toString() + '   '),
        "otuIDs": data.samples[p]["otu_ids"].slice(0, maxNum).reverse(),
        "otuValues": data.samples[p]["sample_values"].slice(0, maxNum).reverse(),
        "otuLabels": data.samples[p]["otu_labels"].slice(0, maxNum).reverse(),
        "metadata": data.metadata[p],
    }

    return candidataData
}
