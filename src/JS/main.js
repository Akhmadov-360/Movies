const API_KEY = "37153a486788dafbb90b90b4ed4ae4a1";
const API_URL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&page=1&api_key=" + API_KEY;

const IMG_PATH = "https://image.tmdb.org/t/p/w1280";

const SEARCH_API = "https://api.themoviedb.org/3/search/movie?api_key=" + API_KEY + "&query='";


const form = document.getElementById("form");
const search = document.getElementById("search");
const main = document.getElementById("main");

getMovies(API_URL);

async function getMovies(url) {
    const res = await fetch(url);
    const data = await res.json();
    showMovies(data.results);
  }

  function showMovies(movies) {
    main.innerHTML = "";
    movies.forEach((movie) => {
      const { title, poster_path, vote_average, original_language, release_date, overview } = movie;

      let voteColor = '';
      if (vote_average >= 8) {
        voteColor = 'text-green-500';
      } else if (vote_average >= 5) {
        voteColor = 'text-yellow-500';
      } else {
        voteColor = 'text-red-500';
      }

      const movieEl = document.createElement("div");
        movieEl.classList.add("movie", "w-[256px]", "h-[392px]", "rounded-[10px]", "relative", "overflow-hidden", "bg-white", "shadow-lg", "group");
        movieEl.innerHTML = 
          `<img src="${IMG_PATH + poster_path}" alt="${title}" class="w-full h-[344px] object-cover rounded-[10px]">
          <div class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">${original_language.toUpperCase()}</div>
          <div class="absolute top-2 right-2 ${voteColor} font-bold text-xs px-2 py-1 rounded">${vote_average}</div>
          <div class="movie-info p-2">
            <h3 class="text-sm font-bold">${title}</h3>
            <p>${release_date}</p> 
          </div>
          <div class="overview absolute inset-0 bg-black bg-opacity-80 text-white p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 class="text-lg font-bold mb-2">Overview</h3>
            <p class="text-sm">${overview}</p>
          </div>`
        ;
        main.appendChild(movieEl);
      });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
  
    const searchTerm = search.value;
  
    if (searchTerm && searchTerm !== "") {
      getMovies(SEARCH_API + searchTerm + "");
      search.value = "";
    } else {
      window.location.reload();
    }
  });