import * as $ from 'manhattan-essentials'

import {CropTool} from './crop-tool'
import {Overlay} from './overlay'
import {orient} from './../utils/rects'


// -- Class definition --


/**
 * The image editor UI component provides an overlay for users to edit an
 * image asset.
 */
export class ImageEditor extends Overlay {

    constructor(
        imageURL,
        cropAspectRatio=1.0,
        fixCropAspectRatio=false,
        maxPreviewSize=[600, 600],
        container=null
    ) {
        super(container)

        // The URL of the image being edited (typically a working draft
        // version of the image to keep load times optimal).
        this._imageURL = imageURL

        // An optional initial aspect ratio for the cropping region
        this._cropAspectRatio = cropAspectRatio

        // A flag indicating if the cropping region for the image should be
        // fixed.
        this._fixCropAspectRatio = fixCropAspectRatio

        // The maximum size of the preview image generated when accessing the
        // previewDataURI property.
        this._maxPreviewSize = maxPreviewSize

        // The size of the image
        this._imageSize = null

        // The crop tool component
        this._cropTool = null

        // The orientation of the image (0, 90, 180, 270)
        this._orientation = 0

        // Flag indicating if the image is currently being rotated
        this._rotating = false

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

        this._handlers['rotated'] = (event) => {
            if (event.target === this._dom.image) {
                this._rotating = false
            }
        }
    }

    // -- Getters & Setters --

    get transforms() {
        const transforms = []

        // Rotate
        if (this._orientation !== 0) {
            transforms.push(['rotate', this._orientation])
        }

        // Crop
        const {crop} = this._cropTool

        if (crop[0][0] + crop[0][1] !== 0 || crop[1][0] + crop[1][1] !== 2) {
            transforms.push(['crop', crop])
        }

        return transforms
    }

    get previewDataURI() {
        return new Promise((resolve, reject) => {
            // Create a canvas to hold the base image
            const baseCanvas = document.createElement('canvas')
            const baseContext = baseCanvas.getContext('2d')

            // Build a canvas to crop the image with
            const cropCanvas = document.createElement('canvas')
            const cropContext = cropCanvas.getContext('2d')

            // Build a canvas to resize the image with
            const resizeCanvas = document.createElement('canvas')
            const resizeContext = resizeCanvas.getContext('2d')

            // Create the base image to paste into the canvas
            const baseImage = new Image()
            baseImage.setAttribute('crossorigin', 'anonymous')
            baseImage.src = this._imageURL

            baseImage.onload = () => {
                const cls = this.constructor

                // Set the size of the base canvas to match the image
                baseCanvas.width = baseImage.width
                baseCanvas.height = baseImage.height
                if (this._orientation === 90 || this._orientation === 270) {
                    baseCanvas.width = baseImage.height
                    baseCanvas.height = baseImage.width
                }

                // Draw the base image into the base canvas at the current
                // orientation.
                baseContext.save()

                if (this._orientation === 90 || this._orientation === 270) {
                    baseContext.translate(
                        baseImage.height / 2,
                        baseImage.width / 2
                    )
                } else {
                    baseContext.translate(
                        baseImage.width / 2,
                        baseImage.height / 2
                    )
                }

                baseContext.rotate(this._orientation * Math.PI / 180)
                baseContext.drawImage(
                    baseImage,
                    -baseImage.width / 2,
                    -baseImage.height / 2
                )
                baseContext.restore()

                // Apply any crop by drawing the base canvas into the crop
                // canvas.
                const {crop} = this._cropTool
                const cropX = parseInt(baseCanvas.width * crop[0][0], 10)
                const cropY = parseInt(baseCanvas.height * crop[0][1], 10)
                cropCanvas.width = parseInt(
                    baseCanvas.width * (crop[1][0] - crop[0][0]),
                    10
                )
                cropCanvas.height = parseInt(
                    baseCanvas.height * (crop[1][1] - crop[0][1]),
                    10
                )

                cropContext.drawImage(
                    baseCanvas,
                    cropX,
                    cropY,
                    cropCanvas.width,
                    cropCanvas.height,
                    0,
                    0,
                    cropCanvas.width,
                    cropCanvas.height
                )

                // Ensure (by resizing) the preview image is sensible size
                const previewSize = [
                    Math.min(this._maxPreviewSize[0], cropCanvas.width),
                    Math.min(this._maxPreviewSize[1], cropCanvas.height)
                ]
                const aspectRatio = cropCanvas.width / cropCanvas.height
                resizeCanvas.width = previewSize[0] // eslint-disable-line
                resizeCanvas.height = previewSize[0] / aspectRatio

                if (aspectRatio < resizeCanvas.width / previewSize[1]) {
                    resizeCanvas.width = previewSize[1] * aspectRatio
                    resizeCanvas.height = previewSize[1] // eslint-disable-line
                }

                resizeContext.drawImage(
                    cropCanvas,
                    0,
                    0,
                    cropCanvas.width,
                    cropCanvas.height,
                    0,
                    0,
                    resizeCanvas.width,
                    resizeCanvas.height
                )

                resolve([
                    resizeCanvas.toDataURL(),
                    {
                        'width': resizeCanvas.width,
                        'height': resizeCanvas.height,
                        'maxWidth': cropCanvas.width
                    }
                ])
            }
        })
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
        $.ignore(window, {'resize': this._handlers['resize']})

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
        this.addButton('rotate', 'rotate', 'rotate')
        this.addButton('okay', 'okay', 'okay')
        this.addButton('cancel', 'cancel', 'cancel')

        // Calculate the aspect ratio of the image
        const img = new Image()
        $.listen(
            img,
            {
                'load': () => {

                    // Calculate the aspect ratio
                    this._imageSize = [img.naturalWidth, img.naturalHeight]

                    // Create the crop tool for the editor
                    this._cropTool = new CropTool(
                        this._dom.table,
                        this._imageURL,
                        this._cropAspectRatio,
                        this._fixCropAspectRatio
                    )
                    this._cropTool.init()

                    // Fit the image within the table
                    this._fit(true)

                    // Set the image's background image
                    this._dom.mask.style
                        .backgroundImage = `url(${this._imageURL})`

                    // Reset the crop tool
                    this._cropTool.reset()
                    this._cropTool.visible = true
                }
            }
        )
        img.src = this._imageURL

        // Set up event listeners
        $.listen(
            this._dom.image,
            {'transitionend': this._handlers['rotated']}
        )
        $.listen(this.overlay, {'rotate': this._handlers.rotate})
        $.listen(window, {'resize': this._handlers.resize})
    }

    /**
     * Rotate the image one turn anti-clockwise.
     */
    rotate() {
        // Check the image isn't currently being rotated
        if (this._rotating) {
            return
        }

        // Flag the image as rotating while we perform the rotation
        this._rotating = true

        // Hide the crop tool while we rotate
        this._cropTool.visible = false

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

        // Reset the crop tool to match the new orientation
        this._cropTool.reset()
        this._cropTool.visible = true
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
        const width = ratio * this._imageSize[0]
        const height = ratio * this._imageSize[1]

        // Update the image to fit
        this._dom.image.style.width = `${Math.ceil(width)}px`
        this._dom.image.style.height = `${Math.ceil(height)}px`
        this._dom.image.style.marginLeft = `-${Math.ceil(width / 2)}px`
        this._dom.image.style.marginTop = `-${Math.ceil(height / 2)}px`
        this._dom.image.style.left = `${Math.ceil(tableRect.width / 2)}px`
        this._dom.image.style.top = `${Math.ceil(tableRect.height / 2)}px`

        // Rotate the image
        this._dom.image.style.transform = `rotate(${this._orientation}deg)`

        // Update the bounds and orientation of the crop tool
        const left = (tableRect.width - width) / 2
        const right = (tableRect.height - height) / 2

        this._cropTool.bounds = orient(
            [
                [left, right],
                [left + width, right + height]
            ],
            this._orientation
        )
        this._cropTool.orientation = this._orientation

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
