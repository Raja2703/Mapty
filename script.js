'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(position){
        console.log(position)
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        const coord = [latitude, longitude]
        const map = L.map('map').setView(coord, 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { 
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        
        
        map.on('click',  function(e) {
            const {lat,lng} = e.latlng
            var marker = L.marker([lat,lng]).addTo(map).bindPopup(L.popup({
                maxWidth:250,
                minWidth:100,
                autoClose:false,
                closeOnClick:false,
                className:'running-popup'
            }))
            .setPopupContent('Workout')
            .openPopup();
        });
    },function(){
        alert("Cannot get your location");
    })
}