import * as $ from 'manhattan-essentials'

import {Acceptor} from './ui/acceptor'
import {GalleryItem} from './ui/gallery-item'


// -- Class definitions --

/**
 * A basic semaphore used to limit the number of files uploaded
 * simultaneously.
 */
class UploadSemaphore {

    constructor(maxUploads) {

        // The maximum number of uploads allowed
        this._maxUploads = maxUploads

        // The current number of uploads permissions aquired
        this._uploads = 0
    }

    // -- Public methods --

    /**
     * Aquire permission to upload a file.
     */
    aquire() {
        if (this._uploads >= this._maxUploads) {
            return false
        }

        this._uploads += 1

        return true
    }

    /**
     * Free up a permission to upload a file.
     */
    free() {
        this._uploads = Math.max(0, this._uploads - 1)
    }
}


/**
 * An gallery UI component.
 */
export class Gallery {

    constructor(input, options={}, prefix='data-mh-gallery--') {

        // Configure the options
        this._options = {}

        $.config(
            this._options,
            {

                /**
                 * A comma separated list of file types that are accepted.
                 */
                'accept': '',

                /**
                 * If true then the gallery will support users dropping files
                 * on to the acceptor to upload them.
                 */
                'allowDrop': false,

                /**
                 * The label displayed when the user is dragging a file over
                 * the page.
                 */
                'dropLabel': 'Drop file here',

                // fileType

                /**
                 * The label displayed in the acceptor.
                 */
                'label': 'Select a file...',

                /**
                 * The maximum number of assets that can be added to the
                 * gallery.
                 */
                'maxAssets': 0,

                /**
                 * The maximum number of simultaneous uploads the gallery
                 * will allow.
                 */
                'maxUploads': 4
            },
            options,
            input,
            prefix
        )

        // Configure the behaviours
        this._behaviours = {}

        $.config(
            this._behaviours,
            {
                'acceptor': 'default'
            },
            options,
            input,
            prefix
        )

        // The list of items (assets) within the gallery
        this._items = []

        // Domain for related DOM elements
        this._dom = {
            'acceptor': null,
            'input': null,
            'items': null,
            'gallery': null
        }

        // Store a reference to the input element
        this._dom.input = input
    }

    // -- Getters & Setters --

    get gallery() {
        return this._dom.gallery
    }

    get input() {
        return this._dom.input
    }

    // -- Public methods --

    /**
     * @@ Remove the gallery.
     */
    destroy() {
       return this.todo
    }

    /**
     * Initialize the gallery.
     */
    init() {
        const cls = this.constructor

         // Create the gallery element
        this._dom.gallery = $.create(
            'div',
            {'class': cls.css['gallery']}
        )

        // Create the acceptor container element
        this._dom.acceptor = $.create(
            'div',
            {'class': cls.css['acceptor']}
        )
        this._dom.gallery.appendChild(this._dom.acceptor)

        // Create the items container element
        this._dom.items = $.create(
            'div',
            {'class': cls.css['items']}
        )
        this._dom.gallery.appendChild(this._dom.items)

        // Add the gallery to the page
        this.input.parentNode.insertBefore(
            this._dom.gallery,
            this.input.nextSibling
        )

        // Set up the acceptor
        const behaviour = this._behaviours.acceptor
        this._acceptor = cls.behaviours.acceptor[behaviour](this)
        this._acceptor.init()

        // Set up event handlers for the acceptor
        $.listen(
            this._acceptor.acceptor,
            {
                'accepted': (event) => {
                    const item = new GalleryItem(this._dom.items)
                    item.init()
                    this._items.push(item)
                }
            }
        )
    }
}


// -- Behaviours --

Gallery.behaviours = {

    /**
     * The `acceptor` behaviour is used to create a file acceptor UI component
     * for the gallery.
     */
    'acceptor': {

        /**
         * Return an acceptor configured using the gallery options.
         */
        'default': (inst) => {
            return new Acceptor(
                inst._dom.acceptor,
                `${inst.input.name}__acceptor`,
                inst._options.label,
                inst._options.dropLabel,
                inst._options.allowDrop,
                inst._options.accept,
                true
            )
        }
    }

}


// -- CSS classes --

Gallery.css = {

    /**
     * Applied to the acceptor container element.
     */
    'acceptor': 'mh-gallery__acceptor',

    /**
     * Applied to the gallery element.
     */
    'gallery': 'mh-gallery',

    /**
     * Applied to the gallery items container.
     */
    'items': 'mh-gallery__items'
}
