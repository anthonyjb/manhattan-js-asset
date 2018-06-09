import * as $ from 'manhattan-essentials'

import {CropTool} from './crop-tool'
import {Overlay} from './overlay'


// -- Class definition --


/**
 * The image editor UI component provides an overlay for users to edit an
 * image asset.
 */
export class ImageEditor extends Overlay {

    constructor(imageURL, cropAspectRatio) {
        super()

        // The URL of the image being edited (typically a working draft
        // version of the image to keep load times optimal).
        this._imageURL = imageURL

        // An optional fixed aspect ratio for the cropping region
        this._cropAspectRatio = cropAspectRatio

        // The size of the image
        this._imageSize = null

        // The crop region component
        this._cropRegion = null

        // The orientation of the image (0, 90, 180, 270)
        this._orientation = 0

        // Domain for related DOM elements
        this._dom['image'] = null
        this._dom['mask'] = null
        this._dom['table'] = null

        // Set up event handlers

        this._handlers['resize'] = (event) => {
            this._fit(true)
        }

        this._handlers['rotate'] = (event) => {
            this.rotate()
        }
    }

    // -- Public methods --

    /**
     * Remove the image editor overlay.
     */
    destroy() {
        // Remove the table, image and mask element
        if (this.table !== null) {
            this.content.removeChild(this._dom.table)
            this._dom.image = null
            this._dom.mask = null
            this._dom.table = null
        }

        // Remove the resize handler from the window
        $.ignore(window, 'resize', this._handlers['resize'])

        super.destroy()
    }

    /**
     * Initialize the image editor overlay.
     */
    init () {
        const cls = this.constructor

        // Initialize the overlay
        super.init(cls.css['imageEditor'])

        // Create a table to display the image on
        this._dom.table = $.create('div', {'class': cls.css['table']})
        this.content.appendChild(this._dom.table)

        // Create the image & mask
        this._dom.image = $.create('div', {'class': cls.css['image']})
        this._dom.mask = $.create('div', {'class': cls.css['mask']})
        this._dom.image.appendChild(this._dom.mask)
        this._dom.image.style.transform = `rotate(${this._orientation}deg)`
        this._dom.table.appendChild(this._dom.image)

        // Create the buttons
        this.addButton('rotate', 'rotate')
        this.addButton('okay', 'okay')
        this.addButton('cancel', 'cancel')

        // Calculate the aspect ratio of the image
        const img = new Image()
        $.listen(
            img,
            {
                'load': () => {

                    // Calculate the aspect ratio
                    this._imageSize = [img.naturalWidth, img.naturalHeight]

                    // Fit the image within the table
                    this._fit(true)

                    // Set the image's background image
                    this._dom.mask.style
                        .backgroundImage = `url(${this._imageURL})`
                }
            }
        )
        img.src = this._imageURL

        // Set up event listeners
        $.listen(this.overlay, {'rotate': this._handlers.rotate})
        $.listen(window, {'resize': this._handlers.resize})
    }

    /**
     * Rotate the image one turn anti-clockwise.
     */
    rotate() {

        // Update the orientation
        this._orientation -= 90

        // Wrap around if the orientation is less than 0
        if (this._orientation < 0) {

            // HACK: Force the image to be orientated to 360 degrees without
            // transitioning to keep the transition from 0 to 270 from
            // spinning the image in the long direction.
            //
            // ~ Anthony Blackshaw, <ant@getme.co.uk>, 27 May 2018

            this._dom.image.style.transition = 'none'
            this._dom.image.style.transform = 'rotate(360deg)'
            this._dom.image.getBoundingClientRect()
            this._dom.image.style.transition = null

            this._orientation = 270
        }

        // Fit the image at it's new orientation
        this._fit()
    }

    // -- Private methods --

    /**
     * Fit the image and place it centered within the table.
     */
    _fit(disableTransitions=false) {
        const cls = this.constructor

        if (disableTransitions) {
            // Disable any transitions during the refit
            this._dom.table.classList.add(cls.css['noTransitions'])
        }

        // Measure the size of the table
        const tableRect = this._dom.table.getBoundingClientRect()
        let tableSize = [tableRect.width, tableRect.height]

        // Flip the table size if the orientation is 90 or 270
        if (this._orientation === 90 || this._orientation === 270) {
            tableSize = [tableSize[1], tableSize[0]]
        }

        // Calculate the size of the image to fit the table
        const widthScale = tableSize[0] / this._imageSize[0]
        const heightScale = tableSize[1] / this._imageSize[1]
        const ratio = Math.min(widthScale, heightScale)

        const width = parseInt(ratio * this._imageSize[0], 10)
        const height = parseInt(ratio * this._imageSize[1], 10)

        // Calculate the position of the image to be centered within the
        // table.
        const left = parseInt((tableRect.width - width) / 2.0, 10)
        const top = parseInt((tableRect.height - height) / 2.0, 10)

        // Update the image to fit
        this._dom.image.style.width = `${width}px`
        this._dom.image.style.height = `${height}px`
        this._dom.image.style.left = `${left}px`
        this._dom.image.style.top = `${top}px`

        // Rotate the image
        this._dom.image.style.transform = `rotate(${this._orientation}deg)`

        if (disableTransitions) {

            // Disable any transitions during the (re)fit.
            //
            // HACK: We call `getBoundingClientRect` to force any changes to
            // complete before we re-enable the transitions.
            //
            // ~ Anthony Blackshaw, <ant@getme.co.uk>, 9 June 2018

            this._dom.table.getBoundingClientRect()
            this._dom.table.classList.remove(cls.css['noTransitions'])
        }
    }
}


// -- CSS classes --

ImageEditor.css = {

    /**
     * Applied to the image.
     */
    'image': 'mh-image-editor__image',

    /**
     * Applied to the image editor overlay.
     */
    'imageEditor': 'mh-image-editor',

    /**
     * Applied to the image mask.
     */
    'mask': 'mh-image-editor__image-mask',

    /**
     * Applied to the editing table when no transition should be applied to
     * the image (e.g during a resize).
     */
    'noTransitions': 'mh-image-editor__table--no-transitions',

    /**
     * Applied to the editing table.
     */
    'table': 'mh-image-editor__table'
}
