import * as $ from 'manhattan-essentials'

import {getEventPos} from './../utils/events'
import {getExtents, getHeight, getWidth, multiply} from './../utils/rects'


// -- Classes --

/**
 * A UI component that allows users to mark a region of an image to crop.
 */
export class CropTool {

    constructor(container, imageURL, aspectRatio=1.0, fixAspectRatio=false) {

        // The initial aspect ratio to select
        this._initialAspectRatio = aspectRatio

        // A fixed aspect ratio used when cropping (optional)
        this._fixedAspectRatio = null
        if (fixAspectRatio) {
            this._fixedAspectRatio = aspectRatio
        }

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

        // The state at the point at which a dragging interaction began
        this._drag = {
            'extents': null,
            'origin': null,
            'region': null
        }

        // The state at the point at which a resizing interaction began
        this._resize = {
            'anchor': null,
            'extents': null,
            'origin': null,
            'region': null
        }

        this._handlers = {

            'drag': (event) => {
                if (this._drag.origin === null) {
                    return
                }

                event.preventDefault()

                // Update the position of the crop region
                const {max, min} = Math
                const {extents, origin, region} = this._drag
                const pos = getEventPos(event)

                // Calculate the movement vector (and clamp it to the extents)
                const mv = [
                    max(
                        extents[0][0],
                        min(extents[1][0], pos[0] - origin[0])
                    ),
                    max(
                        extents[0][1],
                        min(extents[1][1], pos[1] - origin[1])
                    )
                ]

                this.region = [
                    [
                        region[0][0] + mv[0],
                        region[0][1] + mv[1]
                    ], [
                        region[1][0] + mv[0],
                        region[1][1] + mv[1]
                    ]
                ]
            },

            'endDrag': (event) => {
                const cls = this.constructor

                if (this._drag.origin === null) {
                    return
                }

                // Ignore mouseout events that don't signal the cursor has
                // left the window.
                if (event.type === 'mouseout') {
                    if (event.relatedTarget || event.toElement !== null) {
                        return
                    }
                }

                event.preventDefault()

                // Clear the drag origin
                this._drag = {
                    'extents': null,
                    'origin': null,
                    'region': null
                }

                // Flag the tool as no longer being dragged in the CSS
                this._dom.tool.classList.remove(cls.css['dragging'])
            },

            'startDrag': (event) => {
                const cls = this.constructor

                // Drag starts when user interacts with the center control
                if (event.target.dataset.control !== 'c') {
                    return
                }

                // Only the left mouse button triggers a drag (touch simulates
                // left mouse button).
                if (event.type === 'mousedown' && event.button !== 0) {
                    return
                }

                event.preventDefault()

                // Store state at point dragging begins
                this._drag = {
                    'extents': getExtents(
                        this.region,
                        [
                            [0, 0],
                            [getWidth(this._bounds), getHeight(this._bounds)]
                        ]
                    ),
                    'origin': getEventPos(event),
                    'region': this.region
                }

                // Flag the tool as being dragged in the CSS
                this._dom.tool.classList.add(cls.css['dragging'])
            },

            'resize': (event) => {
                if (this._resize.origin === null) {
                    return
                }

                event.preventDefault()

                // Update the size of the crop region
                const {max, min} = Math
                const {extents, matrix, origin, region} = this._resize
                const pos = getEventPos(event)

                // Calculate the change of the mouse cursor for both axes
                const x = pos[0] - origin[0]
                const y = pos[1] - origin[1]
                const mv = [
                    max(extents[0][0], min(extents[1][0], x)),
                    max(extents[0][1], min(extents[1][1], y))
                ]

                // Build a new region based on the movement and movement
                // matrix.
                const m = matrix
                this.region = [
                    [
                        region[0][0] + (m[0][3] * mv[0]) + (m[1][3] * mv[1]),
                        region[0][1] + (m[0][0] * mv[0]) + (m[1][0] * mv[1])
                    ], [
                        region[1][0] + (m[0][1] * mv[0]) + (m[1][1] * mv[1]),
                        region[1][1] + (m[0][2] * mv[0]) + (m[1][2] * mv[1])
                    ]
                ]
            },

            'endResize': (event) => {
                const cls = this.constructor

                if (this._resize.origin === null) {
                    return
                }

                // Ignore mouseout events that don't signal the cursor has
                // left the window.
                if (event.type === 'mouseout') {
                    if (event.relatedTarget || event.toElement !== null) {
                        return
                    }
                }

                event.preventDefault()

                // Clear the resize origin
                this._resize = {
                    'extents': null,
                    'matrix': null,
                    'origin': null,
                    'region': null
                }

                // Flag the tool as no longer being resized in the CSS
                this._dom.tool.classList.remove(cls.css['resizing'])
            },

            'startResize': (event) => {
                const cls = this.constructor

                // Resize starts when user interacts with an outer control
                const controls = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
                if (controls.indexOf(event.target.dataset.control) === -1) {
                    return
                }

                // Only the left mouse button triggers a resize (touch
                // simulates left mouse button).
                if (event.type === 'mousedown' && event.button !== 0) {
                    return
                }

                event.preventDefault()

                // Store state at point resizing begins
                const anchor = event.target.dataset.control
                const {region} = this

                // Determine the ratio that the crop region must retain (if
                // there is one, if not the ratio is set to 0).
                let ratio = this._fixedAspectRatio || 0.0

                // Define the maximum extent to which the crop region can grow
                // using a rect.
                let point = null
                const maxRect = [
                    [0, 0],
                    [getWidth(this.bounds), getHeight(this.bounds)]
                ]

                // The matrix defines how movement on the X/Y axes should be
                // applied to the regions top, right, bottom and left sides.
                //
                //     [
                //         [top, right, bottom, left], (x)
                //         [top, right, bottom, left]  (y)
                //     ]
                //
                const matrix = [
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ]

                // Using the anchor determine the change matrix and min/max
                // extent of any change.
                let distanceToEdge = 0
                switch (anchor) {

                case 'n':
                    matrix[1][0] = 1

                    point = [
                        region[0][0] + (getWidth(region) / 2),
                        region[0][1]
                    ]
                    maxRect[1][1] = region[1][1] // eslint-disable-line

                    if (ratio !== 0.0) {
                        matrix[1][1] = -ratio / 2.0
                        matrix[1][3] = ratio / 2.0

                        distanceToEdge = Math.min(
                            point[0],
                            maxRect[1][0] - point[0]
                        )
                        maxRect[0][0] = point[0] - distanceToEdge
                        maxRect[1][0] = point[0] + distanceToEdge
                    }
                    break

                case 'ne':
                    matrix[0][1] = 1.0
                    matrix[1][0] = 1.0
                    if (ratio !== 0.0) {
                        matrix[1][0] = 0.0
                        matrix[0][0] = -1 / ratio
                    }

                    point = [region[1][0], region[0][1]]
                    maxRect[0][0] = region[0][0] // eslint-disable-line
                    maxRect[1][1] = region[1][1] // eslint-disable-line
                    break

                case 'e':
                    matrix[0][1] = 1.0
                    point = [
                        region[1][0],
                        region[0][1] + (getHeight(region) / 2)
                    ]
                    maxRect[0][0] = region[0][0] // eslint-disable-line

                    if (ratio !== 0.0) {
                        matrix[0][0] = (-1 / ratio) / 2.0
                        matrix[0][2] = (1 / ratio) / 2.0

                        distanceToEdge = Math.min(
                            point[1],
                            maxRect[1][1] - point[1]
                        )
                        maxRect[0][1] = point[1] - distanceToEdge
                        maxRect[1][1] = point[1] + distanceToEdge
                    }

                    break

                case 'se':
                    matrix[0][1] = 1.0
                    matrix[1][2] = 1.0
                    if (ratio !== 0.0) {
                        matrix[1][2] = 0.0
                        matrix[0][2] = 1 / ratio
                    }

                    point = [region[1][0], region[1][1]]
                    maxRect[0][0] = region[0][0] // eslint-disable-line
                    maxRect[0][1] = region[0][1] // eslint-disable-line
                    break

                case 's':
                    matrix[1][2] = 1.0

                    point = [
                        region[0][0] + (getWidth(region) / 2),
                        region[1][1]
                    ]
                    maxRect[0][1] = region[0][1] // eslint-disable-line

                    if (ratio !== 0.0) {
                        matrix[1][1] = ratio / 2.0
                        matrix[1][3] = -ratio / 2.0

                        distanceToEdge = Math.min(
                            point[0],
                            maxRect[1][0] - point[0]
                        )
                        maxRect[0][0] = point[0] - distanceToEdge
                        maxRect[1][0] = point[0] + distanceToEdge
                    }
                    break

                case 'sw':
                    matrix[0][3] = 1.0
                    matrix[1][2] = 1.0
                    if (ratio !== 0.0) {
                        matrix[1][2] = 0.0
                        matrix[0][2] = -1 / ratio
                    }

                    point = [region[0][0], region[1][1]]
                    maxRect[1][0] = region[1][0] // eslint-disable-line
                    maxRect[0][1] = region[0][1] // eslint-disable-line
                    break

                case 'w':
                    matrix[0][3] = 1.0

                    point = [
                        region[0][0],
                        region[0][1] + (getHeight(region) / 2)
                    ]
                    maxRect[1][0] = region[1][0] // eslint-disable-line

                    if (ratio !== 0.0) {
                        matrix[0][0] = (1 / ratio) / 2.0
                        matrix[0][2] = (-1 / ratio) / 2.0

                        distanceToEdge = Math.min(
                            point[1],
                            maxRect[1][1] - point[1]
                        )
                        maxRect[0][1] = point[1] - distanceToEdge
                        maxRect[1][1] = point[1] + distanceToEdge
                    }
                    break

                case 'nw':
                    matrix[0][3] = 1.0
                    matrix[1][0] = 1.0
                    if (ratio !== 0.0) {
                        matrix[1][0] = 0.0
                        matrix[0][0] = 1 / ratio
                    }

                    point = [region[0][0], region[0][1]]
                    maxRect[1][0] = region[1][0] // eslint-disable-line
                    maxRect[1][1] = region[1][1] // eslint-disable-line
                    break

                // No default

                }

                if (ratio !== 0.0) {
                    // If an aspect ratio is specified then we need to adjust
                    // the max rectangle to match the maximum rectangle of the
                    // given aspect ratio.

                    let width = getWidth(maxRect)
                    let height = getWidth(maxRect) / ratio

                    if (ratio < width / getHeight(maxRect)) {
                        width = getHeight(maxRect) * ratio
                        height = getHeight(maxRect)
                    }

                    const center = [
                        region[0][0] + (getWidth(region) / 2.0),
                        region[0][1] + (getHeight(region) / 2.0)
                    ]

                    switch (anchor) {

                    case 'n':
                        maxRect[0][0] = center[0] - (width / 2)
                        maxRect[1][0] = center[0] + (width / 2)
                        maxRect[0][1] = maxRect[1][1] - height
                        break

                    case 'ne':
                        maxRect[1][0] = maxRect[0][0] + width
                        maxRect[0][1] = maxRect[1][1] - height
                        break

                    case 'e':
                        maxRect[0][1] = center[1] - (height / 2)
                        maxRect[1][1] = center[1] + (height / 2)
                        maxRect[1][0] = maxRect[0][0] + width
                        break

                    case 'se':
                        maxRect[1][0] = maxRect[0][0] + width
                        maxRect[1][1] = maxRect[0][1] - height
                        break

                    case 's':
                        maxRect[0][0] = center[0] - (width / 2)
                        maxRect[1][0] = center[0] + (width / 2)
                        maxRect[1][1] = maxRect[0][1] + height
                        break

                    case 'sw':
                        maxRect[0][0] = maxRect[1][0] - width
                        maxRect[1][1] = maxRect[0][1] + height
                        break

                    case 'w':
                        maxRect[0][1] = center[1] - (height / 2)
                        maxRect[1][1] = center[1] + (height / 2)
                        maxRect[0][0] = maxRect[1][0] - width
                        break

                    case 'nw':
                        maxRect[0][0] = maxRect[1][0] - width
                        maxRect[0][1] = maxRect[1][1] - height
                        break

                    // No default

                    }
                }

                this._resize = {
                    'extents': getExtents([point, point], maxRect),
                    matrix,
                    'origin': getEventPos(event),
                    region
                }

                // Flag the tool as being resized in the CSS
                this._dom.tool.classList.add(cls.css['resizing'])
            }
        }
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

    get crop() {
        return [
            [
                this.region[0][0] / getWidth(this.bounds),
                this.region[0][1] / getHeight(this.bounds)
            ], [
                this.region[1][0] / getWidth(this.bounds),
                this.region[1][1] / getHeight(this.bounds)
            ]
        ]
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

        // Flag the crop tool as visible/hidden in the CSS
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
        if (this._dom.tool !== null) {

            // Remove event listeners
            $.ignore(
                document,
                {
                    'mousemove touchmove': this._handlers.drag,
                    'mouseout mouseup touchend': this._handlers.endDrag
                }
            )

            $.ignore(
                document,
                {
                    'mousemove touchmove': this._handlers.resize,
                    'mouseout mouseup touchend': this._handlers.endResize
                }
            )

            // Remove the area, region, frame, image and controls
            this._dom.container.removeChild(this._dom.tool)
            this._dom.controls = null
            this._dom.frame = null
            this._dom.image = null
        }
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
                    'data-control': ctrl
                }
            )
            this._dom.region.appendChild(ctrlElm)
        }

        // Add the crop tool to the container
        this._dom.container.appendChild(this._dom.tool)

        // Set up event listeners
        $.listen(
            this._dom.region,
            {'mousedown touchstart': this._handlers.startDrag}
        )

        $.listen(
            this._dom.region,
            {'mousedown touchstart': this._handlers.startResize}
        )

        $.listen(
            document,
            {
                'mousemove touchmove': this._handlers.drag,
                'mouseout mouseup touchend': this._handlers.endDrag
            }
        )

        $.listen(
            document,
            {
                'mousemove touchmove': this._handlers.resize,
                'mouseout mouseup touchend': this._handlers.endResize
            }
        )
    }

    /**
     * Set the orientation and crop region.
     */
    set(orientation, cropRegion) {

        // Set the orientation
        this._orientation = orientation

        // Set the region
        if (cropRegion) {
            let width = getWidth(this.bounds)
            let height = getHeight(this.bounds)
            this.region = [
                [cropRegion[0][0] * width, cropRegion[0][1] * height],
                [cropRegion[1][0] * width, cropRegion[1][1] * height]
            ]
        } else {
            this.reset()
        }
    }

    /**
     * Reset the crop region (select a crop that is central to the image).
     */
    reset() {

        // Set the initial crop to match any given fixed aspect ratio (or
        // default to a square crop 1:1).
        let aspectRatio = this._initialAspectRatio

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

        // Ceil the values to prevent fractions causing jerking when dragging
        // or resizing.
        bkgX = Math.ceil(bkgX)
        bkgY = Math.ceil(bkgY)

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
