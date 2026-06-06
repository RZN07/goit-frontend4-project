import { domElements, state, WEATHER_API_KEY } from "./constants.js"
import { fetchEvents } from "../api/api.js"

domElements.modalCloseBtn.addEventListener("click", closeModal)

domElements.favoritesBtn.addEventListener("click", () => {
    state.showOnlyFav = !state.showOnlyFav

    domElements.favoritesBtn.classList.toggle("active")
    if (state.showOnlyFav) {
        renderEvents(state.favorites)
        domElements.paginationContainer.innerHTML = ""
    } else {
        fetchEvents()
    }
})

domElements.nearUserBtn.addEventListener("click", () => {
    if (!navigator.geolocation) return

    const originalText = domElements.nearUserBtn.innerText
    domElements.nearUserBtn.innerText = "Searching"

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude
            const long = position.coords.longitude

            state.latlong = `${lat},${long}`
            state.page = 0
            state.keyword = ""
            domElements.nearUserBtn.innerText = originalText
            fetchEvents()
        },
        (error) => {
            console.error(error)
        }
    )
})

export function renderSkeletons() {
    domElements.eventsContainer.innerHTML = Array(state.size)
        .fill(0)
        .map(() => `
    <div class="skeleton">
        <div class="skeleton-img"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text" style="width: 50%;"></div>
    </div>
    `).join("")
}

export function renderEvents(events) {
    domElements.eventsContainer.innerHTML = ""

    events.forEach(event => {
        const isFav = state.favorites.some(favEvent => favEvent.id === event.id)
        const image = event.images.find(img => img.width > 400)?.url || event.images[0].url
        const location = event._embedded?.venues?.[0]?.name || "Місце уточнюется"
        const date = event.dates.start.localDate || "Дата уточнюется"
        const eventDate = event.dates.start.localDate || event.dates.start.dateTime

        const cardHTML = `
        <div class="card" onclick="openModal('${event.id}')">
        <button id="fav-btn" class="fav-btn ${isFav ? "in-fav" : ""}" onclick="toggleFav(event,'${event.id}')">♥</button>
    <div class="image-container">
        <img src="${image}" alt="${event.name}" class="card-img">
        <div data-date="${eventDate}" id="timer-${event.id}" class="countdown">--:--:--</div>
    </div>
    <div class="event-info">
        <h3>${event.name}</h3>
            <div class="event-date">${date}</div>
            <div class="event-venue">📍 ${location}</div>
        </div>
    </div>
        `

        domElements.eventsContainer.insertAdjacentHTML("beforeend", cardHTML)
    });

    startCountdowns()
}

function createPageBtn(text, targetPage, isEnabled) {
    const btn = document.createElement("button")
    btn.textContent = text
    btn.className = "page-btn"
    btn.disabled = !isEnabled
    if (isEnabled) {
        btn.onclick = () => {
            state.page = targetPage
            fetchEvents()
        }
    }
    return btn
}

function createDots() {
    const span = document.createElement("span")
    span.textContent = "..."
    span.style.alignSelf = "center"
    return span
}

export function renderPagination() {
    domElements.paginationContainer.innerHTML = ""
    const { page, totalPages } = state

    if (totalPages <= 1) return

    const pages = []
    const range = 2

    for (let i = 0; i < totalPages; i++) {
        if (i === 0 || i === totalPages - 1 || (i >= page - range && i <= page + range)) {
            pages.push(i)
        } else if (pages[pages.length - 1] !== "...") {
            pages.push("...")
        }
    }

    domElements.paginationContainer.appendChild(createPageBtn("Prev", page - 1, page > 0))
    pages.forEach(pageEl => {
        if (pageEl === "...") {
            domElements.paginationContainer.appendChild(createDots())
        } else {
            const btn = createPageBtn(pageEl + 1, pageEl, pageEl !== page)
            if (pageEl === page) btn.classList.add("active")
            domElements.paginationContainer.appendChild(btn)
        }
    })
    domElements.paginationContainer.appendChild(createPageBtn("Next", page + 1, page < totalPages - 1))

}

window.openModal = async function (id) {
    const event = state.events.find(event => event.id === id)

    if (!event) alert("No event")

    domElements.calendarBtn.onclick = () => addToCalendar(event)
    domElements.modalShareBtn.onclick = () => shareEventData(event)

    const eventImage = event.images.sort((a, b) => b.width - a.width)[0]?.url || ""
    domElements.modalImg.src = eventImage

    domElements.modalTitle.textContent = event.name
    domElements.modalDate.textContent = event.dates.start.localDate || "No date"
    domElements.modalTime.textContent = event.dates.start.localDate.slice(0, 5) || "No time"
    domElements.modalVenue.textContent = event._embedded.venues[0].name || "No venues"
    renderModalPrices(event.priceRanges)
    domElements.modalDesc.textContent = event.info || "No description"
    domElements.modalLink.href = event.url

    const location = event._embedded.venues[0].location
    const eventDate = event.dates.start.localDate
    if (location && eventDate) {
        await displayWeather(location.latitude, location.longitude, eventDate)
    }

    if (location && location.latitude && location.longitude) {
        domElements.modalMapBtn.style.display = "inline-block"

        domElements.modalMapBtn.onclick = () => {
            const query = encodeURIComponent(
                `${location.latitude},${location.longitude}(${event._embedded.venues[0].name})`
            )
            window.open(
                `https://www.google.com/maps/search/?api=1&query=${query}`,
                "_blank"
            )
        }
    } else {
        domElements.modalMapBtn.style.display = "none"
    }


    domElements.backdrop.classList.add("open")
    document.body.style.overflow = "hidden"
}

function closeModal() {
    domElements.backdrop.classList.remove("open")
    document.body.style.overflow = ""
    setTimeout(() => {
        domElements.modalImg.src = ""
    }, 300)
}

function startCountdowns() {
    const updateTimers = () => {
        document.querySelectorAll(".countdown").forEach(element => {
            const targetDate = new Date(element.dataset.date).getTime()
            const diff = targetDate - new Date().getTime()

            if (diff < 0) {
                element.innerText = "Live/End"
                return
            }

            const days = Math.floor(diff / 864e5)
            const hours = Math.floor((diff % 864e5) / 36e5)
            const minutes = Math.floor((diff % 36e5) / 6e4)
            const seconds = Math.floor((diff % 6e4) / 1000)

            element.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`

        })
    }

    updateTimers()
    state.timers.push(setInterval(updateTimers, 1000))
}

export function clearTimers() {
    state.timers.forEach(clearInterval)
    state.timers = []
}

function addToCalendar(event) {
    // 2024-03-14T14:30:05Z
    const start = event.dates.start.dateTime ?
        event.dates.start.dateTime.replace(/[-:.]/g, "")
        : event.dates.start.localDate.replace(/[-:.]/g, "") + "T000000Z";

    const end = start
    const title = encodeURIComponent(event.name)
    const details = encodeURIComponent(event.info)
    const location = encodeURIComponent(event._embedded?.venues?.[0]?.name)
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}&sf=true&output=xml`
    window.open(url, "_blank")
}

window.toggleFav = function (event, id) {
    event.stopPropagation()

    const allEvents = [...state.events, ...state.favorites]
    const eventData = allEvents.find(findEvent => findEvent.id === id)
    const favEventIndex = state.favorites.findIndex(findEvent => findEvent.id === id)

    if (favEventIndex === -1) {
        state.favorites.push(eventData)
    } else {
        state.favorites.splice(favEventIndex, 1)
    }

    localStorage.setItem("fav-events", JSON.stringify(state.favorites))

    state.showOnlyFav ? renderEvents(state.favorites) : renderEvents(state.events)
}

async function shareEventData(event) {
    try {
        await navigator.clipboard.writeText(event.url)

        const originalText = domElements.modalShareBtn.innerText
        domElements.modalShareBtn.innerText = "✅ Copied"
        domElements.modalShareBtn.style.backgroundColor = "#28a745"

        setTimeout(() => {
            domElements.modalShareBtn.innerText = originalText
            domElements.modalShareBtn.style.backgroundColor = "#444444"
        }, 2000)

    } catch (error) {
        console.error(error)
    }
}

function renderModalPrices(priceRanges) {
    domElements.modalPrices.innerHTML = ""
    console.log(priceRanges)

    if (!priceRanges || priceRanges.length === 0) {
        domElements.modalPrices.innerHTML = '<p class="price-info">Prices not available</p>'
        return
    }

    priceRanges.forEach(range => {
        const min = range.min ? range.min.toFixed(2) : "N/A"
        const max = range.max ? range.max.toFixed(2) : "N/A"
        const currency = range.currency || ""
        const type = range.type ? `<span class="price-type">(${range.type})</span>` : ""

        const priceHtml = `<div class="price-row">
            <span class="price-label">💲Price</span>
            <span class="price-value">${currency}${min} - ${currency}${max}</span>
            ${type}
        </div>`

        domElements.modalPrices.insertAdjacentHTML("beforeend", priceHtml)
    })
}

async function displayWeather(lat, lon, eventDate) {
    const today = new Date()
    const targetDate = new Date(eventDate)
    const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=en`
        );

        const data = await response.json()
        const forecast = data.list.find(item => item.dt_txt.includes(eventDate)) || data.list[0]
        if (forecast) {
            const temp = Math.round(forecast.main.temp)
            const desc = forecast.weather[0].description
            const icon = forecast.weather[0].icon
            const isRain = forecast.weather[0].main.toLowerCase().includes("rain");

            domElements.modalWeather.innerHTML = `
            <div class="weather-badge ${isRain ? "weather-rain" : ""}">
              <img src="https://openweathermap.org/img/wn/${icon}.png" alt="weather">
              <span>${temp}°C, ${desc}</span>
              ${isRain ? '<strong> ☂️ Take an umbrella!</strong>' : ''}
            </div>`
        }
    } catch (error) {
        console.error(error)
    }
}