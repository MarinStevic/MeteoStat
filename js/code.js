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
        }
    });
}

map.on('click', onMapClick);