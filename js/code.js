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

//Showing the selected city
function locateAndShowCity(lat, lon, name) {
    var popup = L.popup()
        .setLatLng([lat, lon])
        .setContent("City: " + name)
        .openOn(map);
    map.setView([lat, lon],13);
}

function onMapClick(e) {
    var popup = L.popup();
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);