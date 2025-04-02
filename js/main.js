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
};

// Call the populate function when the page loads
document.addEventListener('DOMContentLoaded', populateCitySelect);
