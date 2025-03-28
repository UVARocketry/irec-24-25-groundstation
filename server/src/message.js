// this file is for parsing a raw binary message into something with a little bit more structure (aka Message)
import { Strings } from "./ansi.js";
import { log } from "./log.js";
/**
 * @readonly
 * @enum {number}
 */
export const MessageType = {
    /// list of comma seperated strings of field names
    Schema: 0,
    /// to be used for metadata if needed
    Metadata: 1,
    /// a struct with the update bits
    DataUpdate: 2,
    /// for sending an event (eg statemachine state change)
    Event: 3,
    /// for sending eventSchema
    EventSchema: 4,
    /// For saying that yes, we have received everything
    Acknowledgement: 5,
    /// For receiving messages
    Message: 6,
    Undefined: -1,
};
export class Message {
    /**
     * @type {number}
     */
    version = 0;
    /**
     * @type {boolean}
     */
    valid = false;
    /**
     * @type {MessageType}
     */
    type = MessageType.Undefined;
    /**
     * @type {Uint8Array}
     */
    data = new Uint8Array();

    /**
     * @param {Uint8Array<ArrayBuffer>} msg
     */
    constructor(msg) {
        const aCode = "a".charCodeAt(0);

        var newBuf = [];
        // convert msg from half-packed binary to full-packed binary
        // (AKA 4 bits of info per byte to 8 bits)

        for (var i = 0; i < msg.length; i += 2) {
            var left = msg[i];
            var right = msg[i + 1];
            left -= aCode;
            left = left & 0x0f;
            left <<= 4;
            right -= aCode;
            right = right & 0x0f;
            newBuf.push(left + right);
        }
        msg = new Uint8Array(newBuf);
        if (msg.length * 8 < 40) {
            log(`${Strings.Error}: Message is too small!`);
            return;
        }
        // get version and type
        this.version = (msg[0] & 0xf0) >> 4;
        this.type = msg[0] & 0x0f;

        // get len
        var len = (msg[1] << 8) + msg[2];
        if (msg.length - 5 > len) {
            msg = msg.slice(0, len + 5);
        }
        // -5 because of 5 byte header
        if (msg.length - 5 !== len) {
            log(
                `${Strings.Error}: MESSAGE SIZE DOES NOT MATCH: ${len}, ${msg.length - 5}`,
            );
            // return;
        }

        // do `0 & 0` to cast it to 32 (or 64) bit integers
        // this is just some js weirdness
        var actualChecksum = [0 & 0, 0 & 0];

        var parity = 0;
        var data = [];
        for (var i = 5; i < msg.length; i++) {
            // &xff to cast it to int (and select bottom 8 bits)
            actualChecksum[parity] ^= msg[i] & 0xff;
            parity++;
            parity %= 2;
            data.push(msg[i]);
        }
        var checksum = [msg[3], msg[4]];
        if (
            actualChecksum[0] !== checksum[0] ||
            actualChecksum[1] !== checksum[1]
        ) {
            log(
                `${Strings.Error}: CHECKSUM VALIDATION FAILED: ${checksum}, ${actualChecksum}`,
            );
            // return;
        }
        this.valid = true;
        this.data = new Uint8Array(data);
    }
}
