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
            'clear': null,
            'container': null,
            'error': null,
            'message': null
        }

        // Store a reference to the container element
        this._dom.container = container

        // Set up event handlers
        this._handlers = {

            'clear': (event) => {
                event.preventDefault()
                if (event.buttons === 0) {
                    $.dispatch(this.error, 'clear')
                }
            }
        }
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
        this._dom.clear = null
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

        // Create the clear element
        this._dom.clear = $.create('div', {'class': cls.css['clear']})
        this._dom.error.appendChild(this._dom.clear)

        // Create the message element
        this._dom.message = $.create('div', {'class': cls.css['message']})
        this._dom.message.textContent = message
        this._dom.error.appendChild(this._dom.message)

        this._dom.container.appendChild(this.error)

        // Add event handlers
        $.listen(this._dom.clear, {'click': this._handlers.clear})
    }
}


// -- CSS classes --

ErrorMessage.css = {

    /**
     * Applied to the clear element within the error message.
     */
    'clear': 'mh-file-error__clear',

    /**
     * Applied to the error.
     */
    'error': 'mh-file-error',

    /**
     * Applied to the message element within the error.
     */
    'message': 'mh-file-error__message'
}
