const API_KEY = "37153a486788dafbb90b90b4ed4ae4a1";
const API_URL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&page=1&api_key=" + API_KEY;

const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API = "https://api.themoviedb.org/3/search/movie?api_key=" + API_KEY + "&query=";

const form = document.getElementById("form");
const search = document.getElementById("search");
const main = document.getElementById("main");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const favCount = document.getElementById("fav-count");

function updateFavCount() {
  favCount.textContent = favorites.length;
}

getMovies(API_URL);

async function getMovies(url) {
    const res = await fetch(url);
    const data = await res.json();
    showMovies(data.results);
}

function showMovies(movies) {
    main.innerHTML = "";
    movies.forEach((movie) => {
        const { id, title, poster_path, vote_average, original_language, overview, release_date } = movie;

        let voteColor = '';
        if (vote_average >= 8) {
            voteColor = 'text-green-500';
        } else if (vote_average >= 5) {
            voteColor = 'text-yellow-500';
        } else {
            voteColor = 'text-red-500';
        }

        const isFavourite = favorites.includes(id);
        const favouriteBtnText = isFavourite ? "Remove from Favourites" : "Add to Favourites";
        const favouriteBtnClass = isFavourite ? "bg-red-400 hover:bg-red-500" : "bg-gray-300 hover:bg-gray-400";

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie", "w-[256px]", "h-[450px]", "rounded-[10px]", "relative", "bg-black", "overflow-hidden", "group");
        movieEl.innerHTML = `
        <img src="${IMG_PATH + poster_path}" alt="${title}" class="w-full h-[344px] object-cover rounded-[10px] bg-black">
        <div class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">${original_language.toUpperCase()}</div>
        <div class="absolute top-2 right-2 ${voteColor} font-bold text-xs px-2 py-1 rounded">${Math.round(vote_average)}</div>
        <div class="movie-info p-2 bg-[#000000] flex flex-col items-start">
          <h3 class="text-[16px] leading-6 font-medium text-white">${title}</h3>
          <p class="text-[14px] leading-6 font-normal text-white">${release_date}</p>
          <button class="favourite-btn text-xs mt-2 px-2 py-1 ${favouriteBtnClass} rounded">${favouriteBtnText}</button>
        </div>
        `;
        
        main.appendChild(movieEl);

        const favoriteBtn = movieEl.querySelector('.favourite-btn');
        favoriteBtn.addEventListener("click", () => toggleFavourite(id, favoriteBtn, title));
    });
}

function isFavourite(id) {
  return favorites.includes(id);
}

function toggleFavourite(id, button, title) {
  if (isFavourite(id)) {
    favorites.splice(favorites.indexOf(id), 1);
    button.textContent = "Add to Favourites";
    button.classList.remove("bg-red-400", "hover:bg-red-500");
    button.classList.add("bg-gray-300", "hover:bg-gray-400");
    
    showToast(`"${title}" removed from Favourites`);
  } else {
    favorites.push(id);
    button.textContent = "Remove from Favourites";
    button.classList.remove("bg-gray-300", "hover:bg-gray-400");
    button.classList.add("bg-red-400", "hover:bg-red-500");
    
    showToast(`"${title}" added to Favourites`);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavCount();
}

updateFavCount();

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const searchTerm = search.value;

    if (searchTerm && searchTerm !== "") {
        getMovies(SEARCH_API + searchTerm);
        search.value = "";
    } else {
        window.location.reload();
    }
});


const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");

function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.add("opacity-100", "pointer-events-auto");

  setTimeout(() => {
    toast.classList.remove("opacity-100", "pointer-events-auto");
  }, 3000);
}