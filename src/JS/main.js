const API_KEY = "37153a486788dafbb90b90b4ed4ae4a1";
const API_URL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&page=1&api_key=" + API_KEY;

const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API = "https://api.themoviedb.org/3/search/movie?api_key=" + API_KEY + "&query=";
const genres_api = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`;

const form = document.getElementById("form");
const search = document.getElementById("search");
const main = document.getElementById("main");
const genersEl = document.getElementById("geners");
const hideBtn = document.getElementById("hide");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const favCount = document.getElementById("fav-count");

function updateFavCount() {
  favCount.textContent = favorites.length;
}

let moviesToShow = 10;
let movies = [];

// Geners Movies
let selctedGeners = [];
// Chart Bar
let releaseYears = {};

async function getGeners() {
  const res = await fetch(genres_api);
  const data = await res.json();
  uiDisplayGenres(data.genres);
}

function uiDisplayGenres(genres) {
  genersEl.innerHTML = "";
  genres.forEach((genre) => {
    const genreEl = document.createElement("button");
    genreEl.innerText = genre.name;
    genreEl.id = genre.id;

    genreEl.className = "p-[10px] rounded-[10px] text-center h-[44px] bg-[#ffffff] text-black font-semibold text-[16px] m-2 leading-6 hover:bg-gray-200 active:bg-gray-400 transition duration-75"

    genreEl.addEventListener("click", () => selectGenre(genre.id));
    genersEl.appendChild(genreEl);
  });
}

function selectGenre(id) {
  if (selctedGeners.includes(id)) {
    selctedGeners = selctedGeners.filter((genreId) => genreId !== id);
  } else {
    selctedGeners.push(id);
  }

  const genreString = selctedGeners.length ? `&with_genres=${selctedGeners.join(",")}` : "";
  getMovies(API_URL + genreString);
}

getGeners();

getMovies(API_URL);

async function getMovies(url) {
    const res = await fetch(url);
    const data = await res.json();
    movies = data.results;

    movies.forEach((movie) => {
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "Unknown";
      releaseYears[year] = (releaseYears[year] || 0) + 1;
    });

    populateYearDropdown();
    showMovies(movies);
}

function showMovies(movies) {
    main.innerHTML = "";
    const moviesToDisplay = movies.slice(0, moviesToShow);
    moviesToDisplay.forEach((movie) => {
        const { id, title, poster_path, vote_average, original_language, release_date } = movie;
        

        let voteColor = '';
        if (vote_average > 7) {
            voteColor = 'text-[#57e32c]';
        } else if (vote_average >= 4) {
            voteColor = 'text-yellow-500';
        } else {
            voteColor = 'text-[#ff0000]';
        }

        const isFavourite = favorites.includes(id);
        const favouriteBtnText = isFavourite ? "Remove from Favourites" : "Add to Favourites";
        const favouriteBtnClass = isFavourite ? "bg-gray-300 hover:bg-gray-400" : "bg-[#FF0000] hover:bg-[#FF4D4D] active:bg-[#CC0000]";

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie", "w-[256px]", "h-[480px]", "rounded-[10px]", "relative", "bg-black", "cursor-pointer", "overflow-hidden", "group");
        movieEl.innerHTML = `
        <img src="${IMG_PATH + poster_path}" alt="${title}" class="w-full h-[344px] object-cover rounded-[10px] bg-black">
        <div class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">${original_language.toUpperCase()}</div>
        <div class="absolute top-2 right-2 ${voteColor} font-bold bg-[#FF4D4D] text-xs px-2 py-1 rounded flex items-center justify-center gap-1">${Math.round(vote_average)}<i class='bx bxs-star' style='color:#ffe234'></i></div>
        <div class="movie-info p-2 bg-[#000000] flex flex-col items-start">
          <h3 class="text-[16px] leading-6 font-medium text-white">${title}</h3>
          <p class="text-[14px] leading-6 font-normal text-white">${release_date}</p>
          <button class="favourite-btn text-xs mt-2 px-2 py-1 ${favouriteBtnClass} rounded-[10px]">${favouriteBtnText}</button>
        </div>
        `;

        movieEl.addEventListener("click", () => {
          window.location.href = `../src/pages/movieById.html?id=${movie.id}`;
        });
        
        main.appendChild(movieEl);

        const favoriteBtn = movieEl.querySelector('.favourite-btn');
        favoriteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleFavourite(id, favoriteBtn, title);
        });

        const loadMoreBtn = document.getElementById("load-more");
        if (moviesToShow >= movies.length) {
            loadMoreBtn.style.display = 'none'; 
        } else {
            loadMoreBtn.style.display = 'block';
        }

        if (moviesToShow >= movies.length) {
          hideBtn.style.display = 'block';
        } else {
          hideBtn.style.display = 'none';
        }
    });
    
  createYearChart();
}

function populateYearDropdown() {
  const yearDropdown = document.getElementById("yearDropdown");
  yearDropdown.innerHTML = '<option value="all">All Years</option>';
  
  const years = Object.keys(releaseYears).sort((a, b) => a - b);

  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearDropdown.appendChild(option);
    yearDropdown.addEventListener("change", updateChartWithSelectedYear);
  });
 
}

function updateChartWithSelectedYear() {
  const selectedYear = document.getElementById("yearDropdown").value;
  
  if (selectedYear === "all") {
    createYearChart();
  } else {
    createYearChart([selectedYear]);
  }
}

let chartInstance;

function createYearChart(selectedYears = []) {
  const ctx = document.getElementById("yearChart").getContext("2d");
  
  if(chartInstance){
    chartInstance.destroy();
  }

  let years = Object.keys(releaseYears).sort((a, b) => a - b);
  let movieCounts = years.map(year => releaseYears[year]);

  if (selectedYears.length) {
    years = years.filter(year => selectedYears.includes(year));
    movieCounts = years.map(year => releaseYears[year]);
  }

  const backgroundColors = years.map(() => getRandomColor());
  const borderColors = backgroundColors.map(color => color.replace('0.2', '1.0'));

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: years,
      datasets: [
        {
          label: "Number of movies released",
          data: movieCounts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Movies Released Per Year',
          font: {
            size: 18,
            weight: 'bold',
          },
        },
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutBounce',
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++){
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const loadMoreBtn = document.getElementById("load-more");
loadMoreBtn.addEventListener("click", () => {
    moviesToShow += 10; 
    showMovies(movies);
});

hideBtn.addEventListener("click", () => {
  moviesToShow = 10; 
  showMovies(movies); 
});

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