var init = false;

//Toggling the sidebar
function toggleNav() {
    if(document.getElementById("mySidebar").style.width == "400px") {
        document.getElementById("mySidebar").style.width = "0";
        document.getElementById("main").style.marginLeft = "0";
    }
    else {
        document.getElementById("mySidebar").style.width = "400px";
        document.getElementById("main").style.marginLeft = "400px";
    }
}

//Creating the map
var map = L.map( 'map', {
    center: [44.404582, 16.573679],  //Zagreb: 45.8150269, 15.9818139
    minZoom: 2,
    zoom: 7
});

L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: ['a','b','c']
}).addTo( map );

//Add cities to sidebar
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    var myObj = JSON.parse(this.responseText);
    for (var i = 0; i < myObj.length; i++){
        var city = {
            'data': {
                'name': myObj[i].city,  //city name
                'lat': myObj[i].lat,    //city lat
                'lon': myObj[i].lng,    //city lon
            },
        }
        sidebarTableAddCity(city,"city-list-table");
    }
  }
};
xmlhttp.open("GET", "../hr.json", true);
xmlhttp.send();

//Add cities to the map sidebar table
function sidebarTableAddCity(city,table){
    var sidebarTable  = document.getElementById(String(table));

    var sidebarTableRow = document.createElement('tr');
    sidebarTableRow.className = String(table) + "-row";
    
    var sidebarTableCell_name = sidebarTableRow.insertCell();
    var name = document.createElement('p');
    name.innerHTML = city.data.name;
    name.className = "sidebar-table-cell";
    sidebarTableCell_name.appendChild(name);
    
    var sidebarTableCell_location = sidebarTableRow.insertCell();
    sidebarTableCell_location.innerHTML = '<i class="fas fa-crosshairs fa-2x" onclick="locateAndShowCity(' + city.data.lat + ',' + city.data.lon + ',\'' + city.data.name + '\')"></i>';
    
    //Sort the cities while adding them to the map sidebar table
    var rows = sidebarTable.getElementsByTagName("TR"), rowCell, i;
    if (rows.length == 1) {
        sidebarTable.appendChild(sidebarTableRow);
    }
    else {
        for (i = 1; i < (rows.length); i++) {
            rowCell = rows[i].getElementsByTagName("TD")[0];
            if (sidebarTableCell_name.firstChild.innerHTML.toLowerCase() < rowCell.firstChild.innerHTML.toLowerCase()){
                sidebarTable.insertBefore(sidebarTableRow, rows[i]);
                return;
            }
        }
        sidebarTable.appendChild(sidebarTableRow);
    }
}

//Search cities in the map sidebar table
function sidebarSearch(input,table) {
    var input, filter, table, tr, td, i;
    input = document.getElementById(String(input));
    filter = input.value.toUpperCase();
    table = document.getElementById(String(table));
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            }
            else {
                tr[i].style.display = "none";
            }
        }
    }
}

function getImageData(station) {
    var imageUrl;
    var imageWidth = 75;
    var imageHeight = 75;
    var imageUrlTemplate = 'https://openweathermap.org/img/w/{icon}.png';
    if (station.weather && station.weather[0] && station.weather[0].icon) {
        imageUrl = imageUrlTemplate.replace('{icon}', station.weather[0].icon);
    } else if (station.type && station.type == 1) {
        imageUrl = 'https://openweathermap.org/img/s/iplane.png';
        imageWidth = 25;
        imageHeight = 25;
    } else {
        imageUrl = 'https://openweathermap.org/img/s/istation.png';
        imageWidth = 25;
        imageHeight = 25;
    }
    return {url: imageUrl, width: imageWidth, height: imageHeight};
}

function convertTimestamp(tstmp) {
    return (new Date(tstmp*1000));
}

//Showing the selected city
function locateAndShowCity(lat, lon, name) {
    $.ajax({
        url: 'https://api.openweathermap.org/data/2.5/onecall?units=metric&lat='+lat+'&lon='+lon+'&exclude=minutely,daily,alerts&appid=6e56fb3433479d82ffab33418b64eb3b',
        async: false,
        dataType: 'json',
        success: function (response) {
            //console.log(response);
            var station = response.current;

            var txt = '<div class="owm-popup-name">';
            txt += name;
            txt += '</div>';
            if (typeof station.weather != 'undefined' && typeof station.weather[0] != 'undefined') {
                if (typeof station.weather[0].description != 'undefined'/* && typeof station.weather[0].id != 'undefined'*/) {
                    txt += '<div class="owm-popup-description">'
                        + station.weather[0].description// + ' (' + station.weather[0].id + ')'
                        + '</div>';
                }
            }
            var imgData = getImageData(station);
            txt += '<div class="owm-popup-main"><img src="' + imgData.url + '" width="' + imgData.width
                    + '" height="' + imgData.height + '" border="0" />';
            if (typeof station != 'undefined' && typeof station.temp != 'undefined') {
                txt += '<span class="owm-popup-temp">' + station.temp
                    + '&nbsp;°C</span>';
            }
            txt += '</div>';
            txt += '<div class="owm-popup-details">';
            if (typeof station != 'undefined') {
                if (typeof station.humidity != 'undefined') {
                    txt += '<div class="owm-popup-detail">'
                        + 'Humidity'
                        + ': ' + station.humidity + '&nbsp;%</div>';
                }
                if (typeof station.pressure != 'undefined') {
                    txt += '<div class="owm-popup-detail">'
                        + 'Pressure'
                        + ': ' + station.pressure + '&nbsp;hPa</div>';
                }
                if (true) {
                    if (typeof station.temp_max != 'undefined' && typeof station.temp_min != 'undefined') {
                        txt += '<div class="owm-popup-detail">'
                            + 'Temp. min/max'
                            + ': '
                                + station.temp_min
                            + '&nbsp;/&nbsp;'
                            + station.temp_max
                            + '&nbsp;°C</div>';
                    }
                }
            }
            if (station.rain != null && typeof station.rain != 'undefined' && typeof station.rain['1h'] != 'undefined') {
                txt += '<div class="owm-popup-detail">'
                    + 'Rain (1h)'
                    + ': ' + station.rain['1h'] + '&nbsp;ml</div>';
            }
            if (typeof station.wind_speed != 'undefined' && typeof station.wind_deg != 'undefined') {
                if (typeof station.wind_speed != 'undefined') {
                    txt += '<div class="owm-popup-detail">';
                    txt += 'Wind' + ': '
                        + station.wind_speed + '&nbsp;'
                        + 'm/s';
                    txt += '</div>';
                }
                if (typeof station.wind_deg != 'undefined') {
                    txt += '<div class="owm-popup-detail">';
                    txt += 'Direction' + ': ';
                    txt += station.wind_deg + '°';
                    txt += '</div>';
                }
            }
            if (typeof station.dt != 'undefined' && true) {
                txt += '<div class="owm-popup-timestamp">';
                txt += '(' + convertTimestamp(station.dt) + ')';
                txt += '</div>';
            }
            txt += '</div>';
            var popup = L.popup()
                .setLatLng([lat, lon])
                .setContent(txt)
                .openOn(map);
            map.setView([lat, lon],13);
            
            var data = [];

            for (var i = 0; i < response.hourly.length; i++){
                var reading = {
                    "temperature": response.hourly[i].temp,
                    "timestamp": convertTimestamp(response.hourly[i].dt)
                }
                data.push(reading);
            }
            draw(data);
        }
    });
}

function onMapClick(e) {
    var lat = e.latlng.lat;
    var lon = e.latlng.lng;
    $.ajax({
        url: 'https://api.openweathermap.org/data/2.5/onecall?units=metric&lat='+lat+'&lon='+lon+'&exclude=minutely,daily,alerts&appid=6e56fb3433479d82ffab33418b64eb3b',
        async: false,
        dataType: 'json',
        success: function (response) {
            //console.log(response);
            var station = response.current;

            var txt = '<div class="owm-popup-name">';
            txt += name;
            txt += '</div>';
            if (typeof station.weather != 'undefined' && typeof station.weather[0] != 'undefined') {
                if (typeof station.weather[0].description != 'undefined'/* && typeof station.weather[0].id != 'undefined'*/) {
                    txt += '<div class="owm-popup-description">'
                        + station.weather[0].description// + ' (' + station.weather[0].id + ')'
                        + '</div>';
                }
            }
            var imgData = getImageData(station);
            txt += '<div class="owm-popup-main"><img src="' + imgData.url + '" width="' + imgData.width
                    + '" height="' + imgData.height + '" border="0" />';
            if (typeof station != 'undefined' && typeof station.temp != 'undefined') {
                txt += '<span class="owm-popup-temp">' + station.temp
                    + '&nbsp;°C</span>';
            }
            txt += '</div>';
            txt += '<div class="owm-popup-details">';
            if (typeof station != 'undefined') {
                if (typeof station.humidity != 'undefined') {
                    txt += '<div class="owm-popup-detail">'
                        + 'Humidity'
                        + ': ' + station.humidity + '&nbsp;%</div>';
                }
                if (typeof station.pressure != 'undefined') {
                    txt += '<div class="owm-popup-detail">'
                        + 'Pressure'
                        + ': ' + station.pressure + '&nbsp;hPa</div>';
                }
                if (true) {
                    if (typeof station.temp_max != 'undefined' && typeof station.temp_min != 'undefined') {
                        txt += '<div class="owm-popup-detail">'
                            + 'Temp. min/max'
                            + ': '
                                + station.temp_min
                            + '&nbsp;/&nbsp;'
                            + station.temp_max
                            + '&nbsp;°C</div>';
                    }
                }
            }
            if (station.rain != null && typeof station.rain != 'undefined' && typeof station.rain['1h'] != 'undefined') {
                txt += '<div class="owm-popup-detail">'
                    + 'Rain (1h)'
                    + ': ' + station.rain['1h'] + '&nbsp;ml</div>';
            }
            if (typeof station.wind_speed != 'undefined' && typeof station.wind_deg != 'undefined') {
                if (typeof station.wind_speed != 'undefined') {
                    txt += '<div class="owm-popup-detail">';
                    txt += 'Wind' + ': '
                        + station.wind_speed + '&nbsp;'
                        + 'm/s';
                    txt += '</div>';
                }
                if (typeof station.wind_deg != 'undefined') {
                    txt += '<div class="owm-popup-detail">';
                    txt += 'Direction' + ': ';
                    txt += station.wind_deg + '°';
                    txt += '</div>';
                }
            }
            if (typeof station.uvi != 'undefined') {
                if (typeof station.uvi != 'undefined') {
                    txt += '<div class="owm-popup-detail">';
                    txt += 'UV index' + ': '
                        + station.uvi + '&nbsp;';
                    txt += '</div>';
                }
            }
            if (typeof station.dt != 'undefined' && true) {
                txt += '<div class="owm-popup-timestamp">';
                txt += '(' + convertTimestamp(station.dt) + ')';
                txt += '</div>';
            }
            txt += '</div>';
            var popup = L.popup()
                .setLatLng([lat, lon])
                .setContent(txt)
                .openOn(map);
            map.setView([lat, lon]);
            
            var data = [];

            for (var i = 0; i < response.hourly.length; i++){
                var reading = {
                    "temperature": response.hourly[i].temp,
                    "timestamp": convertTimestamp(response.hourly[i].dt)
                }
                data.push(reading);
            }
            draw(data);
        }
    });
}

map.on('click', onMapClick);

//Temperature graph
const xValue = d => d.timestamp;
const xLabel = 'Past 2 days';
const yValue = d => d.temperature;
const yLabel = 'Temperature';
const margin = { left: 120, right: 50, top: 60, bottom: 120 };

var elmnt = document.getElementById("graph");
var parseTime = d3.timeParse("%d-%b-%y");
var formatTime = d3.timeFormat("%B %d\n%I %p");
const svg = d3.select('svg');
const width = elmnt.offsetWidth;
const height = elmnt.offsetHeight;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
const xAxisG = g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`);
const yAxisG = g.append('g');

const xScale = d3.scaleTime();
const yScale = d3.scaleLinear();

const xAxis = d3.axisBottom()
    .scale(xScale)
    .tickPadding(15)
    .ticks(10)
    .tickSize(-innerHeight);

const yTicks = 5;
const yAxis = d3.axisLeft()
    .scale(yScale)
    .ticks(yTicks)
    .tickPadding(15)
    .tickSize(-innerWidth);

const line = d3.line()
    .curve(d3.curveBasis)   //commenting this line out will remove the smoothing of the graph line
    .x(d => xScale(xValue(d)))
    .y(d => yScale(yValue(d)));

const row = d => {
    d.timestamp = new Date(d.timestamp);
    d.temperature = +d.temperature;
    return d;
};

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function initGraph() {
    if (!init) {
        xAxisG.append('text')
            .attr('class', 'axis-label')
            .attr('x', innerWidth / 2)
            .attr('y', 100)
            .text(xLabel);

        yAxisG.append('text')
            .attr('class', 'axis-label')
            .attr('x', -innerHeight / 2)
            .attr('y', -60)
            .attr('transform', `rotate(-90)`)
            .style('text-anchor', 'middle')
            .text(yLabel);
    }
}

var br = 0;

function draw(data) {
    data.forEach(function(d) {
        d.date = parseTime(d.timestamp);
        d.temperature = +d.temperature;
    });

    initGraph();

    const t = d3.transition().duration(1000)
    
    xScale.domain(d3.extent(data, xValue))
        .range([0, innerWidth]);

    yScale.domain(d3.extent(data, yValue))
        .range([innerHeight, 0])
        .nice(yTicks);

    g.append('path')
        .attr('fill', 'none')
        .attr('class', 'line')
        .attr("stroke", 'steelblue')
        .attr('stroke-width', 4);

    if(br == 0) {
        br += 1;
        g.selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", 4)
            .attr("cx", function(d) { return xScale(d.timestamp); })
            .attr("cy", function(d) { return yScale(d.temperature); })
            .on("mouseover", function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(formatTime(d.timestamp) + "<br/>" + d.temperature + "°C")
                    .style("left", (d3.event.pageX-40) + "px")
                    .style("top", (d3.event.pageY-60) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    } else {
        g.selectAll("circle")
            .data(data)
            .transition(t)
            .attr("cx", function(d) { return xScale(d.timestamp); })
            .attr("cy", function(d) { return yScale(d.temperature); })
    }
    
    const chart = g.select('.line')
        .datum(data);

    chart.exit().remove()

    const enter = chart.enter();
    
    enter.merge(chart)
        .transition(t)
        .attr("d", line(data));

    xAxisG.call(xAxis);
    yAxisG.call(yAxis);
}

function instruct() {
    alert("Postoje 2 načina korištenja aplikacije:\n\n1. Kliknite bilo gdje na karti i otvoriti će vam se prozor s trenutnim meteorološkim podatcima za traženo mjesto. Podatci se uzimaju s najbliže meteorološke postaje od odabranih koordinata.\n\n2. Otvorite izbornik s lijeve strane pritiskom na 3 ravne horiznotalne linije. Potom odaberite grad s popisa ili unesite ime traženog grada u tražilicu. Kada ste odabrali svoj grad pritisnite ciljnik koji se pojavljuje s desne strane imena grada i na karti će vam se pojaviti trenutni meteorološki podatci za traženi grad.\n\n\nOdabirom mjesta također se pojavljuju temperaturni podatci za protekla 2 dana na grafu ispod karte.");
}
