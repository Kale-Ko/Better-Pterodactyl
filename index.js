if (document.readyState == "complete") {
    init()
} else {
    window.addEventListener("load", () => {
        init()
    })
}

var prefix = "[Better Pterodactyl] "
var debugPrefix = "[Debug] "
var debug = true

var storageAmounts = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
    "PB"
]

function init() {
    load()

    var prevLocation = document.location.href
    new MutationObserver(() => {
        if (prevLocation != document.location.href) {
            prevLocation = document.location.href

            load()
        }
    }).observe(document.body, { childList: true, subtree: true })
}

function load() {
    browser.storage.sync.get("options").then(data => {
        var options = data.options

        if (document.querySelector(".App___StyledDiv-sc-2l91w7-0") != null) {
            console.log(prefix + "Injecting Better Pterodactyl script")

            if (window.location.pathname == "/") {
                var scriptElement = document.createElement("script")
                var scriptContents = document.createTextNode(`var options = ${JSON.stringify(options)}

var prefix = "${prefix}"
var debugPrefix = "${debugPrefix}"
var debug = ${debug}

var storageAmounts = ${JSON.stringify(storageAmounts)}

console.log(prefix + "Successfully injected Better Pterodactyl script")
if (!window.PterodactylUser.root_admin) console.warn(prefix + "Your logged in as a normal user, certain things may not work")

fetch("/api/client?page=1" + (document.querySelector(".Input-sc-19rce1w-0").checked ? "&type=admin" : "")).then(res => res.json()).then(data => {
    if (options["dashboard-reorder-servers"] && window.PterodactylUser.root_admin) {
        var done = 0
        data.data.forEach(server => {
            fetch("/api/application/servers/" + server.attributes.internal_id).then(res => res.json()).then(data2 => {
                data.data[data.data.indexOf(server)] = { ...data2, attributes: { ...data.data[data.data.indexOf(server)].attributes, ...data2.attributes } }

                done++

                if (done == data.data.length) {
                    next()
                }
            })
        })
    } else {
        next()
    }

    function next() {
        if (options["dashboard-reorder-servers"] && window.PterodactylUser.root_admin) {
            data.data.sort((a, b) => {
                if (a.attributes.external_id > b.attributes.external_id) {
                    return 1
                } else if (b.attributes.external_id > a.attributes.external_id) {
                    return -1
                } else {
                    return 0
                }
            })

            var elements = {}

            data.data.forEach(server => {
                document.querySelectorAll(".GreyRowBox-sc-1xo9c6v-0").forEach(element => {
                    if (element.href.split("/")[4] == server.attributes.identifier) {
                        elements[server.attributes.uuid] = element.cloneNode(true)

                        element.remove()

                        document.querySelector(".ContentContainer-sc-x3r2dw-0").appendChild(elements[server.attributes.uuid])
                    }
                })
            })
        }

        data.data.forEach(server => {
            document.querySelectorAll(".GreyRowBox-sc-1xo9c6v-0").forEach(element => {
                if (element.href.split("/")[4] == server.attributes.identifier) {
                    if (options["dashboard-show-all-ports"]) {
                        var ports = ""

                        server.attributes.relationships.allocations.data.forEach(allocation => {
                            ports += allocation.attributes.port + ", "
                        })

                        element.children.item(1).children.item(0).children.item(1).innerHTML = ports.substring(0, ports.length - 2)
                    }

                    if (options["dashboard-remove-ports"]) {
                        element.children.item(1).children.item(0).remove()
                    }

                    var backupsSize = 0

                    if (options["files-include-backups"]) {
                        fetch("/api/client/servers/" + server.attributes.uuid + "/backups").then(res => res.json()).then(data => {
                            data.data.forEach(backup => {
                                backupsSize += backup.attributes.bytes
                            })

                            if (!options["dashboard-live-stats"]) {
                                fetch("/api/client/servers/" + server.attributes.uuid + "/resources").then(res => res.json()).then(data => {
                                    var storage = data.attributes.resources.disk_bytes + backupsSize
                                    var storageValue = 0

                                    while (storage > 1024) {
                                        storage = storage / 1024
                                        storageValue++
                                    }

                                    element.children.item(2).children.item(2).children.item(0).children.item(1).innerHTML = (Math.round(storage * 100) / 100).toFixed(2) + " " + storageAmounts[storageValue]
                                })
                            }
                        })
                    }

                    if (options["dashboard-live-stats"]) {
                        fetch("/api/client/servers/" + server.attributes.uuid + "/websocket").then(res => res.json()).then(data => {
                            var socket = new WebSocket(data.data.socket)

                            socket.addEventListener("open", e => {
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
                                } else if (message.event == "status") {
                                    element.classList.remove("fRwFrz")
                                    element.classList.remove("fwbDSe")
                                    element.classList.remove("kVijQB")

                                    if (message.args[0] == "running") {
                                        element.classList.add("fRwFrz")
                                    } else if (message.args[0] == "offline") {
                                        element.classList.add("fwbDSe")
                                    } else if (message.args[0] == "starting" || message.args[0] == "stopping") {
                                        element.classList.add("kVijQB")
                                    }
                                } else if (message.event == "stats") {
                                    element.children.item(2).children.item(0).children.item(0).children.item(1).innerHTML = (Math.round(JSON.parse(message.args[0]).cpu_absolute * 100) / 100).toFixed(2) + "%"

                                    var memory = JSON.parse(message.args[0]).memory_bytes
                                    var memoryValue = 0

                                    while (memory > 1024) {
                                        memory = memory / 1024
                                        memoryValue++
                                    }

                                    element.children.item(2).children.item(1).children.item(0).children.item(1).innerHTML = (Math.round(memory * 100) / 100).toFixed(2) + " " + storageAmounts[memoryValue]

                                    var storage = JSON.parse(message.args[0]).disk_bytes + backupsSize
                                    var storageValue = 0

                                    while (storage > 1024) {
                                        storage = storage / 1024
                                        storageValue++
                                    }

                                    element.children.item(2).children.item(2).children.item(0).children.item(1).innerHTML = (Math.round(storage * 100) / 100).toFixed(2) + " " + storageAmounts[storageValue]

                                    element.classList.remove("fRwFrz")
                                    element.classList.remove("fwbDSe")
                                    element.classList.remove("kVijQB")

                                    if (JSON.parse(message.args[0]).state == "running") {
                                        element.classList.add("fRwFrz")
                                    } else if (JSON.parse(message.args[0]).state == "offline") {
                                        element.classList.add("fwbDSe")

                                        element.children.item(2).children.item(0).children.item(0).children.item(1).innerHTML = "---"
                                        element.children.item(2).children.item(1).children.item(0).children.item(1).innerHTML = "---"
                                    } else if (JSON.parse(message.args[0]).state == "starting" || JSON.parse(message.args[0]).state == "stopping") {
                                        element.classList.add("kVijQB")
                                    }
                                }
                            })

                            var prevLocation = document.location.href
                            new MutationObserver(() => {
                                if (prevLocation != document.location.href) {
                                    prevLocation = document.location.href
                        
                                    socket.close()
                                }
                            }).observe(document.body, { childList: true, subtree: true })
                        })
                    }
                }
            })
        })
    }
})`)
                scriptElement.append(scriptContents)
                document.body.appendChild(scriptElement)
            } else if (window.location.pathname.startsWith("/server/") && window.location.pathname.split("/").length == 3) {
                var scriptElement = document.createElement("script")
                var scriptContents = document.createTextNode(`var options = ${JSON.stringify(options)}

var prefix = "${prefix}"
var debugPrefix = "${debugPrefix}"
var debug = ${debug}

var storageAmounts = ${JSON.stringify(storageAmounts)}

console.log(prefix + "Successfully injected Better Pterodactyl script")
if (!window.PterodactylUser.root_admin) console.warn(prefix + "Your logged in as a normal user, certain things may not work")

function setInnerText(element, text) {
    var currentText = element.innerHTML

    for (var i = 0; i < element.children.length; i++) {
        currentText = currentText.replace(element.children.item(i).outerHTML, "").replace("&nbsp;", "").trim()
    }

    element.innerHTML = element.innerHTML.replace(currentText, text)
}

fetch("/api/client/servers/" + window.location.pathname.split("/")[2]).then(res => res.json()).then(server => {
    var element = document.querySelector(".ContentContainer-sc-x3r2dw-0")

    if (options["server-show-all-ports"]) {
        var ports = ""

        server.attributes.relationships.allocations.data.forEach(allocation => {
            ports += allocation.attributes.port + ", "
        })

        element.children.item(1).children.item(1).children.item(0).children.item(2).children.item(1).innerHTML = ports.substring(0, ports.length - 2)
    }

    var backupsSize = 0

    if (options["files-include-backups"]) {
        fetch("/api/client/servers/" + server.attributes.uuid + "/backups").then(res => res.json()).then(data => {
            data.data.forEach(backup => {
                backupsSize += backup.attributes.bytes
            })

            if (!options["server-live-stats"]) {
                fetch("/api/client/servers/" + server.attributes.uuid + "/resources").then(res => res.json()).then(data => {
                    var storage = data.attributes.resources.disk_bytes + backupsSize
                    var storageValue = 0

                    while (storage > 1024) {
                        storage = storage / 1024
                        storageValue++
                    }

                    setInnerText(element.children.item(1).children.item(1).children.item(4).children.item(2).children.item(1), (Math.round(storage * 100) / 100).toFixed(2) + " " + storageAmounts[storageValue])
                })
            }
        })
    }

    fetch("/api/client/servers/" + server.attributes.uuid + "/websocket").then(res => res.json()).then(data => {
        var socket = new WebSocket(data.data.socket)

        socket.addEventListener("open", e => {
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
                setInnerText(element.children.item(1).children.item(1).children.item(2).children.item(2).children.item(1), (Math.round(JSON.parse(message.args[0]).cpu_absolute * 100) / 100).toFixed(2) + "%")

                var memory = JSON.parse(message.args[0]).memory_bytes
                var memoryValue = 0

                while (memory > 1024) {
                    memory = memory / 1024
                    memoryValue++
                }

                setInnerText(element.children.item(1).children.item(1).children.item(3).children.item(2).children.item(1), (Math.round(memory * 100) / 100).toFixed(2) + " " + storageAmounts[memoryValue])

                var storage = JSON.parse(message.args[0]).disk_bytes + backupsSize
                var storageValue = 0

                while (storage > 1024) {
                    storage = storage / 1024
                    storageValue++
                }

                setInnerText(element.children.item(1).children.item(1).children.item(4).children.item(2).children.item(1), (Math.round(storage * 100) / 100).toFixed(2) + " " + storageAmounts[storageValue])

                if (JSON.parse(message.args[0]).state == "offline") {
                    setInnerText(element.children.item(1).children.item(1).children.item(2).children.item(2).children.item(1), "---")
                    setInnerText(element.children.item(1).children.item(1).children.item(3).children.item(2).children.item(1), "---")
                }
            }
        })

        var prevLocation = document.location.href
        new MutationObserver(() => {
            if (prevLocation != document.location.href) {
                prevLocation = document.location.href
    
                socket.close()
            }
        }).observe(document.body, { childList: true, subtree: true })
    })
})`)
                scriptElement.append(scriptContents)
                document.body.appendChild(scriptElement)
            }
        }
    })
}