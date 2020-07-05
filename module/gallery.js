import * as $ from 'manhattan-essentials'
import {Sortable} from 'manhattan-sortable'

import {Acceptor} from './ui/acceptor'
import {GalleryItem} from './ui/gallery-item'
import * as defaultFactories from './utils/behaviours/defaults'
import * as manhattanFactories from './utils/behaviours/manhattan'
import {Semaphore} from './utils/semaphores'
import {cloneGalleryItem} from './utils/sorting'


// -- Class definition --

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
                 * The initial aspect ratio to apply to the crop region for
                 * an image.
                 */
                'cropAspectRatio': '1.0',

                /**
                 * The label displayed when the user is dragging a file over
                 * the page.
                 */
                'dropLabel': 'Drop file here',

                /**
                 * The image variation to display as the preview in the
                 * image editor (if applicable).
                 */
                'editing': 'editing',

                /**
                 * The type of file that the gallery will accept, can be
                 * either 'file' or 'image'. The type does not validate or
                 * enforce the types of files that can be accepted, instead it
                 * provides a hint to the class about how to configure itself
                 * best for the expected type of file.
                 */
                'fileType': 'file',

                /**
                 * Flag indicating if the aspect ratio of the crop region for
                 * the image should be fixed.
                 */
                'fixCropAspectRatio': false,

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
                'maxUploads': 4,

                /**
                 * The image variation to display as the preview in the
                 * viewer (if applicable).
                 */
                'maxPreviewSize': [304, 304],

                /**
                 * The image variation to display as the preview in the
                 * viewer (if applicable).
                 */
                'preview': 'preview',

                /**
                 * The sortable helper to use in galleries where gallery items
                 * can be sorted.
                 */
                'sortableHelper': 'cloneGalleryItem',

                /**
                 * The URL that any file will be uploaded to.
                 */
                'uploadUrl': '/upload'
            },
            options,
            input,
            prefix
        )

        // Convert the crop ratio to a float
        this._options.cropAspectRatio
            = parseFloat(this._options.cropAspectRatio)

        // Convert `maxPreviewSize` option given as an attribute to a list
        if (typeof this._options.maxPreviewSize === 'string') {
            const maxPreviewSize = this._options.maxPreviewSize.split(',')
            this._options.maxPreviewSize = [
                maxPreviewSize[0],
                maxPreviewSize[1]
            ]
        }

        // Configure the behaviours
        this._behaviours = {}

        $.config(
            this._behaviours,
            {
                'acceptor': 'default',
                'asset': 'manhattan',
                'assetProp': 'manhattan',
                'formData': 'default',
                'imageEditor': 'default',
                'metadata': 'manhattan',
                'uploader': 'default',
                'viewer': 'default'
            },
            options,
            input,
            prefix
        )

        // The list of items (assets) within the gallery
        this._items = []

        // A semaphore used to control the number of simultaneous uploads
        this._semaphore = new Semaphore(this._options.maxUploads)

        // Handle to the Sortable instance to support sorting gallery items
        this._sortable = null

        // Domain for related DOM elements
        this._dom = {
            'acceptor': null,
            'input': null,
            'items': null,
            'gallery': null
        }

        // Store a reference to the input element
        this._dom.input = input

        // Set up event handlers
        this._handlers = {

            'removeItem': (event) => {

                // Remove the item from the gallery
                const index = this._items.indexOf(event.item)
                if (index > -1) {
                    this._items.splice(index, 1)
                }

                // Check if the acceptor should be enabled
                if (this._options.maxAssets > 0) {
                    if (this._items.length < this._options.maxAssets) {
                        this._acceptor.disabled = false
                    }
                }

                this._syncInput()
            },

            'sortItems': (event) => {
                // Change the order of the gallery items to match that of the
                // DOM.
                const items = []
                const itemElms = $.many(
                    `.${GalleryItem.css['item']}`,
                    this._dom.items
                )

                for (let itemElm of itemElms) {
                    items.push(itemElm._mhGalleryItem)
                }

                this._items = items

                this._syncInput()
            },

            'updateItem': (event) => {
                this._syncInput()
            }
        }
    }

    // -- Getters & Setters --

    get acceptor() {
        return this._dom.acceptor
    }

    get gallery() {
        return this._dom.gallery
    }

    get input() {
        return this._dom.input
    }

    // -- Public methods --

    /**
     * Remove the gallery.
     */
    destroy() {
        // Reset the semaphore
        this._semaphore.reset()

        if (this._sortable !== null) {
            // Remove any sortable behaviour
            this._sortable.destroy()
            this._sortable = null
        }

        if (this.gallery) {

            // Remove any gallery items
            for (let item of this._items) {
                item.destroy()
            }

            // Remove the element
            this.gallery.parentNode.removeChild(this.tokenizer)

            // Nullify dom elements
            this._dom.acceptor = null
            this._dom.items = null
            this._dom.gallery = null
        }

        // Remove the gallery reference from the input
        this.input._mhGallery = null
    }

    /**
     * Initialize the gallery.
     */
    init() {
        const cls = this.constructor

        // Store a reference to the gallery instance against the input
        this.input._mhGallery = this

        // Create the gallery element
        this._dom.gallery = $.create(
            'div',
            {
                'class': [
                    cls.css['gallery'],
                    cls.css.types[this._options.fileType]
                ].join(' ')
            }
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

        // Set up sort behaviour for items
        this._sortable = new Sortable(
            this._dom.items,
            {
                'axis': 'horizontal',
                'childSelector': '.mh-gallery-item--populated',
                'grabSelector':
                    '.mh-file-viewer__handle, .mh-image-viewer__handle',
                'grabber': 'selector',
                'helper': this._options.sortableHelper
            }
        )
        this._sortable.init()

        // Set up event handlers

        $.listen(
            this._acceptor.acceptor,
            {
                'accepted': (event) => {
                    for (let file of event.files) {

                        // Create a new gallery item
                        let item = this._addItem()

                        // Upload the file via the item
                        if (item) {
                            item.upload(file)
                        } else {
                            break
                        }
                    }
                }
            }
        )

        $.listen(
            this._dom.items,
            {'sorted': this._handlers.sortItems}
        )

        // Pre-populate the gallery using any existing input value
        if (this.input.value) {
            const assets = JSON.parse(this.input.value)
            for (let asset of assets) {
                let item = this._addItem()

                if (item) {
                    item.populate(asset)
                } else {
                    break
                }
            }
        }

        this._syncInput()
    }

    // -- Private methods --

    /**
     * Add a item to the gallery.
     */
    _addItem() {

        // Check there's capacity to add another gallery item
        if (this._options.maxAssets > 0) {
            if (this._items.length >= this._options.maxAssets) {
                return null
            }
        }

        // Create the item
        let item = new GalleryItem(this._dom.items, this)
        this._items.push(item)
        item.init()

        // Add event handlers for the item
        $.listen(item.item, {'removed': this._handlers.removeItem})
        $.listen(item.item, {'populated updated': this._handlers.updateItem})

        // Check if the acceptor should be disabled to prevent further uploads
        if (this._options.maxAssets > 0) {
            if (this._items.length >= this._options.maxAssets) {
                this._acceptor.disabled = true
            }
        }

        return item
    }

    /**
     * Synchronize the associated input field with the items in the gallery.
     */
    _syncInput() {

        const assets = []
        for (let item of this._items.slice()) {

            // Check if the item has an asset and if so add it to the assets
            // list.
            if (item.asset) {
                assets.push(item.asset)
            }
        }

        // Update the input value to reflect the current state of the gallery
        this.input.value = JSON.stringify(assets)

        // Trigger a change event against the input
        $.dispatch(this.input, 'change')
    }
}


// -- Behaviours --

Gallery.behaviours = {

    /**
     * The `acceptor` behaviour is used to create a file acceptor UI component
     * for the gallery.
     */
    'acceptor': {'default': defaultFactories.acceptor('acceptor', true)},

    /**
     * The `asset` behaviour is used to extract/build asset information from a
     * response (e.g the payload returned when uploading/transforming a
     * file/asset).
     */
    'asset': {'manhattan': manhattanFactories.asset()},

    /**
     * The `assetProp` behaviour is used to provide an interface/mapping for
     * property names and their values against the asset.
     *
     * As a minimum the following list of properties must be supported:
     *
     * - alt (get, set)
     * - contentType (get)
     * - downloadURL (get)
     * - filename (get)
     * - fileLength (get)
     * - imageMode (get)
     * - imageSize (get)
     * - previewURL (get)
     * - transform (get, set)
     *
     */
    'assetProp': {
        'manhattan': manhattanFactories.assetProp(
            '_asset',
            'parentOptions'
        )
    },

    /**
     * The `formData` behaviour is used to create a `FormData` instance that
     * contains the file to be uploaded and any other parameters required, for
     * example a CSRF token.
     */
    'formData': {'default': defaultFactories.formData()},

    /**
     * The `imageEditor` behaviour is used to create an image editor which
     * allows users to edit an image they have uploaded.
     */
    'imageEditor': {'default': defaultFactories.imageEditor('parentOptions')},

    /**
     * The `metadata` behaviour is used to create a metadata UI overlay which
     * allows users to view and modify metadata for the file.
     */
    'metadata': {'manhattan': manhattanFactories.metadata('parentOptions')},

    /**
     * The `uploader` behaviour is used to create a file uploader UI component
     * for the gallery items.
     */
    'uploader': {'default': defaultFactories.uploader('item', 'semaphore')},

    /**
     * The `viewer` behaviour is used to create a file viewer UI component for
     * the gallery items.
     */
    'viewer': {'default': defaultFactories.viewer('item', 'parentOptions')}
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
    'items': 'mh-gallery__items',

    /**
     * A subset of CSS classes used to indicate the type of file the gallery
     * is expected to accept.
     */
    'types': {

        /**
         * Applied to the gallery element when the expected file type is any
         * file.
         */
        'file': 'mh-gallery--file',

        /**
         * Applied to the gallery element when the expected file type is an
         * image.
         */
        'image': 'mh-gallery--image',

        /**
         * Applied to the gallery element when the expected file type is an
         * SVG image.
         */
        'svg_image': 'mh-gallery--image'
    }
}
