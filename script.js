'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
    #map;
    #mapEvent;
    #workouts = [];

    constructor() {
        // get position
        this._getPosition();

        // get data from local storage
        this._getLocalStorage();

        // adding event listeners for the whole app
        form.addEventListener('submit', this._newWorkout.bind(this))
        inputType.addEventListener('change', this._toggleElevationField)
        containerWorkouts.addEventListener('click',this._moveToWorkout.bind(this))  
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert("Cannot get your location");
            })
        }
    }

    _loadMap(position) {
        // console.log(position)
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        const coord = [latitude, longitude]
        this.#map = L.map('map').setView(coord, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.#map);

        //handling map clicks
        this.#map.on('click', this._showForm.bind(this));

        // load workouts on map from local storage
        this.#workouts.forEach(workout => this._renderWorkoutMarker(workout))
    }

    _showForm(e) {
        this.#mapEvent = e;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _hideForm(){
        //clearing input fields
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = ''
        
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(()=>form.style.display = "grid",1000)
    }   

    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        // function to check if the inputs are valid
        const isValidInputs = (...inputs) => inputs.every((inp) => Number.isFinite(inp))

        // function to check if the inputs are positive
        const isPositive = (...inputs) => inputs.every((inp) => inp > 0)

        e.preventDefault()

        // get input values
        const type = inputType.value
        const duration = +inputDuration.value
        const distance = +inputDistance.value
        const { lat, lng } = this.#mapEvent.latlng
        let workout;

        // if the workout is running, create running object
        if (type === "running") {
            const cadence = +inputCadence.value
            // check if the data is valid
            if (!isValidInputs(distance, duration, cadence) || !isPositive(distance, duration, cadence)) {
                return alert("Inputs have to be positive numbers")
            }
            workout = new Running([lat, lng], distance, duration, cadence)
        }

        // if the workout is cycling, create cycling object
        if (type === "cycling") {
            const elevation = +inputElevation.value
            // check if the data is valid
            if (!isValidInputs(distance, duration, elevation) || !isPositive(distance, duration)) {
                return alert("Inputs have to be positive numbers")
            }
            workout = new Cycling([lat, lng], distance, duration, elevation)
        }

        // add the  new object to the workout array
        this.#workouts.push(workout)

        // render workout on map
        this._renderWorkoutMarker(workout)

        // render workout on list
        this._renderWorkout(workout)

        // hide form
        this._hideForm()

        // set workkouts to local storage
        this._setLocalStorage()
    }

    _renderWorkoutMarker(workout) {
        var marker = L.marker(workout.coords).addTo(this.#map).bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`
        }))
            .setPopupContent(`${workout.type === "running" ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
            .openPopup();
    }

    _renderWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
              <span class="workout__icon">${workout.type === "running" ? '🏃‍♂️' : '🚴‍♀️'}</span>
              <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
              <span class="workout__unit">min</span>
            </div>
        `

        if(workout.type === "running"){
            html+= `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(1)}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">🦶🏼</span>
                  <span class="workout__value">${workout.cadence}</span>
                  <span class="workout__unit">spm</span>
                </div>
            </li>
            `
        }

        if(workout.type === "cycling"){
            html+= `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed.toFixed(1)}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">⛰</span>
                  <span class="workout__value">${workout.elevationGain}</span>
                  <span class="workout__unit">m</span>
                </div>
            </li>
            `
        }

        form.insertAdjacentHTML("afterend",html);
    }

    _moveToWorkout(e){
        const clickedEle = e.target.closest('.workout')
        // console.log(clickedEle)

        if(!clickedEle) return;
        const workout = this.#workouts.find(work => work.id === clickedEle.dataset.id)
        // console.log(workout)
        
        this.#map.setView(workout.coords,13,{
            animate:true,
            pan:{
                duration:1
            }
        })
    }

    _setLocalStorage(){
        localStorage.setItem('workouts',JSON.stringify(this.#workouts));
    }

    _getLocalStorage(){
        const data = JSON.parse(localStorage.getItem('workouts'));

        if(!data) return;
        this.#workouts = data;

        this.#workouts.forEach(workout => this._renderWorkout(workout))
    }

    reset(){
        localStorage.removeItem('workouts')
        location.reload();
    }
}

///////////////////////////////////////////////
class Workout {

    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords; // [lat, lng]
        this.distance = distance; // km
        this.duration = duration; // min
    }

    _setDescription(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}

///////////////////////////////////////////////
class Running extends Workout {
    type = "running";
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace() {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

///////////////////////////////////////////////
class Cycling extends Workout {
    type = "cycling";
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        // km/hr
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

const app = new App();