import fs from "node:fs";
import { InputReader } from "./inputReader.js";
import { broadcastEvent } from "./index.js";
import { clearConnected, setEvent } from "./state.js";
/** @import { RenameResponse } from "common/ServerMessage.js"; */

export class FileLogReader extends InputReader {
    i = 0;
    readFirst = false;
    path = "../out";
    cancel = false;
    /**
     * @param {(_: Uint8Array) => Promise<void>} fn
     * @param {string?} path
     */
    constructor(fn, path) {
        super(fn);
        this.path = path ?? this.path;
    }
    stop() {
        this.cancel = true;
        clearConnected();
    }
    start() {
        if (!this.readFirst) {
            clearConnected();
            this.readFirst = true;
            this.wake();
            setTimeout(() => this.readMessage(), 1000);
        }
    }

    /** @param {string} name */
    rename(name) {
        this.path = "../" + name;
    }

    getRenameOptions() {
        var items = [];

        const files = fs.readdirSync("..");
        files.forEach((f) => {
            if (fs.existsSync(`../${f}/msg-0`)) {
                items.push(f);
            }
        });

        /** @type {RenameResponse} */
        const ret = {
            type: "choice",
            data: items,
        };
        return ret;
    }

    getName() {
        return this.path;
    }
    async readMessage() {
        if (this.cancel) {
            this.cancel = false;
            this.done();
            return;
        }
        this.active();
        let path = this.path + "/msg-" + this.i;
        if (!fs.existsSync(path)) {
            setEvent("done");
            broadcastEvent();
            this.done();
            return;
        }
        const file = await fs.openAsBlob(path);

        const buf = new Uint8Array(await file.arrayBuffer());

        this.i++;
        this.onUpdate(buf);
        setTimeout(() => this.readMessage(), 10);
    }
    async reset() {
        this.i = 0;
        this.wake();
        this.readMessage();
    }
}
