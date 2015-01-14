// Base map
var osmLayer = new ol.layer.Tile({source: new ol.source.OSM()});

// Census map layer
var wmsLayer = new ol.layer.Image({
  source: new ol.source.ImageWMS({
    url: 'http://student.ifip.tuwien.ac.at/geoserver/wms',
    params: {'LAYERS': 'g02_2014:normalized_1'}
  }),
  opacity: 0.6
});

// Map object
olMap = new ol.Map({
  target: 'map',
  renderer: 'canvas',
  layers: [osmLayer, wmsLayer],
  view: new ol.View({
    center: ol.proj.transform([16.37, 48.21], 'EPSG:4326', 'EPSG:3857'),
    zoom: 11,
    maxZoom: 18
  })
});

// Load variables into dropdown
$.get("Wohnstandortanalyse/Datenbeschreibung.txt", function(response) {
  // We start at line 3 - line 1 is column names, line 2 is not a variable
  $(response.split('\n').splice(2)).each(function(index, line) {
    $('#topics').append($('<option>')
      .val(line.substr(0, 20).trim())
      .html(line.substr(20, 106).trim()));
  });
});

// Add behaviour to dropdown
$('#topics').change(function() {
  wmsLayer.getSource().updateParams({
    'viewparams': 'column:' + $('#topics>option:selected').val()
  });
});

// Create an ol.Overlay with a popup anchored to the map
var popup = new ol.Overlay({
  element: $('#popup')
});
olMap.addOverlay(popup);

// Handle map clicks to send a GetFeatureInfo request and open the popup
olMap.on('singleclick', function(evt) {
  var view = olMap.getView();
  var url = wmsLayer.getSource().getGetFeatureInfoUrl(evt.coordinate,
      view.getResolution(), view.getProjection(), {'INFO_FORMAT': 'text/html'});
  popup.setPosition(evt.coordinate);
  $('#popup-content iframe').attr('src', url);
  $('#popup')
    .popover({content: function() { return $('#popup-content').html(); }})
    .popover('show');
  // Close popup when user clicks on the 'x'
  $('.popover-title').click(function() {
    $('#popup').popover('hide');
  });
  
  $('.popover form')[0].onsubmit = function(e) {
  var feature = new ol.Feature();
  feature.setGeometryName('Geometry');
  feature.setGeometry(new ol.geom.Point(evt.coordinate));
  feature.set('comment', this.comment.value);
  var xml = new ol.format.WFS().writeTransaction([feature], null, null, {
    featureType: 'comments', featureNS: 'http://geoweb/2014/g02',
    gmlOptions: {srsName: 'EPSG:3857'}
  });
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://student.ifip.tuwien.ac.at/geoserver/wfs', true);
  xhr.onload = function() {
    wmsLayer.getSource().updateParams({});
    alert('Thanks for your comment.');
  };
  xhr.send(new XMLSerializer().serializeToString(xml));
  e.preventDefault();
};

});

// Submit query to Nominatim and zoom map to the result's extent
var form = document.forms[0];
form.onsubmit = function(evt) {
  var url = 'http://nominatim.openstreetmap.org/search?format=json&q=';
  url += form.query.value;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onload = function() {
    var result = JSON.parse(xhr.responseText);
    if (result.length > 0) {
      var bbox = result[0].boundingbox;
      olMap.getView().fitExtent(ol.proj.transform([parseFloat(bbox[2]),
          parseFloat(bbox[0]), parseFloat(bbox[3]), parseFloat(bbox[1])],
          'EPSG:4326', 'EPSG:3857'), olMap.getSize());
    }
  };
  xhr.send();
  evt.preventDefault();
};

var carsharing = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
  url: 'http://student.ifip.tuwien.ac.at/geoserver/g02_2014/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=g02_2014:normalized_1&maxFeatures=50&outputFormat=json',
  projection: 'EPSG:3857'
}),
 style: new ol.style.Style({
       image: new ol.style.Icon({
          src: 'http://student.ifip.tuwien.ac.at/geoweb/2014/g02/Datensaetze/g02_carsharing/carsharing.png',
        })
      
    })
}); 
document.getElementById('carsharing').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(Carsharing);
  }else{
    olMap.removeLayer(Carsharing);
  }
};

var Haltestellen = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
  url: 'http://student.ifip.tuwien.ac.at/geoserver/g02_2014/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=g02_2014:g02_2014_Haltestellen&maxFeatures=50&outputFormat=json',
  projection: 'EPSG:3857'
}),
 style: new ol.style.Style({
       image: new ol.style.Icon({
          src: 'http://student.ifip.tuwien.ac.at/geoweb/2014/g02/Datensaetze/g02_haltestellen/haltestellen.png',
        })
      
    })
}); 
document.getElementById('haltestellen').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(Haltestellen);
  }else{
    olMap.removeLayer(Haltestellen);
  }
};

var Hundezonen = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
  url: 'http://student.ifip.tuwien.ac.at/geoserver/g02_2014/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=g02_2014:g02_Hundezonen&maxFeatures=50&outputFormat=json',
  projection: 'EPSG:3857'
}),
 style: new ol.style.Style({
       image: new ol.style.Icon({
          src: 'http://student.ifip.tuwien.ac.at/geoweb/2014/g02/Datensaetze/g02_hundezonen/hundezonen.png',
        })
      
    })
}); 
document.getElementById('Hundezonen').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(Hundezonen);
  }else{
    olMap.removeLayer(Hundezonen);
  }
};

var Radwege = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
  url: 'http://student.ifip.tuwien.ac.at/geoserver/g02_2014/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=g02_2014:RADWEGEOGDLine&maxFeatures=50&outputFormat=json',
  projection: 'EPSG:3857'
}),
 style: new ol.style.Style({
       image: new ol.style.Icon({
          src: 'http://student.ifip.tuwien.ac.at/geoweb/2014/g02/Datensaetze/g02_Radwege/Radwege.png',
        })
      
    })
}); 
document.getElementById('Bezirksgrenzen').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(Radwege);
  }else{
    olMap.removeLayer(Radwege);
  }
};

var Bezirksgrenzen = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
  url: 'http://student.ifip.tuwien.ac.at/geoserver/g02_2014/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=g02_2014:g02_Bezirksgrenzen1&maxFeatures=50&outputFormat=json',
  projection: 'EPSG:3857'
}),
 style: new ol.style.Style({
       image: new ol.style.Icon({
          src: 'http://student.ifip.tuwien.ac.at/geoweb/2014/g02/Datensaetze/g02_Bezirksgrenzen/Bezirksgrenzen.png',
        })
      
    })
}); 
document.getElementById('Bezirksgrenzen').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(Bezirksgrenzen);
  }else{
    olMap.removeLayer(Bezirksgrenzen);
  }
};
