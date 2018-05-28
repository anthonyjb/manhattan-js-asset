import * as $ from 'manhattan-essentials'

import {Overlay} from './overlay'


// -- Class definition --


/**
 * The image editor UI component provides an overlay for users to edit an
 * image asset.
 */
export class ImageEditor extends Overlay {

    constructor(imageURL) {
        super()

        // The URL of the image being edited (typically a working draft
        // version of the image to keep load times optimal).
        this._imageURL = imageURL

        // The size of the image
        this._imageSize = null

        // The crop region component
        this._cropRegion = null

        // The orientation of the image (0, 90, 180, 270)
        this._orientation = 0

        // Domain for related DOM elements
        this._dom['table'] = null
        this._dom['image'] = null

        // Set up event handlers
        this._handlers['rotate'] = (event) => {
            this.rotate()
        }
    }

    /**
     * Initialize the image editor overlay.
     */
    init () {
        const cls = this.constructor

        // Initialize the overlay
        super.init(cls.css['image-editor'])

        // Create a table to display the image on
        this._dom.table = $.create('div', {'class': cls.css['table']})
        this.content.appendChild(this._dom.table)

        // Create the image
        this._dom.image = $.create('div', {'class': cls.css['image']})
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
                    this._fit()

                    // Set the image's background image
                    this._dom.image.style
                        .backgroundImage = `url(${this._imageURL})`
                }
            }
        )
        img.src = this._imageURL

        // Set up event listeners
        $.listen(this.overlay, {'rotate': this._handlers.rotate})
    }

    /**
     * Rotate the image one turn anti-clockwise.
     */
    rotate() {

        // Update the orientation
        this._orientation -= 90
        if (this._orientation < 0) {
            this._orientation = 270
        }

        // Fit the image at it's new orientation
        this._fit()

        // @@ Need to wait a short period for the rotation then reset the crop
        // and so forth.
    }

    // -- Private methods --

    /**
     * Fit the image and place it centered within the table.
     */
    _fit() {
        const cls = this.constructor

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

        const width = ratio * this._imageSize[0]
        const height = ratio * this._imageSize[1]

        // Calculate the position of the image to be centered within the
        // table.
        const left = (tableRect.width - width) / 2.0
        const top = (tableRect.height - height) / 2.0

        // Update the image to fit
        this._dom.image.style.width = `${width}px`
        this._dom.image.style.height = `${height}px`
        this._dom.image.style.left = `${left}px`
        this._dom.image.style.top = `${top}px`

        // Rotate the image
        this._dom.image.style.transform = `rotate(${this._orientation}deg)`
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
    'image-editor': 'mh-image-editor',

    /**
     * Applied to the editing table.
     */
    'table': 'mh-image-editor__table',
}