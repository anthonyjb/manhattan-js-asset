import * as $ from 'manhattan-essentials'


// -- Class definition --

/**
 * File uploader UI component for form fields. 
 */

export class Uploader {

    constructor(container, file, semaphore=null) {

        // The file to be uploaded
        this._file = file

        // A semaphore used to limit the number of concurrent uploads, this
        // restriction is optional.
        this._semaphore = semaphore

        // The state of the uploader ('pending', 'uploading', 'uploaded')
        this._state = 'pending'

        // Domain for related DOM elements
        this._dom = {
            'container': null,
            'uploader': null
        }

        // Store a reference to the container element
        this._dom.container = container

        // Set up event handlers
        this._handlers = {
            // cancel
        }
    }

    // -- Getters & Setters --

    get state() {
        return this._state
    }

    get uploader() {
        return this._dom.uploader
    }

    // -- Public methods --

    /**
     * Remove the uploader.
     */
    destroy() {
    
    }

    /**
     * Initialize the uploader.
     */
    init() {
        const cls = this.constructor

        // Create the uploader element
        this._dom.uploader = $.create('div', {'class': cls.css['uploader']})
        
        // @@ START HERE - Add the progress elements

        // Add the uploader element to the container
        this._dom.container.appendChild(this.uploader)
    
        // @@ Upload the file
        // - Setup an XHR object (add notes around fetch not supporting 
        //   progress yet (custom _fetch function to provide promise 
        //   support?).
        // - Update the progress bar and label
    }

}


// -- CSS classes --

Uploader.css = {

    /**
     * Applied to the uploader element.
     */
    'uploader': 'mh-uploader'

}
