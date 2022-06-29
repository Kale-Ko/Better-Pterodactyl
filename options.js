browser.storage.sync.get("options").then(data => {
    var options = data.options

    if (options == undefined) {
        options = {}
    }

    browser.storage.sync.set({ options })

    document.querySelectorAll("div.options>div.options-category>p.option-label>input.option").forEach(option => {
        if (options[option.id] != undefined) {
            if (option.checked != undefined) {
                option.checked = options[option.id]
            } else {
                option.value = options[option.id]
            }
        } else {
            options[option.id] = (option.checked != undefined ? option.checked : option.value)
        }

        option.addEventListener("change", () => {
            options[option.id] = (option.checked != undefined ? option.checked : option.value)

            browser.storage.sync.set({ options })

            // browser.tabs.query({ }, tabs => {
            //     tabs.forEach(tab => {
            //         browser.tabs.reload(tab.id)
            //     })
            // })
        })
    })
})