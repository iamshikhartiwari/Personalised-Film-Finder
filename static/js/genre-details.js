const data = JSON.parse(localStorage.getItem('genre'));
if (data) {
  // console.log(data);
  // Display genre name in a div
  const genreDiv = document.getElementById('genreDiv');
  if (genreDiv) {
    genreDiv.textContent = data;
  } else {
    console.error("The genreDiv element is null. Make sure you have a <div> element with the id 'genreDiv' in your HTML.");
  }

  // Rest of the code for fetching and displaying movies based on the genre
  fetch('http://127.0.0.1:5000/genre_based_movies', {
    method: 'POST',
    headers: {
      'Access-Control-Allow-Origin': '*', // Replace '*' with the allowed origin
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ term: data })
  })
    .then(response => response.json())
    .then(data1 => {
      const recommendedMovies = data1.genre_movies;
      const movieListDiv = document.getElementById('movieList');
      if (movieListDiv) {
        // Clear the existing content in the div
        movieListDiv.innerHTML = '';

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
            movieContainer.appendChild(img);
            movieContainer.appendChild(p);

            movieListDiv.appendChild(movieContainer);
          }
        }
      } else {
        console.error("The movieListDiv element is null. Make sure you have a <div> element with the id 'movieList' in your HTML.");
      }
    });
} else {
  console.log("No Genre Name");
}
