import * as $ from 'manhattan-essentials'


// -- Utils --

/**
 * Return the height of the given rect ([[x1, y1], [x2, y2]]).
 */
function getHeight(rect) {
    return Math.abs(rect[1][1] - rect[0][1])
}

/**
 * Return the width of the given rect ([[x1, y1], [x2, y2]]).
 */
function getWidth(rect) {
    return Math.abs(rect[1][0] - rect[0][0])
}

/**
 * Return a rect with all values multipled by the given multiplier.
 */
function multiply(rect, x) {
    return [
        [
            rect[0][0] * x,
            rect[0][1] * x
        ], [
            rect[1][0] * x,
            rect[1][1] * x
        ]
    ]
}

/**
 * Return a rect orientated to 0, 90, 180 or 270 degrees
 * ([[x1, y1], [x2, y2]]).
 */
export function orient(rect, orientation) {
    if (orientation === 90 || orientation === 270) {
        const width = getWidth(rect)
        const height = getHeight(rect)
        const center = [
            rect[0][0] + (width / 2),
            rect[0][1] + (height / 2)
        ]

        return [
            [
                center[0] - (height / 2),
                center[1] - (width / 2)
            ], [
                center[0] + (height / 2),
                center[1] + (width / 2)
            ]
        ]
    }

    return [
        rect[0].slice(),
        rect[1].slice()
    ]
}


// -- Classes --

/**
 * A UI component that allows users to mark a region of an image to crop.
 */
export class CropTool {

    constructor(container, imageURL, aspectRatio=null) {

        // The aspect ratio to apply when cropping (optional)
        this._aspectRatio = aspectRatio

        // The bounds of the cropping region [[x1, y1], [x2, y2]]
        this._bounds = [[0, 0], [0, 0]]

        // The URL of the image being cropped
        this._imageURL = imageURL

        // The orientation of the image being cropped (0, 90, 180, 270)
        this._orientation = 0

        // The region selected to crop [[x1, y1], [x2, y2]]
        this._region = [[0, 0], [0, 0]]

        // The visible state of the crop tool
        this._visible = false

        // Domain for related DOM elements
        this._dom = {
            'container': null,
            'controls': null,
            'frame': null,
            'image': null,
            'region': null,
            'tool': null
        }

        // Set the container element for the crop region
        this._dom.container = container

        // Set up event handlers
        this._handlers = {}
    }

    // -- Getters & Setters --

    get bounds() {
        return [
            this._bounds[0].slice(),
            this._bounds[1].slice()
        ]
    }

    set bounds(rect) {
        // Determine the scale of the change
        const scale = getWidth(rect) / getWidth(this._bounds)

        // Set the bounds for the crop tool
        this._bounds = [
            rect[0].slice(),
            rect[1].slice()
        ]

        // Update the position and size of the crop tool
        this._dom.tool.style.top = `${this._bounds[0][1]}px`
        this._dom.tool.style.left = `${this._bounds[0][0]}px`
        this._dom.tool.style.width = `${getWidth(this._bounds)}px`
        this._dom.tool.style.height = `${getHeight(this._bounds)}px`

        // Update the position and size of the crop region
        this.region = multiply(this._region, scale)

        this._updateImage()
    }

    get orientation() {
        return this._orientation
    }

    set orientation(angle) {
        // Set the orientation of the crop tool (the orientation angle is
        // purely used to set display properties of the image being cropped).
        this._orientation = angle

        this._updateImage()
    }

    get region() {
        return [
            this._region[0].slice(),
            this._region[1].slice()
        ]
    }

    set region(rect) {
        const {max, min} = Math

        // Set the region (and clamp it to the current bounds)
        const bounds = this._bounds
        this._region = [
            [
                max(0, min(getWidth(bounds), rect[0][0])),
                max(0, min(getHeight(bounds), rect[0][1]))
            ], [
                max(0, min(getWidth(bounds), rect[1][0])),
                max(0, min(getHeight(bounds), rect[1][1]))
            ]
        ]

        // Ensure the region isn't reversed
        this._region[1] = [
            max(this._region[0][0], this._region[1][0]),
            max(this._region[0][1], this._region[1][1])
        ]

        // Update the position and size of the crop regopm
        this._dom.region.style.top = `${this._region[0][1]}px`
        this._dom.region.style.left = `${this._region[0][0]}px`
        this._dom.region.style.width = `${getWidth(this._region)}px`
        this._dom.region.style.height = `${getHeight(this._region)}px`

        this._updateImage()
    }

    get visible() {
        return this._visible
    }

    set visible(visible) {
        const cls = this.constructor

        // Set the visible state
        this._visible = visible

        // Flag whether the crop tool is visible against the DOM element that
        // represents it.
        if (this._visible) {
            this._dom.tool.classList.add(cls.css['visible'])
        } else {
            this._dom.tool.classList.remove(cls.css['visible'])
        }
    }

    // Public methods

    /**
     * Remove the crop tool.
     */
    destroy() {
        // Remove the area, region, frame, image and controls
        if (this._dom.tool !== null) {
            this._dom.container.removeChild(this._dom.tool)
            this._dom.controls = null
            this._dom.frame = null
            this._dom.image = null
        }

        // Remove the resize handler from the window
        $.ignore(window, 'resize', this._handlers['resize'])
    }

    /**
     * Initialize the crop tool.
     */
    init() {
        const cls = this.constructor

        // Set the initial state of the crop tool to hidden
        this._visible = false

        // Create the crop tool (this initial state is hidden)
        this._dom.tool = $.create('div', {'class': cls.css['tool']})

        // Create the crop region
        this._dom.region = $.create('div', {'class': cls.css['region']})
        this._dom.tool.appendChild(this._dom.region)

        // Create the crop outline
        this._dom.outline = $.create('div', {'class': cls.css['outline']})
        this._dom.region.appendChild(this._dom.outline)

        // Create the crop image
        this._dom.image = $.create('div', {'class': cls.css['image']})
        this._dom.image.style.backgroundImage = `url(${this._imageURL})`
        this._dom.outline.appendChild(this._dom.image)

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

        // Add the crop tool to the container
        this._dom.container.appendChild(this._dom.tool)
    }

    /**
     * Reset the crop region (select a crop that is central to the image).
     */
    reset() {

        // Set the initial crop to match any given fixed aspect ratio (or
        // default to a square crop 1:1).
        let aspectRatio = 1
        if (this._aspectRatio) {
            aspectRatio = this._aspectRatio
        }

        // Calculate the initial crop size such that it fits within the bounds
        let width = getWidth(this.bounds)
        let height = getWidth(this.bounds) / aspectRatio

        if (aspectRatio < width / getHeight(this.bounds)) {
            width = getHeight(this.bounds) * aspectRatio
            height = getHeight(this.bounds)
        }

        // Calculate the initial crop position to be central to the bounds
        const x = (getWidth(this.bounds) - width) / 2
        const y = (getHeight(this.bounds) - height) / 2

        // Set the region
        this.region = [
            [x, y],
            [x + width, y + height]
        ]

        this._updateImage()
    }

    // -- Private functions --

    /**
     * Update the image displayed within the crop region to match the region's
     * position and size.
     */
    _updateImage() {
        let boundsSize = [getWidth(this.bounds), getHeight(this.bounds)]
        let regionSize = [getWidth(this.region), getHeight(this.region)]
        if (this._orientation === 90 || this._orientation === 270) {
            boundsSize = [boundsSize[1], boundsSize[0]]
            regionSize = [regionSize[1], regionSize[0]]
        }

        // Set the size of the image
        this._dom.image.style.backgroundSize
                = `${boundsSize[0]}px ${boundsSize[1]}px`
        this._dom.image.style.width = `${regionSize[0]}px`
        this._dom.image.style.height = `${regionSize[1]}px`

        // Position the image centerally so the rotatation is aligned
        this._dom.image.style.marginLeft = `-${regionSize[0] / 2}px`
        this._dom.image.style.marginTop = `-${regionSize[1] / 2}px`
        this._dom.image.style.left = `${getWidth(this.region) / 2}px`
        this._dom.image.style.top = `${getHeight(this.region) / 2}px`

        // Set the orientation of the image
        this._dom.image.style.transform = `rotate(${this._orientation}deg)`

        // Set the background's position inline with the crop region's
        let bkgX = this._region[0][0] // eslint-disable-line
        let bkgY = this._region[0][1] // eslint-disable-line

        switch (this._orientation) {

        case 90:
            bkgX = this._region[0][1] // eslint-disable-line
            bkgY = (boundsSize[1] - regionSize[1]) - this._region[0][0]
            break

        case 180:
            bkgX = (boundsSize[0] - regionSize[0]) - this._region[0][0]
            bkgY = (boundsSize[1] - regionSize[1]) - this._region[0][1]
            break

        case 270:
            bkgX = (boundsSize[0] - regionSize[0]) - this._region[0][1]
            bkgY = this._region[0][0] // eslint-disable-line
            break

        // No default

        }

        this._dom.image.style.backgroundPosition = `-${bkgX}px -${bkgY}px`
    }
}


// -- CSS classes --

CropTool.css = {

    /**
     * Applied to a crop tool control.
     */
    'control': 'mh-crop-tool__control',

    /**
     * Applied to crop tool controls to style them based on their
     * position.
     */
    'controls': {
        'c': 'mh-crop-tool__control--c',
        'n': 'mh-crop-tool__control--n',
        'ne': 'mh-crop-tool__control--ne',
        'e': 'mh-crop-tool__control--e',
        'se': 'mh-crop-tool__control--se',
        's': 'mh-crop-tool__control--s',
        'sw': 'mh-crop-tool__control--sw',
        'w': 'mh-crop-tool__control--w',
        'nw': 'mh-crop-tool__control--nw'
    },

    /**
     * Applied to the crop tool when the crop region is being dragged.
     */
    'dragging': 'mh-crop-tool--dragging',

    /**
     * Applied to image component used to display the area of the image being
     * cropped.
     */
    'image': 'mh-crop-tool__image',

    /**
     * Applied to the outline of the crop region.
     */
    'outline': 'mh-crop-tool__outline',

    /**
     * Applied to the crop region.
     */
    'region': 'mh-crop-tool__region',

    /**
     * Applied to the crop tool when the crop region is being resized.
     */
    'resizing': 'mh-crop-tool--resizing',

    /**
     * Applied to the crop tool.
     */
    'tool': 'mh-crop-tool',

    /**
     * Applied to the crop tool when visible.
     */
    'visible': 'mh-crop-tool--visible'
}
