var genreTypeDivs = document.querySelectorAll("div#type-genre.border");

genreTypeDivs.forEach(function(genreTypeDiv) {
  genreTypeDiv.addEventListener("click", function() {
    const genre = this.querySelector("h2").innerText;
    if (genre) {
      localStorage.setItem('genre', JSON.stringify(genre));
      const newWindow = window.open('genre_details.html','_parent');
    } else {
      const newWindow = window.open();
      newWindow.document.write('<p class="no-results">No results found.</p>');
    }    
  });
});

