// WebTech Film Database
// Uses the OMDb API: https://www.omdbapi.com/
// Get a free API key here: https://www.omdbapi.com/apikey.aspx

const apiKey = "a3098a7e";
const apiUrl = "https://www.omdbapi.com/";


// ---------- SEARCH FORM ----------

const searchForm = document.getElementById("searchForm");

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const type = document.getElementById("type").value;
  const year = document.getElementById("year").value;
  const error = document.getElementById("searchError");

  // simple check before calling the API
  if (title.length < 2) {
    error.textContent = "Please type at least 2 letters of a film title.";
    return;
  }
  error.textContent = "";

  // build the address, e.g. ?apikey=xxx&s=batman&type=movie&y=2008
  let url = apiUrl + "?apikey=" + apiKey + "&s=" + encodeURIComponent(title);
  if (type !== "") {
    url = url + "&type=" + type;
  }
  if (year !== "") {
    url = url + "&y=" + year;
  }

  document.getElementById("message").textContent = "Searching...";

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      showFilms(data);
    })
    .catch(function () {
      document.getElementById("message").textContent = "Could not connect to the film database. Please try again later.";
    });
});


// show the list of films as Bootstrap cards
function showFilms(data) {
  const filmList = document.getElementById("filmList");
  const message = document.getElementById("message");
  filmList.innerHTML = "";

  if (data.Response === "False") {
    message.textContent = "No films found. Try a different title.";
    return;
  }

  message.textContent = "Found " + data.totalResults + " results. Click a film to see more.";

  data.Search.forEach(function (film) {
    let poster = film.Poster;
    if (poster === "N/A") {
      poster = "images/no-poster.png";
    }

    filmList.innerHTML += `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="card film-card" tabindex="0" role="button" data-id="${film.imdbID}">
          <img src="${poster}" class="card-img-top" alt="Poster for ${film.Title}">
          <div class="card-body">
            <h3 class="card-title fs-6">${film.Title}</h3>
            <p class="card-text">${film.Year} - ${film.Type}</p>
          </div>
        </div>
      </div>`;
  });

  // make each card open the details when clicked or when Enter is pressed
  const cards = document.querySelectorAll(".film-card");
  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      getDetails(card.dataset.id);
    });
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        getDetails(card.dataset.id);
      }
    });
  });
}


// ---------- FILM DETAILS (second API call) ----------

let currentTitle = "";

function getDetails(id) {
  const plot = document.querySelector('input[name="plot"]:checked').value;
  const url = apiUrl + "?apikey=" + apiKey + "&i=" + id + "&plot=" + plot;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (film) {
      currentTitle = film.Title;
      let poster = film.Poster;
      if (poster === "N/A") {
        poster = "images/no-poster.png";
      }

      document.getElementById("modalTitle").textContent = film.Title + " (" + film.Year + ")";

      document.getElementById("modalBody").innerHTML = `
        <div class="row">
          <div class="col-md-4 mb-3">
            <img src="${poster}" class="img-fluid" alt="Poster for ${film.Title}">
          </div>
          <div class="col-md-8">
            <p>${film.Plot}</p>
            <ul>
              <li><strong>IMDb rating:</strong> ${film.imdbRating} / 10</li>
              <li><strong>Genre:</strong> ${film.Genre}</li>
              <li><strong>Director:</strong> ${film.Director}</li>
              <li><strong>Actors:</strong> ${film.Actors}</li>
              <li><strong>Runtime:</strong> ${film.Runtime}</li>
              <li><strong>Released:</strong> ${film.Released}</li>
            </ul>
            <button type="button" class="btn btn-main" onclick="reviewFilm()">Review this film</button>
          </div>
        </div>`;

      const modal = new bootstrap.Modal(document.getElementById("filmModal"));
      modal.show();
    });
}

// fill the film name in the review form
function reviewFilm() {
  bootstrap.Modal.getInstance(document.getElementById("filmModal")).hide();
  document.getElementById("filmName").value = currentTitle;
  document.getElementById("review").scrollIntoView();
  document.getElementById("name").focus();
}


// ---------- REVIEW FORM (with validation) ----------

const reviewForm = document.getElementById("reviewForm");

reviewForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const filmName = document.getElementById("filmName").value.trim();
  const rating = document.getElementById("rating").value;
  const comment = document.getElementById("comment").value.trim();
  const recommend = document.getElementById("recommend").checked;
  const error = document.getElementById("reviewError");
  document.getElementById("reviewSuccess").textContent = "";

  // check each field and show a clear message
  if (name === "") {
    error.textContent = "Please enter your name.";
    document.getElementById("name").focus();
    return;
  }
  if (!email.includes("@") || !email.includes(".")) {
    error.textContent = "Please enter a valid email address.";
    document.getElementById("email").focus();
    return;
  }
  if (filmName === "") {
    error.textContent = "Please enter the film name.";
    document.getElementById("filmName").focus();
    return;
  }
  if (rating === "") {
    error.textContent = "Please choose a rating.";
    document.getElementById("rating").focus();
    return;
  }
  if (comment.length < 10) {
    error.textContent = "Your review must be at least 10 characters long.";
    document.getElementById("comment").focus();
    return;
  }
  error.textContent = "";

  // add the review to the list
  let text = "<strong>" + filmName + "</strong> - " + rating + "/5 by " + name + "<br>" + comment;
  if (recommend) {
    text = text + "<br><em>Recommended</em>";
  }

  const item = document.createElement("li");
  item.className = "list-group-item";
  item.innerHTML = text;
  document.getElementById("reviewList").appendChild(item);

  reviewForm.reset();
  document.getElementById("reviewSuccess").textContent = "Thank you, your review has been added.";
});
