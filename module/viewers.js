import * as $ from 'manhattan-essentials'


// -- Class definition --

/**
 * File viewer UI component for form fields. 
 */
export class FileViewer {

    constructor(container, filename) {

    }

    // -- Getters & Setters --

    get uploader() {
        return this._dom.viewer
    }

    // -- Public methods --

    /**
     * Remove the file viewer.
     */
    destroy() {

    }

    /**
     * Initialize the file viewer.
     */
    init() {

    }
}


/**
 * Image viewer UI component for form fields. 
 */
export class ImageViewer {

    constructor(container, imageURL) {

    }

    // -- Getters & Setters --

    get uploader() {
        return this._dom.viewer
    }

    // -- Public methods --

    /**
     * Remove the image viewer.
     */
    destroy() {

    }

    /**
     * Initialize the image viewer.
     */
    init() {

    }
}


// @@ 
// - Viewers have to provide remove and edit buttons
