// Write your javascript code here

//Selectors

const searchInput = document.querySelector('.weather__search');
const city = document.querySelector('.weather__city');
const day = document.querySelector('.weather__day');
const humidity = document.querySelector('.weather__indicator--humidity>.value');
const wind = document.querySelector('.weather__indicator--wind>.value');
const pressure = document.querySelector('.weather__indicator--pressure>.value');
const image = document.querySelector('.weather__image');
const temp = document.querySelector('.weather__temperature>.value');
const forecastBlock = document.querySelector('.weather__forecast');
const web = document.querySelector('.weather_description');
const icons = document.querySelector('.weather__forecast__icon');
const suggestions = document.querySelector('#suggestions') 

//Image Icons Data
const weatherImages = [
    {
        url:'./images/clear-sky4.svg',
        ids: [800]
    },
    {
        url:'./images/broken-clouds3.svg',
        ids:[803 , 804]
    },
    {
        url:'./images/few-clouds4.svg',
        ids:[801]
    }, 
    {
        url:'./images/mist3.png',
        ids:[701, 711, 721, 731, 741, 751, 761, 762, 771, 781]
    }, 
    {
        url:'./images/rain4.svg',
        ids:[500 , 501, 502, 503, 504]
    }, 
    {
        url:'./images/scattered-clouds3.svg',
        ids:[802]
    },
    {
        url:'./images/shower-rain3.svg',
        ids:[520, 521, 522, 531]
    }, 
    {
        url:'./images/snow3.svg',
        ids:[600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622 ]
    }, 
    {
        url:'./images/thunderstorm3.svg',
        ids:[200, 201, 202, 210, 211, 212, 221, 230, 231, 232]
    }
]

//API end points
const weatherAPIKey = '2a7cb12f23e0b13bb6ab61d5c9c5a4b6';
const weatherBaseEndPoint = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${weatherAPIKey}`;
const forecastBaseEndPoint = `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${weatherAPIKey}`;
const cityBaseEndPoint = `https://api.teleport.org/api/cities/?search=`;

//Data fetch from servers

//get weather by city id

const getWeatherDataByCity = async (cityString) => {
    let city;
    if(cityString.includes(',')){
        city = cityString.slice(0, cityString.indexOf(',')) + 
        cityString.slice(cityString.lastIndexOf(','));
    }else {
        city = cityString;
    }
    console.log(cityString);
    console.log(city);
    let endpoint = `${weatherBaseEndPoint}&q=${city}`;
    let request = await fetch(endpoint);
    if(request.status !== 200){
        alert('Invalid city request');
        searchInput.value = '';
        return;
    }
    let data = await request.json();
   return data;
};

//Get weather forecast by city
   
const getForecastDataByCity = async (id) =>{
    const endpoint = `${forecastBaseEndPoint}&id=${id}`
    const result = await fetch(endpoint);
    const forecast = await result.json();
     const forecastList = forecast.list;
     console.log(forecastList)
     const dailyTemp = [];
     forecastList.forEach((day) => {
             let date = new Date(day.dt_txt.replace(' ', 'T'));
             let hours = date.getHours();
            if(hours === 12){
                dailyTemp.push(day);
            }
     });
   updateForecast(dailyTemp);
};


//getWeatherDataByCity('Dhaka')

const weatherForCity = async (city) => {
         let data = await getWeatherDataByCity(city);
         let cityId = data.id;
         updateCurrentWeather(data);
         getForecastDataByCity(cityId);
};

const init = () => {
     weatherForCity('Dhaka')
     document.body.style.filter = 'blur(0)'
}
 
init();

//Search Functionality

searchInput.addEventListener('keydown', async(e) => {
    let cityName = searchInput.value
    if(e.keyCode === 13) {
         weatherForCity(cityName);
        //console.log(data)
         searchInput.value = '';
      
    }
});

//City suggestion functionality
searchInput.addEventListener('input', async () =>{
    const endpoint = cityBaseEndPoint + searchInput.value;
    const request = await fetch(endpoint);
    const result = await request.json();
    //console.log(result);
    suggestions.innerHTML = '';
    const cityList = result._embedded['city:search-results']
    const length = cityList.length > 7 ? 7 : cityList.length;
    for (let i=0; i < length; i++) {
        const option = document.createElement('option');
        option.value = cityList[i].matching_full_name; 
        suggestions.appendChild(option);
    }
    
})




//Render Functionality////////////////////////////
//Updating the current  weather value 
const updateCurrentWeather = (data) => {
    city.textContent = `${data.name}, ${data.sys.country}`
    day.textContent = dayOfWeek();
    humidity.textContent = data.main.humidity;
    wind.textContent = `${calculateWindDirection(data.wind.deg)}, ${data.wind.speed}`
    pressure.textContent = data.main.pressure;
    temp.textContent = data.main.temp >= 0 ? `+ ${Math.round(data.main.temp)}` : `${Math.round(data.main.temp)}`;
    
    const imageId = data.weather[0].id;
    weatherImages.forEach((obj) => {
        if(obj.ids.includes(imageId)){
            image.src = obj.url;
        }
    })

    // const iconId = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    // image.src = iconId;
    web.textContent = `${data.weather[0].description}`

   
}

//Updating the five day forecast data

const updateForecast = data => {
    forecastBlock.innerHTML= '';
    data.forEach((day) => {
        let iconUrl = `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

        // const imageId = day.weather[0].id;
        //     weatherImages.forEach((obj) => {
        //         if(obj.ids.includes(imageId)){
        //           let iconImage =  obj.url;
        //         }
                
        //     })
            

        let dayName = dayOfWeek(day.dt * 1000);
        let temp = day.main.temp >= 0 
                ? `+${Math.round(day.main.temp)}` 
                : `-${Math.round(day.main.temp)}`;
                let forecastElem = `
                        <article class="weather__forecast__item">
                            <img
                                src="${iconUrl}"
                                alt="${day.weather[0].description}"
                                class="weather__forecast__icon"
                            />
                            <h3 class="weather__forecast__day">${dayName}</h3>
                            <p class="weather__forecast__temperature">
                                <span class="value">${temp}</span> &deg;C  
                            </p>
                             <p class="weather__forecast__description">
                                <span class="value">${day.weather[0].description}</span> 
                            </p>
                        </article>`;
                        forecastBlock.insertAdjacentHTML('beforeend', forecastElem);
    });
}

//calculating day of week

const dayOfWeek = (dt = new Date().getTime()) => {

  return new Date(dt).toLocaleDateString('en-EN',  { 
        weekday: 'long'
    });
}

//Calculating wind direction

const calculateWindDirection = (deg) => {
    if(deg > 45 && deg <= 135 ){
        return 'East';
    }else if(deg > 135 && deg <= 225 ){
       return 'South';
    }else if(deg > 225 && deg <= 315){
        return 'West';
    }else{
        return 'North';
    }
};