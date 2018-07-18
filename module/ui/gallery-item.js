import * as $ from 'manhattan-essentials'


// -- Class definition --

/**
 * An item UI component (asset) within a gallery.
 */

export class GalleryItem {

    constructor(container) {

        // The asset the item represents
        this._asset = null

        // The state of the item (initializing, uploading, viewing, errored).
        this._state = 'initializing'

        // Handles to the state components
        this._error = null
        this._uploader = null
        this._viewer = null

        // Handles to the st
        // Domain for related DOM elements
        this._dom = {
            'container': null,
            'item': null
        }

        // Store a reference to the container element
        this._dom.container = container

    }

    // galleryOptions

    // -- Getters & Setters --

    get asset() {
        return Object.assign(this._asset, {})
    }

    get item() {
        return this._dom.item
    }

    get state() {
        return this._state
    }

    // -- Public methods --

    /**
     * @@ Remove the gallery item.
     */
    destroy() {
        return this.todo
    }

    /**
     * Initialize the gallery item.
     */
    init() {
        const cls = this.constructor

         // Create the gallery element
        this._dom.item = $.create(
            'div',
            {'class': cls.css['item']}
        )

        // Add the item to the page
        this._dom.container.appendChild(this._dom.item)
    }

    populate() {

    }

    postError() {

    }

    upload() {

    }
}


// -- CSS classes --

GalleryItem.css = {

    /**
     * Applied to the gallery item element.
     */
    'item': 'mh-gallery-item'
}
