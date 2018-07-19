import * as $ from 'manhattan-essentials'


// -- Defaults --

export function defaultStatusTemplate(progress) {
    if (progress < 0) {
        return 'Waiting'
    } else if (progress >= 100) {
        return 'Processing'
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
        url,
        formData,
        orientation='horizontal',
        statusTemplate=defaultStatusTemplate,
        semaphore=null
    ) {

        // The URL to upload the file to
        this._url = url

        // The (Form)Data to upload (this should include the file appended to
        // the body.)
        this._formData = formData

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

        // The request object created when the upload begins
        this._xhr = null

        // Domain for related DOM elements
        this._dom = {
            'bar': null,
            'container': null,
            'status': null,
            'uploader': null
        }

        // Store a reference to the container element
        this._dom.container = container

        // Set up event handlers
        this._handlers = {

            'cancel': (event) => {
                // Abort the upload
                event.preventDefault()
                if (this._xhr) {
                    this._xhr.abort()
                }
            },

            'reqAbort': (event) => {
                // Clear the handle to the request
                this._xhr = null

                // Dispatch a cancelled event against the uploader
                $.dispatch(this.uploader, 'aborted')
            },

            'reqError': (event) => {
                // Clear the handle to the request
                this._xhr = null

                // Dispatch a error event against the uploader
                $.dispatch(this.uploader, 'error')
            },

            'reqProgress': (event) => {
                // Update the progress bar
                if (event.lengthComputable) {
                    this._progress(event.loaded / event.total)
                } else {
                    this._progress(0)
                }
            },

            'reqLoad': (event) => {
                const {response} = this._xhr

                // Clear the handle to the request
                this._xhr = null

                // Set the progress to 100%
                this._progress(100)

                // Free the semaphore
                if (this._semaphore) {
                   this._semaphore.free()
                }

                // Dispatch an uploaded event
                $.dispatch(this.uploader, 'uploaded', {response})
            }
        }
    }

    // -- Getters & Setters --

    get uploader() {
        return this._dom.uploader
    }

    // -- Public methods --

    /**
     * Remove the uploader.
     */
    destroy() {
        // Abort any outstanding request
        if (this._xhr) {
            $.ignore(
                this._xhr,
                {
                    'abort': this._handlers.reqAbort,
                    'error': this._handlers.reqError,
                    'progress': this._handlers.reqProgress,
                    'load': this._handlers.reqLoad
                }
            )
            this._xhr.abort()
        }

        // Remove the uploader element
        if (this.uploader !== null) {
            this.uploader.parentNode.removeChild(this.uploader)
        }

        // Clear DOM element references
        this._dom.bar = null
        this._dom.container = null
        this._dom.status = null
        this._dom.uploader = null
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
        const meterElm = $.create('div', {'class': cls.css['meter']})
        this.uploader.appendChild(meterElm)

        this._dom.bar = $.create('div', {'class': cls.css['bar']})
        meterElm.appendChild(this._dom.bar)

        // Create the status element
        this._dom.status = $.create('div', {'class': cls.css['status']})
        this.uploader.appendChild(this._dom.status)

        // Create the cancel button element
        const cancelElm = $.create('div', {'class': cls.css['cancel']})
        this.uploader.appendChild(cancelElm)

        // Add the uploader element to the container
        this._dom.container.appendChild(this.uploader)

        // Add event listeners
        $.listen(cancelElm, {'click': this._handlers.cancel})

        // Begin the file upload
        this._progress(-1)
        this.__uploadInterval = setInterval(
            () => {
                this._upload()
            },
            200
        )
    }

    // -- Private methods --

    /**
     * Update the progress bar and status to reflect the current upload
     * progress. A value of less than 0 indicates the upload is pending.
     */
    _progress(percent) {
        // Update the progress bar
        const boundPercent = Math.min(Math.max(percent, 0), 100)
        if (this._orientation === 'horizontal') {
            this._dom.bar.style.width = `${boundPercent}%`
        } else {
            this._dom.bar.style.height = `${boundPercent}%`
        }

        // Update the status
        this._dom.status.innerHTML = this._statusTemplate(percent)
    }

    /**
     * Start uploading the file, if a semaphore has been provided for the
     * uploader then the upload request will ignored if there the maximum
     * number of uploads has already been reached.
     */
    _upload() {
        const cls = this.constructor

        // If there's a semaphore attempt to acquire a resource (e.g check we
        // haven't reached the maximum number of uploads).
        if (this._semaphore && !this._semaphore.acquire()) {
            return
        }

        // Prevent any future upload requests
        clearInterval(this.__uploadInterval)

        // Remove the pending CSS class from the uploader and add the
        // uploading class.
        this.uploader.classList.remove(cls.css['pending'])
        this.uploader.classList.add(cls.css['uploading'])

        // Send the file
        //
        // REVIEW: Since `fetch` currently doesn't provide a mechanism for
        // querying the progress of an upload we are forced to use
        // `XMLHttpRequest`. Once progress can be queries for `fetch` this
        // code should be updated to use the more modern approach.
        //
        // ~ Anthony Blackshaw <ant@getme.co.uk>, 23rd April 2018
        this._xhr = new XMLHttpRequest()

        // Add event listeners to the request
        $.listen(
            this._xhr,
            {
                'abort': this._handlers.reqAbort,
                'error': this._handlers.reqError,
                'progress': this._handlers.reqProgress,
                'load': this._handlers.reqLoad
            }
        )

        // Send the request
        this._xhr.open('POST', this._url, true)
        this._xhr.send(this._formData)
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
     * Applied to the progress meter within the uploader.
     */
    'meter': 'mh-uploader__progress-meter',

    /**
     * Applied to the uploader before it begins uploading the file.
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
     * Applied to the uploader when in uploading.
     */
    'uploading': 'mh-uploader--uploading'
}
