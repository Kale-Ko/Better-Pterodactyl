var options = "{options}"
var prefix = "{prefix}"

var storageAmounts = "{storageAmounts}"

console.log(prefix + "Successfully injected Better Pterodactyl script.")
if (!window.PterodactylUser.root_admin) console.warn(prefix + "Your logged in as a normal user, certain things may not work.")

fetch("/api/client?page=1" + ((document.querySelector(".Input-sc-19rce1w-0") != null ? document.querySelector(".Input-sc-19rce1w-0").checked : false) ? "&type=admin" : "")).then(res => res.json()).then(data => {
    if (options["dashboard-reorder-servers"] && (options["dashboard-reorder-servers-mode"] == "external-id" || options["dashboard-reorder-servers-mode"] == "reverse-external-id") && window.PterodactylUser.root_admin) {
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
            }

            var elements = {}
            var first = true

            data.data.forEach(server => {
                document.querySelectorAll(".GreyRowBox-sc-1xo9c6v-0").forEach(element => {
                    if (element.href.split("/")[4] == server.attributes.identifier) {
                        elements[server.attributes.uuid] = element

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
                        var ports = []

                        server.attributes.relationships.allocations.data.forEach(allocation => {
                            ports.push(allocation.attributes.port)
                        })

                        element.children.item(1).children.item(0).children.item(1).innerText = ports.join(", ")
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

                                    element.children.item(2).children.item(2).children.item(0).children.item(1).innerText = (Math.round(storage * 100) / 100).toFixed(2) + " " + storageAmounts[storageValue]
                                })
                            }
                        })
                    }

                    if (options["dashboard-live-stats"]) {
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
                                    element.children.item(2).children.item(0).children.item(0).children.item(1).innerText = (Math.round(JSON.parse(message.args[0]).cpu_absolute * 100) / 100).toFixed(2) + "%"

                                    var memory = JSON.parse(message.args[0]).memory_bytes
                                    var memoryValue = 0

                                    while (memory > 1024) {
                                        memory = memory / 1024
                                        memoryValue++
                                    }

                                    element.children.item(2).children.item(1).children.item(0).children.item(1).innerText = (Math.round(memory * 100) / 100).toFixed(2) + " " + storageAmounts[memoryValue]

                                    var storage = JSON.parse(message.args[0]).disk_bytes + backupsSize
                                    var storageValue = 0

                                    while (storage > 1024) {
                                        storage = storage / 1024
                                        storageValue++
                                    }

                                    element.children.item(2).children.item(2).children.item(0).children.item(1).innerText = (Math.round(storage * 100) / 100).toFixed(2) + " " + storageAmounts[storageValue]

                                    element.classList.remove("fRwFrz")
                                    element.classList.remove("fwbDSe")
                                    element.classList.remove("kVijQB")

                                    if (JSON.parse(message.args[0]).state == "running") {
                                        element.classList.add("fRwFrz")
                                    } else if (JSON.parse(message.args[0]).state == "offline") {
                                        element.classList.add("fwbDSe")

                                        element.children.item(2).children.item(0).children.item(0).children.item(1).innerText = "---"
                                        element.children.item(2).children.item(1).children.item(0).children.item(1).innerText = "---"
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
})