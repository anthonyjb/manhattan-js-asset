import * as $ from 'manhattan-essentials'


// -- Class definition --

/**
 * File acceptor UI component form fields. 
 *
 * Acceptors allow users to select a file from the file system or (optionally)
 * to drag a file on to the acceptor. Once a file is accepted the acceptor 
 * will typically spawn an `uploader.Uploader` instance to manage the upload
 * process.
 */

 export class Acceptor {

    constructor(container, template, allowDrop) {

        // The container element the accepter will be added to
        this._container = container

        // The HTML template to use when rendering the acceptor
        this._template = template

        // Flag indicating if the acceptor should allow users to drop files on
        // to the acceptor.
        this._allowDrop = allowDrop

        // Domain for related DOM elements
        this._dom = {
            'acceptor': null
        }

        // Set up event handlers
        this._handlers = {}
    }

    // -- Public methods --

    /**
     * Remove the acceptor.
     */
    destroy() {

    }

    /**
     * Initialize the acceptor.
     */
    init() {

        // Render the template
        const wrapper = $.create('div')
        wrapper.innerHTML = this._template
        this._container.parentNode.append(wrapper.children[0])
    }

 }

