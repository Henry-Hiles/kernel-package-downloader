/// <reference path="../webpack/types.d.ts" />

export default new (class PackageDownloader {
    async start() {
        const pluginLog = (msg, logFunc = console.info) =>
            logFunc(`%c[${this.constructor.name}] `, "color:#14bbaa", msg)

        pluginLog("Started successfully")

        await Webpack.whenReady
        const { React } = Webpack.common
        const MiniPopover = Webpack.findByDisplayName("MiniPopover", {
            default: true,
        })
        const Toasts = Object.assign(
            {},
            ...Webpack.getByProps("showToast", "createToast", {
                bulk: true,
            })
        )
        const Tooltip = Webpack.findByDisplayName("Tooltip")
        const funcCopy = MiniPopover.default

        MiniPopover.default = (...args) => {
            const props = args[0].children.at
                ? args[0].children.at(-1).props
                : null

            if (
                props?.message &&
                props.channel &&
                props.channel.id == "899717501120806963"
            )
                args[0].children.unshift(
                    React.createElement(() => {
                        const [disabled, setDisabled] = React.useState(false)

                        const gitURL = props.message.content
                            .slice(props.message.content.indexOf("Repository"))
                            .match(
                                /((git@|http(s)?:\/\/)([\w\.@]+)(\/|:))([\w,\-,\_]+)\/([\w,\-,\_]+)(.git){0,1}((\/){0,1})/
                            )

                        if (!disabled)
                            Object.values(
                                kernel.packages.getPackages()
                            ).forEach((pkg) => {
                                if (pkg.path.split("/").at(-1) == gitURL[7])
                                    setDisabled(true)
                            })

                        return [
                            React.createElement(
                                Tooltip,
                                {
                                    position: "top",
                                    text: disabled
                                        ? "Already Installed"
                                        : "Install Package",
                                },
                                (args) =>
                                    React.createElement(
                                        MiniPopover.Button,
                                        {
                                            ...args,
                                            disabled: disabled,
                                            onClick: async () => {
                                                setDisabled(true)
                                                const failed =
                                                    await window.installPackage(
                                                        gitURL
                                                    )

                                                if (failed) {
                                                    Toasts.showToast(
                                                        Toasts.createToast(
                                                            "Failed to install package",
                                                            Toasts.ToastType
                                                                .ERROR
                                                        )
                                                    )
                                                    pluginLog(
                                                        "Package installation failed, error above.",
                                                        console.error
                                                    )
                                                    setDisabled(false)
                                                } else {
                                                    Toasts.showToast(
                                                        Toasts.createToast(
                                                            "Successfully installed package! Please reload discord with Ctrl+R.",
                                                            Toasts.ToastType
                                                                .SUCCESS
                                                        )
                                                    )
                                                    pluginLog(
                                                        "Successfully installed package! Please reload discord with Ctrl+R."
                                                    )
                                                }
                                            },
                                        },
                                        React.createElement(
                                            "svg",
                                            {
                                                xmlns: "http://www.w3.org/2000/svg",
                                                width: "16",
                                                height: "16",
                                                fill: "currentColor",
                                                class: "bi bi-arrow-down-circle-fill",
                                                viewBox: "0 0 16 16",
                                            },
                                            React.createElement("path", {
                                                d: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z",
                                            })
                                        )
                                    )
                            ),
                            React.createElement(MiniPopover.Separator),
                        ]
                    })
                )

            return funcCopy.apply(this, args)
        }

        Object.assign(MiniPopover.default, funcCopy)

        pluginLog("Patched, ready to download packages!")

        this.stop = () => {
            MiniPopover.default = funcCopy
            pluginLog("Stopped successfully")
        }
    }
})()
