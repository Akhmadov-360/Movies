const API_KEY = "37153a486788dafbb90b90b4ed4ae4a1";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const favCount = document.getElementById("fav-count");
const movieDetails = document.getElementById("movie-details");

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");

if (movieId) {
  const MOVIE_DETAILS_API = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`;
  getMovieDetails(MOVIE_DETAILS_API);
} else {
  movieDetails.innerHTML = `<p class="text-red-500">No movie ID provided.</p>`;
}

function updateFavCount() {
    favCount.textContent = favorites.length;
}

updateFavCount();

async function getMovieDetails(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const movie = await res.json();
    uiMovieDetails(movie);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    movieDetails.innerHTML = `<p class="text-red-500">Failed to load movie details. Please try again later.</p>`;
  }
}

function uiMovieDetails(movie) {
  const { title, poster_path, overview, status, release_date, vote_average, genres, production_countries, production_companies, runtime } = movie;

  const genreBlocks = genres.map(genre => `<div class="p-[10px] rounded-[10px] flex flex-col items-center justify-center text-center h-[44px] bg-[#ffffff] text-black font-semibold text-[16px] leading-4">${genre.name}</div>`).join('');
  const countryNames = production_countries.map(country => country.name).join(', ');
  const studioNames = production_companies.map(name => name.name).join(', ');

  const isFavourite = favorites.includes(movieId);
  const favouriteBtnText = isFavourite ? "Remove from Favourites" : "Add to Favourites";
  const favouriteBtnClass = isFavourite ? "bg-gray-300 hover:bg-gray-400" : "bg-[#FF0000] hover:bg-[#FF4D4D] active:bg-[#CC0000]";

  movieDetails.innerHTML = `
    <div class="flex flex-col md:flex-row items-start md:items-center w-full max-w-5xl mx-auto">
      <img src="${IMG_PATH + poster_path}" alt="${title}" class="w-[352px] h-[576px] rounded-[10px]">
      <div class="flex flex-col ml-4 text-white">
        <div class="flex justify-between items-center">
          <h2 class="font-semibold text-[34px] leading-[51px]">${title}</h2>
          <button class="w-[190px] h-[56px] rounded-[15px] ${favouriteBtnClass} font-normal text-[16px] leading-6 text-white" onclick="toggleFavourite('${movieId}', this, '${title}')">${favouriteBtnText}</button>
        </div>
        <div class="flex items-center justify-start gap-[20px] mt-14">
            <div class="flex items-center justify-center gap-[8px]">${genreBlocks}</div>
            <p class="font-medium text-[16px] leading-6">${release_date}</p>
            <p class="font-medium text-[16px] leading-6">${vote_average}</p>
            <p class="font-medium text-[16px] leading-6">${runtime} min</p>
        </div>    
        <p class="mt-6 font-normal text-[16px] leading-6">${overview}</p>
        <p class="mt-[44px]">Country : ${countryNames}</p>
        <p class="mt-2">Studios : ${studioNames}</p>
        <p class="mt-2">Status : ${status}</p>
      </div>
    </div>
  `;
}

function isFavourite(id) {
  return favorites.includes(id);
}

function toggleFavourite(id, button, title) {
    if (isFavourite(id)) {
      favorites.splice(favorites.indexOf(id), 1);
      button.textContent = "Add to Favourites";
      button.classList.remove("bg-gray-300", "hover:bg-gray-400");
      button.classList.add("bg-[#FF0000]", "hover:bg-[#FF4D4D]", "active:bg-[#CC0000]");
      
      showToast(`"${title}" removed from Favourites`);
    } else {
      favorites.push(id);
      button.textContent = "Remove from Favourites";
      button.classList.remove("bg-[#FF0000]", "hover:bg-[#FF4D4D]", "active:bg-[#CC0000]");
      button.classList.add("bg-gray-300", "hover:bg-gray-400");
      
      showToast(`"${title}" added to Favourites`);
    }
  
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavCount();
  }
  
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "fixed bottom-4 right-4 bg-gray-800 text-white text-sm py-2 px-4 rounded-lg shadow-lg opacity-0 transform translate-y-4 transition-all duration-500 ease-in-out";
    toast.innerHTML = message;
  
    document.body.appendChild(toast);
  
    setTimeout(() => {
      toast.classList.remove("opacity-0", "translate-y-4");
    }, 100);
  
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-4");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }