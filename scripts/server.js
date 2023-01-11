var options = "{options}"

var prefix = "[Better Pterodactyl] "
var storageAmounts = [
    "iB",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB"
]

console.log(prefix + "Successfully injected Better Pterodactyl script.")
if (!window.PterodactylUser.root_admin) console.warn(prefix + "Your logged in as a normal user, certain things may not work.")

function setInnerText(element, text) {
    var currentText = element.innerText

    for (var i = 0; i < element.children.length; i++) {
        currentText = currentText.replace(element.children.item(i).outerHTML, "").replace("&nbsp;", " ").trim()
    }

    element.innerHTML = element.innerHTML.replace(currentText, text)
}

fetch("/api/client/servers/" + window.location.pathname.split("/")[2]).then(res => res.json()).then(server => {
    var element = document.querySelector(".ContentContainer-sc-x3r2dw-0")

    if (options["server-show-all-ports"]) {
        var ports = []

        server.attributes.relationships.allocations.data.forEach(allocation => {
            ports.push(allocation.attributes.port)
        })

        element.children.item(1).children.item(1).children.item(0).children.item(2).children.item(1).innerText = ports.join(", ")
    }

    if (options["server-remove-ports"]) {
        element.children.item(1).children.item(1).children.item(0).remove()
    }

    if (options["server-remove-graphs"]) {
        element.children.item(2).remove()
    }

    var backupsSize = 0

    if (options["files-include-backups"]) {
        fetch("/api/client/servers/" + server.attributes.uuid + "/backups").then(res => res.json()).then(data => {
            data.data.forEach(backup => {
                backupsSize += backup.attributes.bytes
            })

            fetch("/api/client/servers/" + server.attributes.uuid + "/websocket").then(res => res.json()).then(data => {
                var socket = new WebSocket(data.data.socket)

                socket.addEventListener("open", () => {
                    socket.send(JSON.stringify({ event: "auth", args: [data.data.token] }))
                })

                socket.addEventListener("message", event => {
                    var message = JSON.parse(event.data)

                    if (message.event == "auth success") {
                        socket.send(JSON.stringify({ event: "send stats", args: [null] }))
                    } else if (message.event == "token expiring") {
                        fetch("/api/client/servers/" + server.attributes.uuid + "/websocket").then(res => res.json()).then(data => {
                            socket.send(JSON.stringify({ event: "auth", args: [data.data.token] }))
                        })
                    } else if (message.event == "token expired") {
                        socket.close()
                    } else if (message.event == "stats") {
                        var storage = JSON.parse(message.args[0]).disk_bytes + backupsSize
                        var storageValue = 0

                        while (storage > 1024) {
                            storage = storage / 1024
                            storageValue++
                        }

                        setInnerText(element.children.item(1).children.item(1).children.item(4).children.item(2).children.item(1), (Math.round(storage * 100) / 100).toFixed(2) + " " + storageAmounts[storageValue])
                    }

                    var prevLocation = document.location.href
                    new MutationObserver(() => {
                        if (prevLocation != document.location.href) {
                            prevLocation = document.location.href

                            socket.close()
                        }
                    }).observe(document, { childList: true, subtree: true })
                })
            })
        })
    }
})