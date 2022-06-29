if (document.readyState == "complete") {
    init()
} else {
    window.addEventListener("load", () => {
        init()
    })
}

const storageAmounts = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB"
]

function init() {
    load()

    var prevLocation = document.location.href

    var observer = new MutationObserver(() => {
        if (prevLocation != document.location.href) {
            prevLocation = document.location.href

            load()
        }
    })

    observer.observe(document.body, { childList: true, subtree: true })
}

function load() {
    browser.storage.sync.get("options").then(data => {
        var options = data.options

        if (document.querySelector("body>div#app>div.sc-2l91w7-0.kDhnAT>div.tupl2x-0.ebtnLL>div.tupl2x-2.fOFvgZ>div#logo") != null) {
            if (window.location.pathname == "/") {
                var scriptElement = document.createElement("script")
                var scriptContents = document.createTextNode(`var options = ${JSON.stringify(options)}

var storageAmounts = ${JSON.stringify(storageAmounts)}
fetch(window.location.origin + "/api/client?page=1" + (document.querySelector("body>div#app>div.sc-2l91w7-0.kDhnAT>div.sc-1p0gm8n-0.kaVYNu>section>div.x3r2dw-0.kbxq2g-0.evldyg.cZTZeB>div.sc-1topkxf-0.fJAYbi>div.sc-1nxt82m-2.iaLDif>div.sc-1nxt82m-0.sc-1nxt82m-1.gdhLjd.fjGjjM>input.sc-19rce1w-0.eDhiE").checked ? "&type=admin" : "")).then(res => res.json()).then(data => {
    data.data.forEach(server => {
        document.querySelectorAll("body>div#app>div.sc-2l91w7-0.kDhnAT>div.sc-1p0gm8n-0.kaVYNu>section>div.x3r2dw-0.kbxq2g-0.evldyg.cZTZeB>a.sc-1xo9c6v-0.sc-1ibsw91-2.kHuGmn.sc-1topkxf-2").forEach(element => {
            if (element.href.split("/")[4] == server.attributes.identifier) {
                if (options["dashboard-show-all-ports"]) {
                    var ports = ""

                    server.attributes.relationships.allocations.data.forEach(allocation => {
                        ports += allocation.attributes.port + ", "
                    })

                    element.querySelector("div.sc-1ibsw91-7.cNYQhw>p.sc-1ibsw91-9.bDMEQe").innerHTML = ports.substring(0, ports.length - 2)
                }

                if (options["dashboard-remove-ports"]) {
                    element.querySelector("div.sc-1ibsw91-7.cNYQhw>p.sc-1ibsw91-9.bDMEQe").remove()
                    element.querySelector("div.sc-1ibsw91-7.cNYQhw>svg.svg-inline--fa.fa-ethernet.fa-w-16.sc-1ibsw91-8.ewCkf").remove()
                }

                var backupsSize = 0

                if (options["files-include-backups"]) {
                    fetch(window.location.origin + "/api/client/servers/" + server.attributes.uuid + "/backups").then(res => res.json()).then(data => {
                        data.data.forEach(backup => {
                            backupsSize += backup.attributes.bytes

                            if (!options["dashboard-live-stats"]) {
                                fetch(window.location.origin + "/api/client/servers/" + server.attributes.uuid + "/resources").then(res => res.json()).then(data => {
                                    var storage = data.attributes.resources.disk_bytes + backupsSize
                                    var storageValue = 0
    
                                    while (storage > 1024) {
                                        storage = storage / 1024
                                        storageValue++
                                    }
    
                                    element.querySelector("div.sc-1ibsw91-10.cFJOIm>div.sc-1ibsw91-21.clbnEU>div.sc-1ibsw91-22.hXevPX>p.sc-1ibsw91-1.cUvpcr").innerHTML = (Math.round(storage * 100) / 100).toFixed(2) + " " + storageAmounts[storageValue]
                                })
                            }
                        })
                    })
                }

                if (options["dashboard-live-stats"]) {
                    fetch(window.location.origin + "/api/client/servers/" + server.attributes.uuid + "/websocket").then(res => res.json()).then(data => {
                        var socket = new WebSocket(data.data.socket)

                        socket.addEventListener("open", e => {
                            socket.send(JSON.stringify({ event: "auth", args: [data.data.token] }))
                        })

                        socket.addEventListener("message", event => {
                            var message = JSON.parse(event.data)

                            if (message.event == "auth success") {
                                socket.send(JSON.stringify({ event: "send stats", args: [null] }))
                            } else if (message.event == "token expiring") {
                                fetch(window.location.origin + "/api/client/servers/" + server.attributes.uuid + "/websocket").then(res => res.json()).then(data => {
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
                                var statselement = element.querySelector("div.sc-1ibsw91-10.cFJOIm")

                                statselement.querySelector("div.sc-1ibsw91-15.dRlStv>div.sc-1ibsw91-16.kaRbRM>p.sc-1ibsw91-1.cUvpcr").innerHTML = (Math.round(JSON.parse(message.args[0]).cpu_absolute * 100) / 100).toFixed(2) + "%"

                                var memory = JSON.parse(message.args[0]).memory_bytes
                                var memoryValue = 0

                                while (memory > 1024) {
                                    memory = memory / 1024
                                    memoryValue++
                                }

                                statselement.querySelector("div.sc-1ibsw91-18.htfimm>div.sc-1ibsw91-19.dwZqiD>p.sc-1ibsw91-1.cUvpcr").innerHTML = (Math.round(memory * 100) / 100).toFixed(2) + " " + storageAmounts[memoryValue]

                                var storage = JSON.parse(message.args[0]).disk_bytes + backupsSize
                                var storageValue = 0

                                while (storage > 1024) {
                                    storage = storage / 1024
                                    storageValue++
                                }

                                statselement.querySelector("div.sc-1ibsw91-21.clbnEU>div.sc-1ibsw91-22.hXevPX>p.sc-1ibsw91-1.cUvpcr").innerHTML = (Math.round(storage * 100) / 100).toFixed(2) + " " + storageAmounts[storageValue]

                                element.classList.remove("liBonM")
                                element.classList.remove("jqQFoq")
                                element.classList.remove("lpPPi")

                                if (JSON.parse(message.args[0]).state == "running") {
                                    element.classList.add("liBonM")
                                } else if (JSON.parse(message.args[0]).state == "offline") {
                                    element.classList.add("jqQFoq")

                                    statselement.querySelector("div.sc-1ibsw91-15.dRlStv>div.sc-1ibsw91-16.kaRbRM>p.sc-1ibsw91-1.cUvpcr").innerHTML = "---"
                                    statselement.querySelector("div.sc-1ibsw91-18.htfimm>div.sc-1ibsw91-19.dwZqiD>p.sc-1ibsw91-1.cUvpcr").innerHTML = "---"
                                } else if (JSON.parse(message.args[0]).state == "starting" || JSON.parse(message.args[0]).state == "stopping") {
                                    element.classList.add("lpPPi")
                                }
                            } else if (message.event != "console output" && message.event != "install output") {
                                console.log(message)
                            }
                        })

                        var prevLocation = document.location.href
            
                        var observer = new MutationObserver(() => {
                            if (prevLocation != document.location.href) {
                                prevLocation = document.location.href

                                socket.close()
                            }
                        })
            
                        observer.observe(document.body, { childList: true, subtree: true })
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

var storageAmounts = ${JSON.stringify(storageAmounts)}
fetch(window.location.origin + "/api/client/servers/" + window.location.pathname.split("/")[2]).then(res => res.json()).then(server => {
    var element = document.querySelector("body>div#app>div.sc-2l91w7-0.kDhnAT>div.sc-1p0gm8n-0.kaVYNu>section>div.x3r2dw-0.kbxq2g-0.evldyg.cZTZeB.sc-1j2y518-0.hmurjB>div.sc-1j2y518-1.piqbQ>div.gvsoy-0.gHwjbw.sc-168cvuh-0.RkKIC")

    if (options["server-show-all-ports"]) {
        var ports = ""

        server.attributes.relationships.allocations.data.forEach(allocation => {
            ports += allocation.attributes.port + ", "
        })

        var ogPortsElement = element.querySelector("div.gvsoy-4.ifNwiE>p.sc-168cvuh-4.kAvFVe.sc-7pjzdv-1.lcvCXd>code.sc-168cvuh-6.iXjYLE")
        ogPortsElement.innerHTML = ports.substring(0, ports.length - 2)

        var portsElement = document.createElement("span")
        portsElement.innerHTML = ogPortsElement.innerHTML
        portsElement.classList = ogPortsElement.classList

        ogPortsElement.parentNode.replaceChild(portsElement, ogPortsElement);
    }

    if (options["server-remove-ports"]) {
        element.querySelector("div.gvsoy-4.ifNwiE>p.sc-168cvuh-4.kAvFVe.sc-7pjzdv-1.lcvCXd").remove()
    }

    var backupsSize = 0

    if (options["files-include-backups"]) {
        fetch(window.location.origin + "/api/client/servers/" + server.attributes.uuid + "/backups").then(res => res.json()).then(data => {
            data.data.forEach(backup => {
                backupsSize += backup.attributes.bytes

                if (!options["server-live-stats"]) {
                    fetch(window.location.origin + "/api/client/servers/" + server.attributes.uuid + "/resources").then(res => res.json()).then(data => {
                        var storage = data.attributes.resources.disk_bytes + backupsSize
                        var storageValue = 0

                        while (storage > 1024) {
                            storage = storage / 1024
                            storageValue++
                        }

                        element.querySelector("div.gvsoy-4.ifNwiE>p.sc-168cvuh-13.cBEDGM").innerHTML = (Math.round(storage * 100) / 100).toFixed(2) + " " + storageAmounts[storageValue]
                    })
                }
            })
        })
    }
    
    fetch(window.location.origin + "/api/client/servers/" + server.attributes.uuid + "/websocket").then(res => res.json()).then(data => {
        var socket = new WebSocket(data.data.socket)

        socket.addEventListener("open", e => {
            socket.send(JSON.stringify({ event: "auth", args: [data.data.token] }))
        })

        socket.addEventListener("message", event => {
            var message = JSON.parse(event.data)

            if (message.event == "auth success") {
                socket.send(JSON.stringify({ event: "send stats", args: [null] }))
            } else if (message.event == "token expiring") {
                fetch(window.location.origin + "/api/client/servers/" + server.attributes.uuid + "/websocket").then(res => res.json()).then(data => {
                    socket.send(JSON.stringify({ event: "auth", args: [data.data.token] }))
                })
            } else if (message.event == "token expired") {
                socket.close()
            } else if (message.event == "status") {
                if (options["server-live-stats"]) {
                    var statuselement = element.querySelector("div.gvsoy-4.ifNwiE>p.sc-168cvuh-1.edGZnr>svg.svg-inline--fa.fa-circle.fa-w-16.fa-fw.sc-168cvuh-2")

                    statuselement.classList.remove("liBonM")
                    statuselement.classList.remove("jqQFoq")
                    statuselement.classList.remove("lpPPi")

                    if (message.args[0] == "running") {
                        statuselement.classList.add("liBonM")
                    } else if (message.args[0] == "offline") {
                        statuselement.classList.add("jqQFoq")
                    } else if (message.args[0] == "starting" || message.args[0] == "stopping") {
                        statuselement.classList.add("lpPPi")
                    }
                }
            } else if (message.event == "stats") {
                if (options["server-remove-graphs"]) {
                    if (document.querySelector("body>div#app>div.sc-2l91w7-0.kDhnAT>div.sc-1p0gm8n-0.kaVYNu>section>div.x3r2dw-0.kbxq2g-0.evldyg.cZTZeB.sc-1j2y518-0.hmurjB>div.sc-1j2y518-6.iyAtmz>div.sc-19da077-0.jWBQCE") != null) {
                        document.querySelector("body>div#app>div.sc-2l91w7-0.kDhnAT>div.sc-1p0gm8n-0.kaVYNu>section>div.x3r2dw-0.kbxq2g-0.evldyg.cZTZeB.sc-1j2y518-0.hmurjB>div.sc-1j2y518-6.iyAtmz>div.sc-19da077-0.jWBQCE").remove()
                    }
                }

                function setInnerText(element, text) {
                    var currentText = element.innerHTML

                    for (var i = 0; i < element.children.length; i++) {
                        currentText = currentText.replace(element.children.item(i).outerHTML, "").replace("&nbsp;", "").trim()
                    }

                    element.innerHTML = element.innerHTML.replace(currentText, text)
                }

                if (options["server-live-stats"]) {
                    setInnerText(element.querySelector("div.gvsoy-4.ifNwiE>p.sc-168cvuh-7.UkDRx"), (Math.round(JSON.parse(message.args[0]).cpu_absolute * 100) / 100).toFixed(2) + "%")

                    var memory = JSON.parse(message.args[0]).memory_bytes
                    var memoryValue = 0

                    while (memory > 1024) {
                        memory = memory / 1024
                        memoryValue++
                    }

                    setInnerText(element.querySelector("div.gvsoy-4.ifNwiE>p.sc-168cvuh-10.bVAiVP"), (Math.round(memory * 100) / 100).toFixed(2) + " " + storageAmounts[memoryValue])

                    var storage = JSON.parse(message.args[0]).disk_bytes + backupsSize
                    var storageValue = 0

                    while (storage > 1024) {
                        storage = storage / 1024
                        storageValue++
                    }

                    setInnerText(element.querySelector("div.gvsoy-4.ifNwiE>p.sc-168cvuh-13.cBEDGM"), (Math.round(storage * 100) / 100).toFixed(2) + " " + storageAmounts[storageValue])

                    var statuselement = element.querySelector("div.gvsoy-4.ifNwiE>p.sc-168cvuh-1.edGZnr>svg.svg-inline--fa.fa-circle.fa-w-16.fa-fw.sc-168cvuh-2")

                    statuselement.classList.remove("bRMaXS")
                    statuselement.classList.remove("gyrkZw")
                    statuselement.classList.remove("YamRQ")

                    if (JSON.parse(message.args[0]).state == "running") {
                        statuselement.classList.add("bRMaXS")
                    } else if (JSON.parse(message.args[0]).state == "offline") {
                        statuselement.classList.add("gyrkZw")

                        setInnerText(element.querySelector("div.gvsoy-4.ifNwiE>p.sc-168cvuh-7.UkDRx"), "---")
                        setInnerText(element.querySelector("div.gvsoy-4.ifNwiE>p.sc-168cvuh-10.bVAiVP"), "---")
                    } else if (JSON.parse(message.args[0]).state == "starting" || JSON.parse(message.args[0]).state == "stopping") {
                        statuselement.classList.add("YamRQ")
                    }
                } else {
                    element.innerHTML = element.innerHTML
                }
            } else if (message.event != "console output" && message.event != "install output") {
                console.log(message)
            }
        })

        var prevLocation = document.location.href

        var observer = new MutationObserver(() => {
        	if (prevLocation != document.location.href) {
            	prevLocation = document.location.href

                socket.close()
        	}
        })

        observer.observe(document.body, { childList: true, subtree: true })
    })
})`)
                scriptElement.append(scriptContents)
                document.body.appendChild(scriptElement)
            }
        }
    })
}