import * as $ from 'manhattan-essentials'

import {ImageEditor} from './image-editor'


// -- Class definition --

/**
 * An item UI component (asset) within a gallery.
 */

export class GalleryItem {

    constructor(container, gallery) {

        // The gallery the item is associated with
        this._gallery = gallery

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

    // -- Getters & Setters --

    get asset() {
        if (this._asset) {
            return Object.assign(this._asset, {})
        }
        return null
    }

    get parentBehaviours() {
        return this._gallery._behaviours
    }

    get item() {
        return this._dom.item
    }

    get parentOptions() {
        return this._gallery._options
    }

    get semaphore() {
        return this._gallery._semaphore
    }

    get state() {
        return this._state
    }

    // -- Public methods --

    /**
     * Remove the gallery item.
     */
    destroy() {
        if (this._dom.item) {
            this._dom.item.parentNode.removeChild(this._dom.item)
        }
    }

    /**
     * Return the value of the named property from the asset.
     */
    getAssetProp(name) {
        const behaviourMap = this._gallery.constructor.behaviours.assetProp
        const behaviour = this.parentBehaviours.assetProp
        return behaviourMap[behaviour](this, 'get', name)
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

        // Store a reference to the gallery item against the item element so
        // that the gallery can link the element to the item on sort.
        this.item._mhGalleryItem = this

        // Add the item to the page
        this._dom.container.appendChild(this._dom.item)
    }

    /**
     * Populate the gallery item (transition to the viewing state).
     */
    populate(asset) {
        const cls = this.constructor

        // Clear the current state component
        this._destroyStateComponent()

        // Update the asset and input value
        this._asset = asset

        // Set up the viewer
        const behaviourMap = this._gallery.constructor.behaviours
        const behaviour = this.parentBehaviours.viewer
        this._viewer = behaviourMap.viewer[behaviour](this)
        this._viewer.init()

        // Set up event handlers for the viewer
        $.listen(
            this._viewer.viewer,
            {
                'download': () => {
                    // Build a link to trigger a file download
                    const a = $.create(
                        'a',
                        {
                            'download': '',
                            'href': this.getAssetProp('downloadURL'),
                            'target': '_blank'
                        }
                    )
                    a.click()
                },

                'edit': () => {
                    const editingURL = this.getAssetProp('editingURL')
                    const imageEditor = new ImageEditor(
                        editingURL,
                        this.parentOptions.cropAspectRatio,
                        this.parentOptions.fixCropAspectRatio,
                        this.parentOptions.maxPreviewSize
                    )
                    imageEditor.init()
                    imageEditor.show()

                    $.listen(
                        imageEditor.overlay,
                        {
                            'okay': () => {
                                const {transforms} = imageEditor
                                const {previewDataURI} = imageEditor

                                previewDataURI.then((dataURI) => {

                                    // Set the preview image
                                    this._viewer.imageURL = dataURI

                                    // Set base transforms against the image
                                    this.setAssetProp(
                                        'transforms',
                                        imageEditor.transforms
                                    )

                                    imageEditor.hide()
                                })
                            },
                            'cancel': () => {
                                imageEditor.hide()
                            },
                            'hidden': () => {
                                imageEditor.destroy()
                            }
                        }
                    )
                },

                'metadata': () => {
                    const metaBehaviour = this.parentBehaviours.metadata
                    const metadata = behaviourMap
                        .metadata[metaBehaviour](this)
                    metadata.init()
                    metadata.show()

                    $.listen(
                        metadata.overlay,
                        {
                            'okay': () => {
                                // Apply any  metadata changes
                                const {props} = metadata
                                for (let key in props) {
                                    this.setAssetProp(key, props[key])
                                }

                                // Hide the medata overlay
                                metadata.hide()
                            },
                            'cancel': () => {
                                metadata.hide()
                            },
                            'hidden': () => {
                                metadata.destroy()
                            }
                        }
                    )
                },

                'remove': () => {
                    // Remove the item
                    this.destroy()

                    // Dispatch the removed event
                    $.dispatch(this.item, 'removed', {'item': this})
                }
            }
        )

        // Set the new state
        this._state = 'viewing'

        // Flag element as populated in the DOM
        this.item.classList.add(cls.css['populated'])

        // Dispatch a populated event
        $.dispatch(this.item, 'populated', {'item': this})
    }

    postError(message) {

    }

    /**
     * Set the value of the named property from the asset.
     */
    setAssetProp(name, value) {
        const behaviourMap = this._gallery.constructor.behaviours.assetProp
        const behaviour = this.parentBehaviours.assetProp

        // Set the asset property
        behaviourMap[behaviour](this, 'set', name, value)

        // Dispatch an updated event
        $.dispatch(this.item, 'updated', {'item': this})
    }

    /**
     * Upload a file (transition to the uploading state).
     */
    upload(file) {
        const cls = this.constructor
        const behaviourMap = this._gallery.constructor.behaviours
        const behaviours = this.parentBehaviours

        // Clear the current state component
        this._destroyStateComponent()

        // Build the form data
        const formData = behaviourMap.formData[behaviours.formData](
            this,
            file
        )

        // Set up the uploader
        this._uploader = behaviourMap.uploader[behaviours.uploader](
            this,
            this.parentOptions.uploadUrl,
            formData
        )
        this._uploader.init()

        // Set up event handlers for the uploader
        $.listen(
            this._uploader.uploader,
            {
                'cancelled aborted error': () => {
                    // Remove the item
                    this.destroy()

                    // Dispatch the removed event
                    $.dispatch(this.item, 'removed', {'item': this})
                },

                'uploaded': (event) => {
                    try {
                        // Extract the asset from the response
                        const asset = behaviourMap.asset[behaviours.asset](
                            this,
                            event.response
                        )

                        // Populate the field
                        this.populate(asset)

                    } catch (error) {
                        if (error instanceof ResponseError) {
                            // Clear the field
                            this.clear()

                            // Display the upload error
                            this.postError(error.message)

                        } else {

                            // Re-through any JS error
                            throw error
                        }
                    }
                }
            }
        )

        // Set the new state
        this._state = 'uploading'
    }

    // -- Private methods --

    /**
     * Destroy the component for the current state (acceptor, uploader or
     * viewer).
     */
    _destroyStateComponent() {

        // Clear the state component
        switch (this.state) {

        case 'accepting':
            this._acceptor.destroy()
            break

        case 'errored':
            this._error.destroy()
            break

        case 'uploading':
            this._uploader.destroy()
            break

        // no default

        }
    }
}


// -- CSS classes --

GalleryItem.css = {

    /**
     * Applied to the gallery item element.
     */
    'item': 'mh-gallery-item',

    /**
     * Applied to the gallery item when it is populated with an asset.
     */
    'populated': 'mh-gallery-item--populated'

}
