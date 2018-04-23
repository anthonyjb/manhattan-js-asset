import * as $ from 'manhattan-essentials'


// -- Defaults --

function defaultStatusTemplate(progress) {
    if (progress === -1) {
        return 'Waiting'
    }
    return `Uploading ${progress}%`
}


// -- Class definition --

/**
 * File uploader UI component for form fields. 
 */

export class Uploader {

    constructor(
        container, 
        file, 
        orientation='horizontal',
        statusTemplate=defaultStatusTemplate,
        semaphore=null
    ) {

        // The file to be uploaded
        this._file = file

        // The orientation of the progress meter, if 'horizontal' the progress
        // bar's width is updated to match the progress, if 'vertical' then 
        // it's height is.
        this._orientation = orientation

        // A template function that returns the HTML contents of the status
        // element based on the current upload progress.
        this._statusTemplate = statusTemplate  

        // A semaphore used to limit the number of concurrent uploads, this
        // restriction is optional.
        this._semaphore = semaphore

        // The state of the uploader ('pending', 'uploading', 'finished')
        this._state = 'pending'

        // Domain for related DOM elements
        this._dom = {
            'bar': null,
            'container': null,
            'meter': null,
            'status': null,
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
        this._dom.uploader = $.create(
            'div', 
            {'class': `${cls.css['uploader']} ${cls.css['pending']}`}
        )
        
        // Create the progress meter and bar elements
        this._dom.meter = $.create('div', {'class': cls.css['meter']})
        this.uploader.appendChild(this._dom.meter)

        this._dom.bar = $.create('div', {'class': cls.css['bar']})
        this._dom.meter.appendChild(this._dom.bar)

        // Create the status element
        this._dom.status = $.create('div', {'class': cls.css['status']})
        this._dom.status.innerHTML = this._statusTemplate(-1)
        this.uploader.appendChild(this._dom.status)

        // Create the cancel button element
        this._dom.cancel = $.create('div', {'class': cls.css['cancel']})
        this.uploader.appendChild(this._dom.cancel)

        // Add the uploader element to the container
        this._dom.container.appendChild(this.uploader)
    
        // @@ Upload the file
        // - Setup an XHR object (add notes around fetch not supporting 
        //   progress yet (custom _fetch function to provide promise 
        //   support?).
    }

}


// -- CSS classes --

Uploader.css = {

    /**
     * Applied to the progress bar within the progress meter.
     */
    'bar': 'mh-uploader__progress-bar',

    /**
     * Applied to the cancel button within the uploader.
     */
    'cancel': 'mh-uploader__cancel',

    /**
     * Applied to the uploader when in the finished state.
     */
    'finished': 'mh-uploader--finished',

    /**
     * Applied to the progress meter within the uploader.
     */
    'meter': 'mh-uploader__progress-meter',

    /**
     * Applied to the uploader when in the pending state.
     */
    'pending': 'mh-uploader--pending',

    /**
     * Applied to the status within the uploader.
     */
    'status': 'mh-uploader__status',

    /**
     * Applied to the uploader.
     */
    'uploader': 'mh-uploader',

    /**
     * Applied to the uploader when in the uploading state.
     */
    'uploading': 'mh-uploader--uploading'
}
