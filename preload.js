const { contextBridge } = require("electron")
const { resolve, join } = require("path")
const { exec } = require("child_process")

const execWithPromise = async (command, options) =>
    new Promise(async (resolve, reject) =>
        exec(command, options, (err, stout, sterr) =>
            err ? reject(err, sterr) : resolve(stout)
        )
    )

contextBridge.exposeInMainWorld("package", {
    install: async (link) => {
        const packagesPath = resolve(__dirname, "..")
        try {
            await execWithPromise(`git clone ${link[0]}`, {
                cwd: packagesPath,
            })

            await execWithPromise("pnpm i --production", {
                cwd: join(packagesPath, link[7]),
            })
        } catch (error) {
            console.error(error)
            return true
        }
    },
})
