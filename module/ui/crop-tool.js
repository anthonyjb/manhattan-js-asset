import * as $ from 'manhattan-essentials'


// -- Utils --

/**
 * Return the height of the given rect ([[x1, y1], [x2, y2]]).
 */
function height(rect) {
    return Math.abs(rect[1][1] - rect[0][1])
}

/**
 * Return the width of the given rect ([[x1, y1], [x2, y2]]).
 */
function width(rect) {
    return Math.abs(rect[1][0] - rect[0][0])
}


// -- Classes --

/**
 * A UI component that allows users to mark a region of an image to crop.
 */
export class CropTool {

    constructor(container, imageURL, aspectRatio=null) {

        // The aspect ratio to apply when cropping (optional)
        self._aspectRatio = aspectRatio

        // The bounds of the cropping region [[x1, y1], [x2, y2]]
        self._bounds = [[0, 0], [0, 0]]

        // The URL of the image being cropped
        self._imageURL = imageURL

        // The orientation of the image being cropped (0, 90, 180, 270)
        self._orientation = 0

        // The region selected to crop [[x1, y1], [x2, y2]]
        self._region = [[0, 0], [0, 0]]

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
        return this.todo
    }

    set bounds(bounds) {
        this.todo = bounds
    }

    get decimalRegion() {
        return this.todo
    }

    get orientation() {
        return this._orientation
    }

    set orientation(orientation) {
        this.todo = orientation
    }

    get region() {
        return this.todo
    }

    set region(region) {
        this.todo = region
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

        // @@ START HERE Define the new structure for the cropping tool

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
    }

    /**
     * Reset the crop region (select a crop that is central to the image).
     */
    reset() {
        return this.todo
    }

    /**
     * Hide the crop tool.
     */
    hide() {
        return this.todo
    }

    /**
     * Show the crop tool.
     */
    show() {
        return this.todo
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
        'sw': 'mh-croptool__control--sw',
        'w': 'mh-crop-tool__control--w',
        'nw': 'mh-crop-tool__control--nw'
    },

    /**
     * Applied to the crop tool when the crop region is being dragged.
     */
    'dragging': 'mh-crop-tool--dragging',

    /**
     * Applied to the frame for the crop region.
     */
    'frame': 'mh-crop-tool__frame',

    /**
     * Applied to the crop tool when hidden.
     */
    'hidden': 'mh-crop-tool--hidden',

    /**
     * Applied to image component used to display the area of the image being
     * cropped.
     */
    'image': 'mh-crop-tool__image',

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
    'tool': 'mh-crop-tool'
}
