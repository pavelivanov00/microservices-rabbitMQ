const mapboxToken = "pk.eyJ1IjoicGF2ZWwwMCIsImEiOiJjbGdtY2NkZTkwNGlqM2xvMjhzM28ybWRtIn0.872Ont4Kr37G7x-JP3P3Jg"

mapboxgl.accessToken = mapboxToken;
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [longitude, latitude],
    zoom: 18
});

new mapboxgl.Marker()
    .setLngLat([longitude, latitude])
    .addTo(map);