import * as $ from 'manhattan-essentials'

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

                    // Create a crop region for the image
                    this._cropRegion = new CropRegion(
                        this._dom.table,
                        0,
                        this._imageURL,
                        this._cropAspectRatio
                    )
                    this._cropRegion.init()

                    // Fit the image within the table
                    this._fit()

                    this._cropRegion.reset()

                    // Set the image's background image
                    this._dom.mask.style
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

        // @@ Need to wait a short period for the rotation then reset the crop
        // and so forth.
        this._cropRegion.reset()
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

        // @@ Set the bounds for the crop region
        this._cropRegion._orientation = this._orientation
        let viewport = [width, height]
        if (this._orientation === 90 || this._orientation === 270) {
            viewport = [height, width]
        }
        const offset = [
            parseInt((tableRect.width - viewport[0]) / 2.0, 10),
            parseInt((tableRect.height - viewport[1]) / 2.0, 10)
        ]
        this._cropRegion.setBounds(offset, viewport)
    }

}


// -- CSS classes --

ImageEditor.css = {

    /**
     * Applied to the image.
     */
    'image': 'mh-image-editor__image',

    /**
     * Applied to the image mask.
     */
    'mask': 'mh-image-editor__image-mask',

    /**
     * Applied to the image editor overlay.
     */
    'imageEditor': 'mh-image-editor',

    /**
     * Applied to the editing table.
     */
    'table': 'mh-image-editor__table',
}


/**
 * A UI component that allows users to mark a region of an image to crop.
 */
class CropRegion {

    constructor(
        container,
        orientation,
        imageURL,
        fixedAspectRatio=null
    ) {
        // The orientation of the image currently
        this._orientation = orientation

        // The crop region position and size as a rectangle
        this._region = {
            'top': 0,
            'left': 0,
            'width': 0,
            'height': 0
        }

        // The URL of the image to displayed within the crop region
        this._imageURL = imageURL

        // An optional fixed aspect ratio for the cropping region
        this._fixedAspectRatio = fixedAspectRatio

        // The the offset of crop viewport that can be cropped within relative
        // to the container.
        this._offset = [0, 0]

        // The the size of the viewport that can be cropped within
        this._viewport = [0, 0]

        // Domain for related DOM elements
        this._dom = {
            'container': null,
            'controls': null,
            'frame': null,
            'image': null,
            'region': null
        }

        // Set the container for the crop region
        this._dom.container = container
    }

    get container() {
        return this._dom.container
    }

    init() {
        const cls = this.constructor

        // Create the crop region
        this._dom.region = $.create('div', {'class': cls.css['region']})

        // Create the frame
        this._dom.frame = $.create('div', {'class': cls.css['frame']})
        this._dom.region.appendChild(this._dom.frame)

        // Create the image
        this._dom.image = $.create('div', {'class': cls.css['image']})
        this._dom.frame.appendChild(this._dom.image)

        // Create the controls
        for (let ctrl of ['c', 'n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']) {
            let ctrlElm = $.create(
                'div',
                {
                    'class':
                        `${cls.css['control']} ${cls.css['controls'][ctrl]}`,
                    'data-mh-crop-region-control': ctrl
                }
            )
            this._dom.region.appendChild(ctrlElm)
        }

        // Set the region's background image
        this._dom.image.style.backgroundImage = `url(${this._imageURL})`

        // Add the crop region to the container
        this.container.appendChild(this._dom.region)

        // Reset the the crop region to match the current bounds and
        // orientation.
        this.reset()
    }

    get imageSize() {
        if (this._orientation === 90 || this._orientation === 270) {
            return [this._viewport[1], this._viewport[0]]
        }
        return this._viewport.slice()
    }

    /**
     * Reset the crop region to match the current bounds.
     */
    reset() {
        // Determine the intial aspect ratio (default to 1:1)
        let aspectRatio = 1
        if (this._cropAspectRatio) {
            aspectRatio = this._cropAspectRatio
        }

        // Calculate the initial crop size such that it fits within the bounds
        let width = this._viewport[0]
        let height = parseInt(this._viewport[0] / aspectRatio, 10)

        if (aspectRatio < (this._viewport[0] / this._viewport[1])) {
            width = this._viewport[1] * aspectRatio
            height = this._viewport[1]
        }

        // Calculate the initial crop position to be central to the bounds
        const left = parseInt((this._viewport[0] - width) / 2, 10)
        const top = parseInt((this._viewport[1] - height) / 2, 10)

        this.setSize(width, height)
        this.setPosition(top, left)
    }

    /**
     * Set the bounds for the crop region.
     */
    setBounds(offset, viewport) {
        this._offset = offset.slice()
        this._viewport = viewport.slice()

        // Update the background image's size to match the bounds
        this._dom.image.style.backgroundSize
            = `${this.imageSize[0]}px ${this.imageSize[1]}px`
    }

    /**
     * Set the position of the crop region.
     */
    setPosition(top, left) {

        // Set the position of the crop region (clamp the position to the crop
        // bounds).
        this._region.left = left
        // Math.max(
        //     0,
        //     Math.min(this._bounds.width - this._region.width, left)
        // )
        this._region.top = top
        // Math.max(
        //     0,
        //     Math.min(this._bounds.height - this._region.height, top)
        // )

        // Update the position of the crop region element
        this._dom.region.style.top
            = `${this._offset[1] + this._region.top}px`
        this._dom.region.style.left
            = `${this._offset[0] + this._region.left}px`

        let x = 0
        let y = 0

        if (this._orientation === 0) {
            x = this._region.left
            y = this._region.top
        }

        if (this._orientation === 90) {
            x = this._region.top
            y = (this._viewport[0] - this._region.height) - this._region.left
        }

        if (this._orientation === 180) {
            x = (this._viewport[0] - this._region.width) - this._region.left
            y = (this._viewport[1] - this._region.height) - this._region.top
        }

        if (this._orientation === 270) {
            x = (this._viewport[1] - this._region.width) - this._region.top
            y = this._region.left
        }

        this._dom.image.style.backgroundPosition = `-${x}px -${y}px`
    }

    /**
     * Set the size of the crop region.
     */
    setSize(width, height) {

        // Set the size of the crop region (clamp the size to the crop bounds)
        this._region.width = width
        // Math.max(
        //     0,
        //     Math.min(this._bounds.width - this._region.left, width)
        // )
        this._region.height = height
        // Math.max(
        //     0,
        //     Math.min(this._bounds.height - this._region.top, height)
        // )

        // Update the size of the crop region element
        this._dom.region.style.width = `${this._region.width}px`
        this._dom.region.style.height = `${this._region.height}px`

        let originX = 0;
        let originY = 0;

        if (this._orientation === 90) {
            originX = originY = this._region.width / 2.0
        }

        if (this._orientation === 180) {
            originX = this._region.width / 2.0
            originY = this._region.height / 2.0
        }

        if (this._orientation === 270) {
            originX = originY = this._region.height / 2.0
        }

        if (this._orientation === 90 || this._orientation === 270) {
            this._dom.image.style.width = `${this._region.height}px`
            this._dom.image.style.height = `${this._region.width}px`
        } else {
            this._dom.image.style.width = `${this._region.width}px`
            this._dom.image.style.height = `${this._region.height}px`
        }


        this._dom.image.style.transformOrigin = `${originX}px ${originY}px 0px`
        this._dom.image.style.transform = `rotate(${this._orientation}deg)`

    }

}


// -- CSS classes --

CropRegion.css = {

    /**
     * Applied to a crop region control.
     */
    'control': 'mh-crop-region__control',

    /**
     * Applied to crop region controls to style them based on their
     * position.
     */
    'controls': {
        'c': 'mh-crop-region__control--c',
        'n': 'mh-crop-region__control--n',
        'ne': 'mh-crop-region__control--ne',
        'e': 'mh-crop-region__control--e',
        'se': 'mh-crop-region__control--se',
        's': 'mh-crop-region__control--s',
        'sw': 'mh-crop-region__control--sw',
        'w': 'mh-crop-region__control--w',
        'nw': 'mh-crop-region__control--nw'
    },

    /**
     * Applied to the crop region when being dragged.
     */
    'dragging': 'mh-crop-region--dragging',

    /**
     * Applied to the frame for the crop region.
     */
    'frame': 'mh-crop-region__frame',

    /**
     * Applied to image component used to displau the crop of the image.
     */
    'image': 'mh-crop-region__image',

    /**
     * Applied to the crop region.
     */
    'region': 'mh-crop-region',

    /**
     * Applied to the crop region when being resized.
     */
    'resizing': 'mh-crop-region--resizing'
}