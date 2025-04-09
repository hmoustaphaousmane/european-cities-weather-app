const BASE_URL = 'https://www.7timer.info/bin/api.pl';
let cities = []

// Parse data into an array of object
const parseCSV = data => {
  const lines = data.trim().split('\n');
  const headers = lines[0].split(',');
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(',');
    const entry = {};
    headers.forEach((header, index) => {
      entry[header.trim()] = currentLine[index] ? currentLine[index].trim() : '';
    });
    result.push(entry);
  }
  return result;
}

// Populate the city dropdown using the CSV data
const populateCitySelect = async () => {
  const citySelect = document.getElementById('citySelect');

  try {
    const response = await fetch('city_coordinates.csv');
    const text = await response.text();
    const cities = parseCSV(text);

    console.log(cities);

    cities.forEach(cityObject => {
      if (!cityObject.city || !cityObject.country) return; // Skip invalid rows

      const option = document.createElement('option');
      option.value = cityObject.city;
      option.dataset.lat = cityObject.latitude;
      option.dataset.lon = cityObject.longitude;
      option.textContent = `${cityObject.city}, ${cityObject.country}`;

      citySelect.appendChild(option);
    });

    console.log(citySelect);

  } catch (error) {
    console.error('Error loading the CSV file:', error);
  }

  citySelect.addEventListener("change", async () => {
    const selectedOption = citySelect.options[citySelect.selectedIndex];
    const weatherOutput = document.getElementById('weatherOutput');

    if (!selectedOption || !selectedOption.dataset.lat || !selectedOption.dataset.lon) {
      weatherOutput.innerHTML = `<p class="error">Please select a city.</p>`;
      return;
    }

    // Extract lat/lon
    const lat = selectedOption.dataset.lat;
    const lon = selectedOption.dataset.lon;

    // Show loading message
    weatherOutput.innerHTML = `<p>Loading weather data...</p>`;

    // Fetch weather data and display
    const weatherData = await fetchWeather(lat, lon);
    displayForecast(weatherData);
    // console.log(weatherData)
  });
};

// Map the weather code from the API to the corresponding icon
const getIcon = (weatherCode) => `../images/${weatherCode}.png`;

// Format the date from yyyymmdd to a readable string (e.g., "Fri, Apr 11")
const formatDate = (yyyymmdd) => {
  const year = yyyymmdd.toString().slice(0, 4);
  const month = yyyymmdd.toString().slice(4, 6);
  const day = yyyymmdd.toString().slice(6, 8);

  const dateObj = new Date(year, month - 1, day);

  // Format options: "Fri, Apr 11"
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
}

// Display the weather forecast based on the data of the selected city
function displayForecast(data) {
  // console.log(`Displaying forcast for ${data}`)
  const weatherOutput = document.getElementById('weatherOutput');
  // console.log(weatherOutput)

  // Check if the data has a dataseries property
  if (!data || !data.dataseries) {
    weatherOutput.innerHTML = `<p>No forecast data available.</p>`;
    return;
  }

  // Create a container for the 7-day forecast
  let htmlContent = `<div class="forecast-container">`;
  // console.log(htmlContent)

  data.dataseries.forEach(day => {
    // console.log(day)
    const date = formatDate(day.date);
    const icon = getIcon(day.weather);
    const weatherDescription = day.weather || 'N/A';
    const tempMin = day.temp2m ? day.temp2m.min : 'N/A';
    const tempMax = day.temp2m ? day.temp2m.max : 'N/A';

    htmlContent += `
      <div class="forecast-day">
        <p>${date}</p>
        <img src="${icon}" alt="${weatherDescription} icon" />
        <p>${weatherDescription.toUpperCase()}</p>
        <p>H: ${tempMax}°C</p>
        <p>L: ${tempMin}°C</p>
      </div>
    `;
  });

  htmlContent += `</div>`;
  // console.log(htmlContent)
  weatherOutput.innerHTML = htmlContent;
  console.log(weatherOutput)
}

// Call the populate function when the page loads
document.addEventListener('DOMContentLoaded', populateCitySelect);

// Fetch weather data using the selected city's coordinates
const fetchWeather = async (lat, lon) => {
  const url = `${BASE_URL}?lon=${lon}&lat=${lat}&product=civillight&output=json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response failed');
    }
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error('Error fetching the weather data:', error);
    document.getElementById('forecast-container').innerHTML =
      `<p class="error">Error fetching data. Please try again later.</p>`;
  }
}
