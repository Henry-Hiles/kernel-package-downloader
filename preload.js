const { contextBridge } = require("electron")
const { resolve, join } = require("path")
const { promises, constants } = require("fs")
const { access } = promises

const exec = require("util").promisify(require("child_process").exec)

contextBridge.exposeInMainWorld("installPackage", async (link) => {
    if (process.platform === "darwin") {
        process.env.PATH += `:/usr/local/bin:${process.env.HOME}/Library/pnpm`
    }

    const packagesPath = resolve(__dirname, "..")
    const packagePath = join(packagesPath, link[7])
    try {
        await exec(`git clone ${link[0]}`, {
            cwd: packagesPath,
        })

        try {
            await access(join(packagePath, "package.json"), constants.F_OK)
            try {
                await exec(`pnpm i --production`, {
                    cwd: packagePath,
                })
            } catch (error) {
                console.error(error)
            }
        } catch {}

        try {
            await access(join(packagePath, "main.js"), constants.F_OK)
            return {
                reloadMessage:
                    "Main.js file detected: Please quit Discord from the system tray",
            }
        } catch (error) {
            return {
                reloadMessage: "Please reload discord with Ctrl+R",
            }
        }
    } catch (error) {
        return { error }
    }
})
