import { countries, domElements, categories} from "./shared/constants.js"
import { fetchEvents } from "./api/api.js"

countries.forEach(country => {
    const option = document.createElement("option")
    option.value = country.code
    option.innerText = country.name
    domElements.countrySelect.appendChild(option)
})

categories.forEach(category => {
    const option = document.createElement("option")
    option.value = category.value
    option.innerText = category.label
    domElements.categorySelect.appendChild(option)
}) 

fetchEvents()