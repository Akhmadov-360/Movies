const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const favCount = document.getElementById("fav-count");
const favItemsDiv = document.getElementById("fav-items");
const favTotalDiv = document.getElementById("fav-total");
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const API_KEY = "37153a486788dafbb90b90b4ed4ae4a1";
const MOVIE_API = "https://api.themoviedb.org/3/movie/";

async function getMovieDetails(id) {
  const res = await fetch(`${MOVIE_API}${id}?api_key=${API_KEY}`);
  const data = await res.json();
  return data;
}

function updateFavCount() {
    favCount.textContent = favorites.length;
}

updateFavCount();

async function renderFav() {
  favItemsDiv.innerHTML = "";

  if (favorites.length === 0) {
    favItemsDiv.innerHTML = `<p class="text-white">Your favorites list is empty</p>`;
    favTotalDiv.innerHTML = "";
    return;
  }

  for (let i = 0; i < favorites.length; i++) {
    const movie = await getMovieDetails(favorites[i]);

    const favItemEl = document.createElement("div");
    favItemEl.classList.add("fav-item", "w-[256px]", "h-[450px]", "rounded-[10px]", "relative", "bg-black", "overflow-hidden", "group", "p-4", "text-white");

    favItemEl.innerHTML = `
      <img src="${IMG_PATH + movie.poster_path}" alt="${movie.title}" class="w-full h-[344px] object-cover rounded-[10px] bg-black">
      <h4 class="text-lg font-bold mt-2">${movie.title}</h4>
      <p class="text-sm">${movie.release_date}</p>
      <button class="text-xs mt-2 px-2 py-1 bg-red-400 rounded hover:bg-red-500" onclick="removeFromFav(${i})">Remove from Favourites</button>
    `;

    favItemsDiv.appendChild(favItemEl);
  }

  favTotalDiv.innerHTML = `<p class="text-white font-bold text-[16px] leading-3">Total favourites: ${favorites.length}</p>`;
}

async function removeFromFav(index) {
    const movieId = favorites[index];
    const movie = await getMovieDetails(movieId); 
    
    favorites.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    
    renderFav();
    
    showToast(`"${movie.title}" removed from Favourites`);
  }

renderFav();

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
