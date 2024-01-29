function fetchCSV(url) {
  return axios.get(url).then((response) => response.data);
}
    fetchCSV("/static/Top_50_MOvies.csv")
      .then((csvData) => {
        // Parse CSV data
        const movies = parseCSV(csvData);

        const movieContainer = document.getElementById("movie-container");

        // Iterate through each movie and create a card for it
        movies.forEach((movie) => {
          // Create movie card element
          const movieCard = document.createElement("div");
          movieCard.className = "movie-card";

          // Create movie poster element
          const moviePoster = document.createElement("img");
          moviePoster.className = "movie-poster";
          moviePoster.src = movie.poster_path;
          moviePoster.alt = movie.Title;

          // Create movie title element
          const movieTitle = document.createElement("h2");
          movieTitle.textContent = movie.Title;

          // Append elements to movie card
          movieCard.appendChild(moviePoster);
          movieCard.appendChild(movieTitle);

          // Append movie card to container
          movieContainer.appendChild(movieCard);
        });
      })
      .catch((error) => {
        console.error(error);
      });

    // Function to parse CSV data
    function parseCSV(csvData) {
      const lines = csvData.split("\n");
      const headers = lines[0].split(",");
      const movies = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        if (values.length === headers.length) {
          const movie = {};
          for (let j = 0; j < headers.length; j++) {
            movie[headers[j]] = values[j];
          }
          movies.push(movie);
        }
      }
      return movies;
    }