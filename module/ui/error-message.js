import * as $ from 'manhattan-essentials'


// -- Class definition --

/**
 * Error message UI component for form fields.
 *
 * Error messages are used to provide feedback to users about a failed file
 * upload.
 */

export class ErrorMessage {

    constructor(container) {

        // Domain for related DOM elements
        this._dom = {
            'container': null,
            'error': null,
            'message': null
        }

        // Store a reference to the container element
        this._dom.container = container
    }

    // -- Getters & Setters --

    get error() {
        return this._dom.error
    }

    // -- Public methods --

    /**
     * Remove the acceptor.
     */
    destroy() {
        // Remove the acceptor element
        if (this.error !== null) {
            this.error.parentNode.removeChild(this.error)
        }

        // Clear DOM element references
        this._dom.error = null
        this._dom.message = null
    }

    /**
     * Initialize the acceptor.
     */
    init(message) {
        const cls = this.constructor

        // Create the error element
        this._dom.error = $.create('div', {'class': cls.css['error']})

        // Create the message element
        this._dom.message = $.create('div', {'class': cls.css['message']})
        this._dom.message.textContent = message
        this._dom.error.appendChild(this._dom.message)
        this.error.appendChild(this._dom.message)

        this._dom.container.appendChild(this.error)
    }
}


// -- CSS classes --

ErrorMessage.css = {

    /**
     * Applied to the error message.
     */
    'error': 'mh-file-error',

    /**
     * Applied to the drop zone element within the acceptor.
     */
    'message': 'mh-file-error__message'
}
