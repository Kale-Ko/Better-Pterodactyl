var prefix = "[Better Pterodactyl] "

var storageAmounts = [
    "iB",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB"
]

if (document.readyState == "complete") {
    load()
} else {
    window.addEventListener("load", () => {
        load()
    })
}

var prevLocation = document.location.href
new MutationObserver(() => {
    if (document.location.href != prevLocation) {
        prevLocation = document.location.href

        if (document.readyState == "complete") {
            load()
        } else {
            window.addEventListener("load", () => {
                load()
            })
        }
    }
}).observe(document, { childList: true, subtree: true })

function load() {
    if (document.querySelector(".App___StyledDiv-sc-2l91w7-0") != null) {
        console.log(prefix + "Injecting Better Pterodactyl script.")

        browser.storage.sync.get("options").then(data => {
            var options = data.options

            if (window.location.pathname == "/") {
                fetch(browser.runtime.getURL("/scripts/panel.js")).then(res => res.text()).then(script => {
                    var scriptElement = document.createElement("script")
                    var scriptContents = document.createTextNode(script.replace("\"{options}\"", JSON.stringify(options)).replace("\"{prefix}\"", "\"" + prefix + "\"").replace("\"{storageAmounts}\"", JSON.stringify(storageAmounts)))
                    scriptElement.append(scriptContents)
                    document.body.appendChild(scriptElement)
                })
            } else if (window.location.pathname.startsWith("/server/") && window.location.pathname.split("/").length == 3) {
                fetch(browser.runtime.getURL("/scripts/server.js")).then(res => res.text()).then(script => {
                    var scriptElement = document.createElement("script")
                    var scriptContents = document.createTextNode(script.replace("\"{options}\"", JSON.stringify(options)).replace("\"{prefix}\"", "\"" + prefix + "\"").replace("\"{storageAmounts}\"", JSON.stringify(storageAmounts)))
                    scriptElement.append(scriptContents)
                    document.body.appendChild(scriptElement)
                })
            } else {
                console.log(prefix + "Canceled, nothing to inject.")
            }
        })
    }
}