export const API_URL = 'https://app.ticketmaster.com/discovery/v2/events.json'
export const API_KEY = "KjCTevbr1TmkGZ2vBNgkzB8Kyo798G8i"
export const WEATHER_API_KEY = "9d115219b3adb83236b5fda4887200c3"

export const domElements = {
    searchInput: document.getElementById('search-input'),
    countrySelect: document.getElementById("country-select"),
    categorySelect: document.getElementById("category-select"),
    sizeSelect: document.getElementById('size-select'),
    searchBtn: document.getElementById('search-btn'),
    eventsContainer: document.getElementById('events-container'),
    paginationContainer: document.getElementById('pagination'),
    calendarBtn: document.getElementById("modal-calendar-btn"),
    favoritesBtn: document.getElementById("fav-toggle-btn"),
    nearUserBtn: document.getElementById("geo-btn"),
    
    backdrop: document.getElementById("backdrop"),
    modal: document.getElementById("modal"),
    modalCloseBtn: document.getElementById("modal-close-btn"),
    modalImg: document.getElementById("modal-img"),
    modalTitle: document.getElementById("modal-title"),
    modalDate: document.getElementById("modal-date"),
    modalTime: document.getElementById("modal-time"),
    modalVenue: document.getElementById("modal-venue"),
    modalPrices: document.getElementById("modal-prices"),
    modalWeather: document.getElementById("modal-weather"),
    modalDesc: document.getElementById("modal-desc"),
    modalLink: document.getElementById("modal-link"),
    modalMapBtn: document.getElementById("modal-map-btn"),
    modalShareBtn: document.getElementById("modal-share-btn")
}

export const state = {
    page: 0,
    size: 25,
    totalPages: 0,
    keyword: '',
    countryCode: '',
    latlong: '',
    category: "",
    events: [],
    timers: [],
    favorites: JSON.parse(localStorage.getItem("fav-events") || "[]"),
    showOnlyFav: false
}

export const countries = [
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    { code: "GB", name: "Great Britain" },
    { code: "DE", name: "Germany" },
    { code: "ES", name: "Spain" },
    { code: "FR", name: "France" },
    { code: "IT", name: "Italy" },
    { code: "AU", name: "Australia" },
    { code: "PL", name: "Poland" },
    { code: "UA", name: "Ukraine" },
]

export const categories = [
    {value: "music", label: "Music"},
    {value: "sports", label: "Sports"},
    {value: "arts", label: "Arts"}
]

