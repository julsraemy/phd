document.addEventListener("DOMContentLoaded", function() {
  var mapElement = document.getElementById('map');
  
  if (mapElement) {
    var iiifUrl = mapElement.getAttribute('data-iiif-url'); // Get the IIIF URL from the data attribute
    var map = L.map('map', {
      center: [0, 0], // Center coordinates might need to be adjusted based on your IIIF image
      crs: L.CRS.Simple,
      zoom: 0,
    });

    if (iiifUrl) { // Ensure the URL is present before attempting to add it to the map
      L.tileLayer.iiif(iiifUrl).addTo(map);
    }
  }
});