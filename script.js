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

class App{
   #map;
   #mapEvent;

    constructor(){
        this._getPosition();
        form.addEventListener('submit',this._newWorkout.bind(this))
        inputType.addEventListener('change',this._toggleElevationField)
    }

    _getPosition(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function(){
                alert("Cannot get your location");
            })
        }
    }

    _loadMap(position){
        // console.log(position)
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
    
        const coord = [latitude, longitude]
        this.#map = L.map('map').setView(coord, 13);
    
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { 
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.#map);
    
        //handling map clicks
        this.#map.on('click',  this._showForm.bind(this));
    }

    _showForm(e){
        this.#mapEvent = e;
            form.classList.remove('hidden');
            inputDistance.focus();
    }

    _toggleElevationField(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e){
        e.preventDefault()
        
            //clearing input fields
            inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = ''
        
            //display marker
            const {lat,lng} = this.#mapEvent.latlng
            var marker = L.marker([lat,lng]).addTo(this.#map).bindPopup(L.popup({
                maxWidth:250,
                minWidth:100,
                autoClose:false,
                closeOnClick:false,
                className:'running-popup'
            }))
            .setPopupContent('Workout')
            .openPopup();
    }
}

const app = new App();

