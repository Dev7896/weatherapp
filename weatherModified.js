
const api_key = '885a25cce26a26430ffe491b35f64424';
let city = document.querySelector(".city");
let cityname = '';
let i = 1; // firstcity to be updated in localstorage

let getWeatherInformation = async (city) => {
    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&units=metric`);
          return await response.json();
    } catch (error) {
        console.error("Error fetching weather information:", error);
    }
}

function formatTemperature(value) {
    return value + "&deg";
}


//date
function formatDate(date) {
    const ordinalSuffixes = {
      1: 'st',
      2: 'nd',
      3: 'rd',
      21: 'st',
      22: 'nd',
      23: 'rd',
      31: 'st',
    };
  
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
    const year = date.getFullYear();
  
    const ordinalSuffix = ordinalSuffixes[day] || 'th';
    return `${day}${ordinalSuffix} ${month} ${year}`;
  }
  
  

function setCurrentWeatherForecast({coord : {dt} ,main : {humidity , temp , temp_max , temp_min , pressure , feels_like} , weather: [{description}],wind :{speed}}) {
    let mainelement = document.querySelector(".middle-main")
    mainelement.querySelector(".datatime").innerHTML = formatDate(new Date());
    mainelement.querySelector(".temp").innerHTML = formatTemperature(Math.round(temp));
    mainelement.querySelector(".maxandmin").innerHTML = `${Math.round(temp_max)} / ${Math.round(temp_min)}`;
    mainelement.querySelector(".description").innerHTML = description;
    
    let secondelement = document.querySelector(".humidity-windspeed-info");
    secondelement.querySelector(".feelslike").innerHTML = formatTemperature(feels_like);
    secondelement.querySelector(".humidity").innerHTML = `${humidity} %`
    secondelement.querySelector(".windspeed").innerHTML = `${speed} m/s`
    secondelement.querySelector(".pressure").innerHTML = `${Math.round(pressure / 1013.25)} atm`
} 

function updateLocalStorage(cityname) {
    // console.log(i)
if(i <= 7){
    // let consult = window.prompt("want to add city in your list? yes[y] : no[n]")

        localStorage.setItem(`city${i}` , cityname);
        document.querySelector(`.symbol-container .city${i}`).innerHTML = localStorage.getItem(`city${i}`);  
}else {
    window.alert("you can add upto 7 cities only")
}

i += 1;

}

// it will set the values when user log in 
function setSymbolContainerValues() {

    if(localStorage.length == 0){
        i = 1;
    }else {
        i = localStorage.length;
        for (let j = 1; j <= localStorage.length; j++) {       
            document.querySelector(`.symbol-container .city${j}`).innerHTML = localStorage.getItem(`city${j}`); 
        }
    }
}

let changeCity = async ()=> {
    cityname = window.prompt("enter the city name?");

    if(cityname == '' || cityname == null){
        //
    }else{
      
      try {
        let data = await getWeatherInformation(cityname);
        setCurrentWeatherForecast(data);
        getAirQualityIndex(cityname).then((result) => {
          // Extracting lat and lon
          const { lat, lon } = result[0];
          
          // Calling setAirQualityIndex with lat and lon
          setAirQualityIndex(cityname ,{ lat, lon });
        });
        document.querySelector(".city").innerHTML = cityname;
          getHourlyForecast(cityname).then((result) => {
            setHourlyForecast(result)
            setFiveDayForecast(result)
          })
    } catch (error) {
        console.error("Error loading weather information:", error);
    }

    updateLocalStorage(cityname);
}
}

let changeCityByList = async(cityvalue)=>{
    cityname = cityvalue;
    document.querySelector(".city").innerHTML = cityname;
    try {
        let data = await getWeatherInformation(cityname);
        // console.log(data)
        setCurrentWeatherForecast(data);
        getAirQualityIndex(cityname).then((result) => {
            // Extracting lat and lon
            const { lat, lon } = result[0];
          
            // Calling setAirQualityIndex with lat and lon
            setAirQualityIndex(cityname ,{ lat, lon });
          });
          getHourlyForecast(cityname).then((result) => {
            setHourlyForecast(result)
            setFiveDayForecast(result)
          })
    } catch (error) {
        console.error("Error loading weather information:", error);
    }

    
}

let getAirQualityIndex = async (cityname) => {
    // http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
    let data = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityname},${+91}&limit=${3}&appid=${api_key}`);
    let jsonData = await data.json();
    return jsonData;
  }
  
  function convertToReadableTime(inputDatetime) {
    // Parse the input datetime string
    const parsedDatetime = new Date(inputDatetime);

    // Check if the parsing was successful
    if (isNaN(parsedDatetime.getTime())) {
        return "Invalid Date";
    }

    // Get the hours and minutes
    const hours = parsedDatetime.getHours();
    // const minutes = parsedDatetime.getMinutes();

    // Determine whether it's AM or PM
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    const formattedHours = hours % 12 || 12;

    // Construct the new datetime string in the desired format
    const formattedTime = `${formattedHours} ${period}`;

    return formattedTime;
}

  // Helper function to get AQI description
function getAQIDescription(aqi) {
    switch (aqi) {
      case 1:
        return "Good";
      case 2:
        return "Fair";
      case 3:
        return "Moderate";
      case 4:
        return "Poor";
      case 5:
        return "Very Poor";
      default:
        return "Unknown";
    }
  }
  
  // Helper function to get AQI description text
  function getAQIDescriptionText(aqi) {
    switch (aqi) {
      case 1:
        return "Air quality is excellent. Enjoy the fresh and clean air!";
      case 2:
        return "Air quality is acceptable. No significant health risk.";
      case 3:
        return "Air quality is moderate. Unusually sensitive individuals may experience health issues.";
      case 4:
        return "Air quality is poor. Health alert: everyone may begin to experience health effects.";
      case 5:
        return "Air quality is very poor. Health warnings of emergency conditions; the entire population is more likely to be affected.";
      default:
        return "Air quality information not available.";
    }
  }

  let setAirQualityIndex = async (citynamevalue , { lon, lat }) => {
    let data = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`);
    let airQualityData = await data.json();

    const { list } = airQualityData;
    const { components : {o3, pm2_5 , pm10 , so2 , no2 ,co}, main: { aqi } , dt} = list[0];
  // Set values in HTML elements
  document.querySelector('.aqi-value').textContent = aqi;
  document.querySelector('.about-aqi').textContent = getAQIDescription(aqi);
  document.querySelector('.aqi-description').textContent = getAQIDescriptionText(aqi);
  document.querySelector('.all-gaseous-data .pm25').innerHTML = `PM2.5 <br> <span>${pm2_5.toFixed(1)}</span>`;
  document.querySelector('.all-gaseous-data .pm10').innerHTML = `PM10 <br> <span> ${pm10.toFixed(1)}</span>`;
  document.querySelector('.all-gaseous-data .so2').innerHTML = `
  <p class="so2">
    SO<sub>2</sub> <br> <span>${so2.toFixed(1)}</span>
  </p>
`;
document.querySelector('.all-gaseous-data .no2').innerHTML = `
  <p class="no2">
    NO<sub>2</sub> <br> <span>${no2.toFixed(1)}</span>
  </p>
`;
document.querySelector('.all-gaseous-data .o3').innerHTML = `
<p class="o3">
  O<sub>3</sub> <br> <span>${o3.toFixed(1)}</span>
</p>
`;

document.querySelector('.all-gaseous-data .co').innerHTML = `
  <p class="co">
    CO <br> <span>${co.toFixed(1)}</span>
  </p>
`;

  // Format timestamp to time (HH:mm)
  const formattedTime = convertToReadableTime(dt);
  document.querySelector('.publish-details').textContent = `${citynamevalue} published at ${formattedTime}`;
}

let getHourlyForecast = async (city)=> {
    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api_key}&units=metric`);
        return await response.json();

    } catch (error) {
        console.error("Error fetching weather information:", error);
    }
}

let setHourlyForecast = ({list})=> {
    let hourlyElement = document.querySelector(".hourly-forecast table");
    let maindata = '';
    for (let i = 0; i < 5; i++) {
        let actualIcon = setIcon(list[i].weather[0].icon);
        let time = convertToReadableTime(list[i].dt_txt);
        let temperature = list[i].main.temp;
                         maindata += `                <tr>
                         <td>${time}</td>
                         <td><img src="${actualIcon}" width="50px" height="50px"></td>
                         <td>${formatTemperature(temperature)}</td>
                     </tr>`
    }
    hourlyElement.innerHTML = maindata;
}


function setIcon(icon) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`
}

function formatDateToDay(date) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let day =  new Date(date).getDay()

  // Use the day of the week to get the corresponding day name
  const dayName = daysOfWeek[day];

  return dayName
}

function setFiveDayForecast({list}) {
    let k = 0;
    let maindata1 = '';
    let fiveDayWeatherElement = document.querySelector(".five-day-forecast table");
    while (k < 40) {

        maindata1 += `<tr>
        <td><h4>${formatDateToDay(list[k].dt_txt)}</h4></td>
        <td><img src="${setIcon(list[k].weather[0].icon)}" alt="" width="50px"></td>
        <td class="font-temp">${formatTemperature(list[k].main.temp_min)}</td>
        <td class="font-temp">${formatTemperature(list[k].main.temp_max)}</td>
    </tr>`
        k += 8;
    } 
    fiveDayWeatherElement.innerHTML = maindata1;  
}

function isDaytime() {
  const now = new Date();
  const hours = now.getHours();
  
  // Set your day and night time ranges (adjust according to your location)
  const dayStart = 6; // 6 AM
  const dayEnd = 18; // 6 PM
  
  return hours >= dayStart && hours < dayEnd;
}

function setAppBackground() {
  const body = document.body;
  const isDay = isDaytime();

  if (isDay) {
      body.style.backgroundImage = "url('day.jpg')"; // Set your day image
  } else {
      body.style.backgroundImage = "url('night.jpg')"; // Set your night image
  }
}

document.addEventListener("DOMContentLoaded" ,async ()=> {
   setAppBackground();
    setInterval(setAppBackground, 60000);
    try {
        let cityname = city.innerHTML;
        let data = await getWeatherInformation(cityname);
        // console.log(data)
        setCurrentWeatherForecast(data);
        setSymbolContainerValues();
        getAirQualityIndex(cityname).then((result) => {
            // Extracting lat and lon
            const { lat, lon } = result[0];
          
            // Calling setAirQualityIndex with lat and lon
            setAirQualityIndex(cityname ,{ lat, lon });
          });
          getHourlyForecast(cityname).then((result) => {
            setHourlyForecast(result)
            setFiveDayForecast(result)
          })

    } catch (error) {
        console.error("Error loading weather information:", error);
    }


    document.querySelector(".symbol").addEventListener("click" , ()=>{
        const element = document.querySelector(".symbol-container");
        element.style.display = (element.style.display === "none" || element.style.display === "") ? "block" : "none";
        
    })

    document.querySelector(".add-city").addEventListener("click" , ()=>{
        changeCity();
    })

    const cityParagraphs = document.querySelectorAll(".symbol-container > p");

    cityParagraphs.forEach((paragraph) => {
        paragraph.addEventListener("click", (event) => {
            // console.log(event);
            changeCityByList(event.target.innerHTML);
        });
    });

})
