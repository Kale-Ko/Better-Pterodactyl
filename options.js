browser.storage.sync.get("options").then(data => {
    var options = data.options

    if (options == undefined) {
        options = {}
    }

    var optionKeys = []

    document.querySelectorAll(".options>.options-category>.option>.option-label>.option-value").forEach(option => {
        if (options[option.id] != undefined) {
            if (option.value == "on" || option.value == "off") {
                option.checked = options[option.id]
            } else {
                option.value = options[option.id]
            }
        } else {
            options[option.id] = ((option.value == "on" || option.value == "off") ? option.checked : option.value)
        }

        optionKeys.push(option.id)

        option.addEventListener("change", () => {
            options[option.id] = ((option.value == "on" || option.value == "off") ? option.checked : option.value)

            browser.storage.sync.set({ options })
        })
    })

    for (key in options) {
        if (!optionKeys.includes(key)) {
            delete options[key]
        }
    }

    browser.storage.sync.set({ options })
})