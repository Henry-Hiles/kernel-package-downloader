const { contextBridge } = require("electron")
const { resolve, join } = require("path")
const { exec } = require("child_process")
const { promises, constants } = require("fs")

const execWithPromise = async (command, options) =>
    new Promise(async (resolve, reject) =>
        exec(command, options, (err, stout, sterr) =>
            err ? reject(err, sterr) : resolve(stout)
        )
    )

contextBridge.exposeInMainWorld("installPackage", async (link) => {
    const packagesPath = resolve(__dirname, "..")
    const packagePath = join(packagesPath, link[7])
    try {
        await execWithPromise(`git clone ${link[0]}`, {
            cwd: packagesPath,
        })

        await execWithPromise("pnpm i --production", {
            cwd: packagePath,
        })

        try {
            await promises.access(join(packagePath, "main.js"), constants.F_OK)
            return "Main.js file detected: Please quit Discord from the system tray"
        } catch (error) {
            return "Please reload discord with Ctrl+R"
        }
    } catch (error) {
        return console.error(error)
    }
})
