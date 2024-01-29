
const fs = require('fs');

function fetchCSVData(fl) {
  return new Promise((resolve, reject) => {
    fs.readFile('Movies_Info.csv', 'utf8', (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

const searchTerm = "";
function searchMovies() {
  const searchTerm = document.getElementById('search-input').value;

  const movieDetailsURL = 'movie-details.html?search=' + encodeURIComponent(searchTerm);

  // Open the new webpage in a new tab/window
  window.open(movieDetailsURL,'_top');
  const movieDetailsContainer = document.getElementById('movie-details-container');
  movieDetailsContainer.innerHTML = '';

  window.location.href="movie-details.html?data="+encodeURIComponent(movieDetailsURL);
  
}
async function ft() {
  const data = await fetchCSVData();

  const rows = data.split('\n');
  const headers = rows[0].split(',');

  // Find the index of each column
  const titleIndex = headers.indexOf('Title');
  const directorIndex = headers.indexOf('Director');
  const castIndex = headers.indexOf('Cast');
  const genresIndex = headers.indexOf('genres');
  const overviewIndex = headers.indexOf('overview');
  // const posterPathIndex = headers.indexOf('poster_path');
  const releaseDateIndex = headers.indexOf('release date');
  const runtimeIndex = headers.indexOf('runtime');

  // Iterate through rows to find matching movies
  for (let i = 1; i < rows.length; i++) {
    const columns = rows[i].split(',');

    // Check if title matches the search term
    if (columns[titleIndex].toLowerCase().includes(searchTerm.toLowerCase())) {
      const movieDetails = document.createElement('div');
      movieDetails.classList.add('movie-details');

      // Display movie details
      movieDetails.innerHTML = `
                    <h2>${columns[titleIndex]}</h2>
                    <p><strong>Director:</strong> ${columns[directorIndex]}</p>
                    <p><strong>Cast:</strong> ${columns[castIndex]}</p>
                    <p><strong>Genres:</strong> ${columns[genresIndex]}</p>
                    <p><strong>Overview:</strong> ${columns[overviewIndex]}</p>
                    <p><strong>Release Date:</strong> ${columns[releaseDateIndex]}</p>
                    <p><strong>Runtime:</strong> ${columns[runtimeIndex]}</p>
                    // <img src="${columns[posterPathIndex]}" alt="Movie Poster">
                `;

      movieDetailsContainer.appendChild(movieDetails);

    }
  }


}



searchMovies();
ft();
