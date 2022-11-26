var prefix = "[Better Pterodactyl] "

var storageAmounts = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
    "PB"
]

window.addEventListener("load", () => {
    load()
})

if (document.readyState == "complete") {
    load()
}

var prevLocation = document.location.href
new MutationObserver(() => {
    if (prevLocation != document.location.href) {
        prevLocation = document.location.href

        if (document.readyState == "complete") {
            load()
        }
    }
}).observe(document, { childList: true, subtree: true })

function load() {
    browser.storage.sync.get("options").then(data => {
        var options = data.options

        if (document.querySelector(".App___StyledDiv-sc-2l91w7-0") != null) {
            console.log(prefix + "Injecting Better Pterodactyl script.")

            if (window.location.pathname == "/") {
                var scriptElement = document.createElement("script")
                var scriptContents = document.createTextNode(`var options = ${JSON.stringify(options)}
var prefix = "${prefix}"

var storageAmounts = ${JSON.stringify(storageAmounts)}

console.log(prefix + "Successfully injected Better Pterodactyl script.")
if (!window.PterodactylUser.root_admin) console.warn(prefix + "Your logged in as a normal user, certain things may not work.")

fetch("/api/client?page=1" + ((document.querySelector(".Input-sc-19rce1w-0") != null ? document.querySelector(".Input-sc-19rce1w-0").checked : false) ? "&type=admin" : "")).then(res => res.json()).then(data => {
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
        if (options["dashboard-reorder-servers"]) {
            if (options["dashboard-reorder-servers-mode"] == "external-id" && window.PterodactylUser.root_admin) {
                data.data.sort((a, b) => {
                    if (a.attributes.external_id > b.attributes.external_id) {
                        return 1
                    } else if (b.attributes.external_id > a.attributes.external_id) {
                        return -1
                    } else {
                        return 0
                    }
                })
            } else if (options["dashboard-reorder-servers-mode"] == "reverse-external-id" && window.PterodactylUser.root_admin) {
                data.data.sort((a, b) => {
                    if (a.attributes.external_id < b.attributes.external_id) {
                        return 1
                    } else if (b.attributes.external_id < a.attributes.external_id) {
                        return -1
                    } else {
                        return 0
                    }
                })
            } else if (options["dashboard-reorder-servers-mode"] == "name") {
                data.data.sort((a, b) => {
                    if (a.attributes.name > b.attributes.name) {
                        return 1
                    } else if (b.attributes.name > a.attributes.name) {
                        return -1
                    } else {
                        return 0
                    }
                })
            } else if (options["dashboard-reorder-servers-mode"] == "reverse-name") {
                data.data.sort((a, b) => {
                    if (a.attributes.name < b.attributes.name) {
                        return 1
                    } else if (b.attributes.name < a.attributes.name) {
                        return -1
                    } else {
                        return 0
                    }
                })
            } else {
                data.data.sort((a, b) => {
                    if (a.attributes.name > b.attributes.name) {
                        return 1
                    } else if (b.attributes.name > a.attributes.name) {
                        return -1
                    } else {
                        return 0
                    }
                })
            }

            var elements = {}

            var first = true
            data.data.forEach(server => {
                document.querySelectorAll(".GreyRowBox-sc-1xo9c6v-0").forEach(element => {
                    if (element.href.split("/")[4] == server.attributes.identifier) {
                        elements[server.attributes.uuid] = element.cloneNode(true)

                        element.remove()

                        if (first) {
                            if (elements[server.attributes.uuid].classList.contains("jbVWLN")) {
                                elements[server.attributes.uuid].classList.remove("jbVWLN")
                            }

                            first = false
                        } else if (!elements[server.attributes.uuid].classList.contains("jbVWLN")) {
                            elements[server.attributes.uuid].classList.add("jbVWLN")
                        }

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
                            }).observe(document, { childList: true, subtree: true })
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

var storageAmounts = ${JSON.stringify(storageAmounts)}

console.log(prefix + "Successfully injected Better Pterodactyl script.")
if (!window.PterodactylUser.root_admin) console.warn(prefix + "Your logged in as a normal user, certain things may not work.")

function setInnerText(element, text) {
    var currentText = element.innerHTML

    for (var i = 0; i < element.children.length; i++) {
        currentText = currentText.replace(element.children.item(i).outerHTML, "").replace("&nbsp;", " ").trim()
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
})`)
                scriptElement.append(scriptContents)
                document.body.appendChild(scriptElement)
            }
        } else if (document.querySelector("div.sc-2l91w7-0.kDhnAT") != null) {
            console.log(prefix + "Injecting Better Pterodactyl script.")

            if (window.location.pathname == "/") {
                var scriptElement = document.createElement("script")
                var scriptContents = document.createTextNode(`var options = ${JSON.stringify(options)}
var prefix = "${prefix}"

var storageAmounts = ${JSON.stringify(storageAmounts)}

console.log(prefix + "Successfully injected Better Pterodactyl script.")
console.warn(prefix + "Your running an old version of the panel, certain things may not work.")

fetch("/api/client?page=1" + ((document.querySelector(".sc-19rce1w-0") != null ? document.querySelector(".sc-19rce1w-0").checked : false) ? "&type=admin" : "")).then(res => res.json()).then(data => {
    if (options["dashboard-reorder-servers"]) {
        if (options["dashboard-reorder-servers-mode"] == "name") {
            data.data.sort((a, b) => {
                if (a.attributes.name > b.attributes.name) {
                    return 1
                } else if (b.attributes.name > a.attributes.name) {
                    return -1
                } else {
                    return 0
                }
            })
        } else if (options["dashboard-reorder-servers-mode"] == "reverse-name") {
            data.data.sort((a, b) => {
                if (a.attributes.name < b.attributes.name) {
                    return 1
                } else if (b.attributes.name < a.attributes.name) {
                    return -1
                } else {
                    return 0
                }
            })
        } else {
            data.data.sort((a, b) => {
                if (a.attributes.name > b.attributes.name) {
                    return 1
                } else if (b.attributes.name > a.attributes.name) {
                    return -1
                } else {
                    return 0
                }
            })
        }

        var elements = {}

        var first = true
        data.data.forEach(server => {
            document.querySelectorAll(".sc-1xo9c6v-0.sc-1ibsw91-2.sc-1topkxf-2").forEach(element => {
                if (element.href.split("/")[4] == server.attributes.identifier) {
                    elements[server.attributes.uuid] = element.cloneNode(true)

                    element.remove()

                    if (first) {
                        if (elements[server.attributes.uuid].classList.contains("dCyGGM")) {
                            elements[server.attributes.uuid].classList.remove("dCyGGM")
                        }

                        first = false
                    } else if (!elements[server.attributes.uuid].classList.contains("dCyGGM")) {
                        elements[server.attributes.uuid].classList.add("dCyGGM")
                    }

                    document.querySelector(".x3r2dw-0.kbxq2g-0").appendChild(elements[server.attributes.uuid])
                }
            })
        })
    }

    data.data.forEach(server => {
        document.querySelectorAll(".sc-1xo9c6v-0.sc-1ibsw91-2.sc-1topkxf-2").forEach(element => {
            if (element.href.split("/")[4] == server.attributes.identifier) {
                if (options["dashboard-show-all-ports"]) {
                    var ports = ""

                    server.attributes.relationships.allocations.data.forEach(allocation => {
                        ports += allocation.attributes.port + ", "
                    })

                    element.children.item(1).children.item(1).innerHTML = ports.substring(0, ports.length - 2)
                }

                if (options["dashboard-remove-ports"]) {
                    element.children.item(1).children.item(0).remove()
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
                                element.classList.remove("liBonM")
                                element.classList.remove("jqQFoq")
                                element.classList.remove("lpPPi")

                                if (message.args[0] == "running") {
                                    element.classList.add("liBonM")
                                } else if (message.args[0] == "offline") {
                                    element.classList.add("jqQFoq")
                                } else if (message.args[0] == "starting" || message.args[0] == "stopping") {
                                    element.classList.add("lpPPi")
                                }
                            } else if (message.event == "stats") {
                                if (element.children.item(2).children.length == 1) {
                                    return
                                }

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

                                element.classList.remove("liBonM")
                                element.classList.remove("jqQFoq")
                                element.classList.remove("lpPPi")

                                if (JSON.parse(message.args[0]).state == "running") {
                                    element.classList.add("liBonM")
                                } else if (JSON.parse(message.args[0]).state == "offline") {
                                    element.classList.add("jqQFoq")

                                    element.children.item(2).children.item(0).children.item(0).children.item(1).innerHTML = "---"
                                    element.children.item(2).children.item(1).children.item(0).children.item(1).innerHTML = "---"
                                } else if (JSON.parse(message.args[0]).state == "starting" || JSON.parse(message.args[0]).state == "stopping") {
                                    element.classList.add("lpPPi")
                                }
                            }
                        })

                        var prevLocation = document.location.href
                        new MutationObserver(() => {
                            if (prevLocation != document.location.href) {
                                prevLocation = document.location.href

                                socket.close()
                            }
                        }).observe(document, { childList: true, subtree: true })
                    })
                }
            }
        })
    })
})`)
                scriptElement.append(scriptContents)
                document.body.appendChild(scriptElement)
            } else if (window.location.pathname.startsWith("/server/") && window.location.pathname.split("/").length == 3) {
                var scriptElement = document.createElement("script")
                var scriptContents = document.createTextNode(`var options = ${JSON.stringify(options)}
var prefix = "${prefix}"

var storageAmounts = ${JSON.stringify(storageAmounts)}

console.log(prefix + "Successfully injected Better Pterodactyl script.")
console.warn(prefix + "Your running an old version of the panel, certain things may not work.")

function setInnerText(element, text) {
    var currentText = element.innerHTML

    for (var i = 0; i < element.children.length; i++) {
        currentText = currentText.replace(element.children.item(i).outerHTML, "").replace("&nbsp;", " ").trim()
    }

    element.innerHTML = element.innerHTML.replace(currentText, text)
}

fetch("/api/client/servers/" + window.location.pathname.split("/")[2]).then(res => res.json()).then(server => {
    var element = document.querySelector(".x3r2dw-0.kbxq2g-0.sc-1j2y518-0")

    if (options["server-show-all-ports"]) {
        var ports = ""

        server.attributes.relationships.allocations.data.forEach(allocation => {
            ports += allocation.attributes.port + ", "
        })

        element.children.item(0).children.item(0).children.item(1).children.item(2).children.item(1).innerHTML = ports.substring(0, ports.length - 2)
    }

    if (options["server-remove-ports"]) {
        element.children.item(0).children.item(0).children.item(1).children.item(2).remove()
    }

    if (options["server-remove-graphs"]) {
        element.children.item(1).children.item(1).remove()
    }

    var backupsSize = 0

    if (options["files-include-backups"]) {
        fetch("/api/client/servers/" + server.attributes.uuid + "/backups").then(res => res.json()).then(data => {
            data.data.forEach(backup => {
                backupsSize += backup.attributes.bytes
            })

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
                        var storage = JSON.parse(message.args[0]).disk_bytes + backupsSize
                        var storageValue = 0

                        while (storage > 1024) {
                            storage = storage / 1024
                            storageValue++
                        }

                        setInnerText(element.children.item(0).children.item(0).children.item(1).children.item(5), (Math.round(storage * 100) / 100).toFixed(2) + " " + storageAmounts[storageValue])
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
})`)
                scriptElement.append(scriptContents)
                document.body.appendChild(scriptElement)
            }
        }
    })
}