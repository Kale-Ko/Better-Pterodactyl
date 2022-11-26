browser.storage.sync.get("options").then(data => {
    var options = data.options

    if (options == undefined) {
        options = {}
    }

    browser.storage.sync.set({ options })

    document.querySelectorAll(".options>.options-category>.option>.option-label>.option-value").forEach(option => {
        if (options[option.id] != undefined) {
            if (option.value == "on" || option.value == "off") {
                option.checked = options[option.id]
            } else {
                option.value = options[option.id]
            }
        } else {
            options[option.id] = (option.checked != undefined ? option.checked : option.value)
        }

        browser.storage.sync.set({ options })

        option.addEventListener("change", () => {
            options[option.id] = ((option.value == "on" || option.value == "off") ? option.checked : option.value)

            browser.storage.sync.set({ options })
        })
    })
})