import { renderSkeletons, renderEvents, renderPagination, clearTimers } from "../shared/utils.js"
import { API_KEY, API_URL, state, domElements } from "../shared/constants.js"

domElements.searchBtn.addEventListener('click', handleSearch)

domElements.sizeSelect.addEventListener("change", () => {
    state.size = parseInt(domElements.sizeSelect.value)
    fetchEvents()
})

domElements.searchInput.addEventListener("keypress", (event) => {
    if (event.key === 'Enter') handleSearch()
})

export async function fetchEvents() {
    renderSkeletons()
    clearTimers()

    if (state.showOnlyFav) {
        const findFavEvents = state.favorites.filter(event => event.name.includes(domElements.searchInput.value.trim()))
        if (findFavEvents.length) {
            renderEvents(findFavEvents)
        } else {
            domElements.eventsContainer.innerHTML = `<p style="text-align: center; grid-column: 1/-1;">No data</p>`
        }
        return
    }

    try {
        let url = `${API_URL}?apikey=${API_KEY}&size=${state.size}&page=${state.page}`

        if (state.keyword) {
            url += `&keyword=${encodeURIComponent(state.keyword)}`
        }

        if (state.countryCode) {
            url += `&countryCode=${state.countryCode}`
        }

        if (state.category) {
            url += `&classificationName=${state.category}`
        }

        if (state.latlong) {
            url += `&latlong=${state.latlong}&radius=100&unit=km`
        }

        const response = await fetch(url)
        const data = await response.json()

        if (data._embedded && data._embedded.events) {
            const apiTotalPages = data.page.totalPages
            const maxAllowedPages = Math.floor(1000 / state.size)
            state.totalPages = Math.min(apiTotalPages, maxAllowedPages)
            state.events = data._embedded.events

            renderEvents(data._embedded.events)
            renderPagination()

        } else {
            state.totalPages = 0
            state.events = []
            domElements.eventsContainer.innerHTML = `<p style="text-align: center; grid-column: 1/-1;">No data</p>`
            domElements.paginationContainer.innerHTML = ""
        }

    } catch (error) {
        console.error(error)
    } finally {
        window.scrollTo({ top: 0 })
    }
}

export function handleSearch() {
    state.countryCode = domElements.countrySelect.value
    state.category = domElements.categorySelect.value
    state.keyword = domElements.searchInput.value.trim()
    state.page = 0
    fetchEvents()
}

fetchEvents()