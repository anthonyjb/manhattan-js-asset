
/**
 * A basic resource semaphore, this class is used to limit the number of files
 * that can be uploaded simultaneously in the gallery.
 */
export class Semaphore {

    constructor(slots) {

        // The number of slots that can be acquired via the semaphore
        this._slots = slots

        // The current number of aquired slots
        this._acquiredSlots = 0
    }

    // -- Public methods --

    /**
     * Aquire a slot.
     */
    acquire() {
        if (this._acquiredSlots >= this._slots) {
            return false
        }
        this._acquiredSlots += 1
        return true
    }

    /**
     * Free up a slot.
     */
    free() {
        this._acquiredSlots = Math.max(0, this._acquiredSlots - 1)
    }

    /**
     * Reset the semaphore.
     */
    reset() {
        this._acquiredSlots = 0
    }
}
