const castNames = JSON.parse(localStorage.getItem('castNames'));

async function fetchCastPhotos(castname) {
  const url = `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(castname)}&include_adult=false&language=en-US&page=1`;
  const headers = {
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2Njg3ZmE2YTRjMzdkYjYwZWI4OTE0Mjc0MjhmZDRlNCIsInN1YiI6IjY0MTg2NWU4NmEyMjI3MDA3ZDczZDY4OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.YabTssKkLw-GUB6U_unvyOXDgAQ_xGS2ztVfbzRmNZ0',
  };

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    return data.results[0]?.profile_path;
  } catch (error) {
    console.log(`Error fetching data for ${castname}:`, error);
    return null;
  }
}

async function loadCastPhotos() {
  const castPhotosContainer = document.querySelector('.cast-photos');
  const castPhotos = await Promise.all(castNames.map(fetchCastPhotos));

  castPhotos.forEach((photoUrl, index) => {
    if (photoUrl) {
      const castPhotoElement = document.createElement('div');
      castPhotoElement.classList.add('cast-photo');

      const castImage = document.createElement('img');
      castImage.src = `https://image.tmdb.org/t/p/w200${photoUrl}`;
      castImage.alt = 'Cast Photo';
      castPhotoElement.appendChild(castImage);

      const castName = document.createElement('div');
      castName.classList.add('cast-name');
      castName.textContent = castNames[index];
      castPhotoElement.appendChild(castName);

      castPhotosContainer.appendChild(castPhotoElement);
    }
  });
}

loadCastPhotos();

function createPieChart(data) {
  const chartCanvas = document.createElement('canvas');
  chartCanvas.id = 'pieChart';
  document.querySelector('.chart').appendChild(chartCanvas);
  const ctx = chartCanvas.getContext('2d');

  // Extract the necessary data
  const [positiveCount, negativeCount] = data.pct;

  // Define the chart data
  const chartData = {
    labels: ['Positive-review', 'Negative-review'],
    datasets: [
      {
        data: [positiveCount, negativeCount],
        backgroundColor: ['#13133e', '#9b1d5aa3'],
      },
    ],
  };
  
  const chartOptions = {
    plugins: {
      legend: {
        position: 'right',
        align: 'start',
        labels:{
          padding: 14,
          color: 'aliceblue', // Set the label color to aliceblue
          font: {
            size: 14,
          },
        },
        spacing: 2,
      },
    },
    responsive: true, // Enable responsiveness
    aspectRatio: 2, // Set the aspect ratio of the chart (width:height)
  };
  // Create the pie chart
  new Chart(ctx, {
    type: 'pie',
    data: chartData,
    options: chartOptions,
  });
}


// Retrieve data from localStorage and populate the HTML elements
const data = JSON.parse(localStorage.getItem('filteredData'));
if (data) {
  document.querySelector('.poster img').src = data.poster_path;
  document.querySelector('.poster-title h2').textContent = data.Title;
  document.querySelector('.time').textContent = data.runtime;
  document.querySelector('.genre').innerHTML = data.genres
    .split(',')
    .map(genre => `<span>${genre}</span>`)
    .join(',');
  document.querySelector('.director1').innerHTML = `<span class="info-label">Director:&nbsp</span>  &nbsp ${data.Director.split(';').map(director => director).join(',')}`;
  document.querySelector('.release_date').innerHTML = `<span class="info-label">Release Date: &nbsp </span> ${data.release_date}`;
  document.querySelector('.overview').innerHTML = `<span class="info-label">Disclaimer:</span> ${data.overview}`;

  // Perform the FETCH API call to get the percentage data
  fetch('http://127.0.0.1:5000/percentage', {
    method: 'POST',
    headers: {
      'Access-Control-Allow-Origin': '*', // Replace '*' with the allowed origin
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ term: data.Title })
  })
    .then(response => response.json())
    .then(data2 => {
      // console.log(data2);
      createPieChart(data2);
    })
    .catch(error => {
      console.log('Error fetching percentage data:', error);
    });
    




//to  get recomeended movies
  document.addEventListener('DOMContentLoaded', function () {
  // Your code here
  fetch('http://127.0.0.1:5000/movie_name', {
    method: 'POST',
    headers: {
      'Access-Control-Allow-Origin': '*', // Replace '*' with the allowed origin
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ term: data.Title })
  }).then(response => response.json())
    .then(data1 => {
      const recommendedMovies = data1.recommended_movies;
      const movieListDiv = document.getElementById('movieList');

      if (movieListDiv) {
        // Clear the existing content in the div
        movieListDiv.innerHTML = '';
        // movieListDiv.classList.add('one');
        // Iterate over the recommendedMovies object
        for (const movieName in recommendedMovies) {
          if (recommendedMovies.hasOwnProperty(movieName)) {

            const movieContainer = document.createElement('div');
            movieContainer.classList.add('movie-container');

            // Create an image element for each movie poster
            const img = document.createElement('img');
            img.src = recommendedMovies[movieName];
            img.classList.add('image-poster');

            // Create a paragraph element for the movie name
            const p = document.createElement('p');
            p.textContent = movieName;
            p.classList.add('text');

            // Append the image and paragraph elements to the div
            movieContainer.appendChild(img);
            movieContainer.appendChild(p);

            movieListDiv.appendChild(movieContainer);
          }
        }
      } else {
        console.error("The movieListDiv element is null. Make sure you have a <div> element with the id 'movieList' in your HTML.");
      }
    });
});
}