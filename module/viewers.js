import * as $ from 'manhattan-essentials'


// -- Utils --

/**
 * Format the size of a file in bytes to use common units.
 */ 
export function formatBytes(bytes) {
    if (bytes === 0) {
        return '0 bytes'
    }
    const units = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pb']
    const unit = Math.floor(Math.log(bytes) / Math.log(1024))
    const size = parseFloat((bytes / Math.pow(1024, unit)).toFixed(1))
    return  `${size} ${units[unit]}`
}


// -- Class definition --

/**
 * File viewer UI component for form fields. 
 */
export class FileViewer {

    constructor(container, filename, fileSize) {

        console.log(fileSize)

        // The file's filename
        this._filename = filename

        // The size of the file (in bytes) 
        this._fileSize = fileSize

        // Domain for related DOM elements
        this._dom = {
            'container': null,
            'info': null,
            'filename': null,
            'fileSize': null,
            'props': null,
            'remove': null,
            'viewer': null
        }

        // Store a reference to the container element
        this._dom.container = container

        // Set up event handlers
        this._handlers = {}
    }

    // -- Getters & Setters --

    get viewer() {
        return this._dom.viewer
    }

    // -- Public methods --

    /**
     * Remove the file viewer.
     */
    destroy() {

    }

    /**
     * Initialize the file viewer.
     */
    init() {
        const cls = this.constructor

        // Create the viewer element
        this._dom.viewer = $.create('div', {'class': cls.css['viewer']})

        // Create the file info element
        this._dom.info = $.create('div', {'class': cls.css['info']})
        this.viewer.appendChild(this._dom.info)

        this._dom.filename = $.create('div', {'class': cls.css['filename']})
        this._dom.filename.textContent = this._filename
        this._dom.info.appendChild(this._dom.filename)

        this._dom.fileSize = $.create('div', {'class': cls.css['fileSize']})
        this._dom.fileSize.textContent = formatBytes(this._fileSize)
        this._dom.info.appendChild(this._dom.fileSize)

        // Create the props button element
        this._dom.props = $.create('div', {'class': cls.css['props']})
        this.viewer.appendChild(this._dom.props)

        // Create the remove button element
        this._dom.remove = $.create('div', {'class': cls.css['remove']})
        this.viewer.appendChild(this._dom.remove)
        
        // Add the viewer element to the container
        this._dom.container.appendChild(this.viewer)
    }
}


// -- CSS classes --

FileViewer.css = {

    /**
     * Applied to the element that displays the file's filename within the 
     * information component.
     */
    'filename': 'mh-file-viewer__filename',

    /**
     * Applied to the element that displays the file's size within the 
     * information component.
     */
    'fileSize': 'mh-file-viewer__file-size',

    /**
     * Applied to the file information component within the viewer.
     */
    'info': 'mh-file-viewer__info',

    /**
     * Applied to the properties button within the viewer.
     */
    'props': 'mh-file-viewer__props',

    /**
     * Applied to the remove button within the viewer.
     */
    'remove': 'mh-file-viewer__remove',

    /**
     * Applied to the file viewer.
     */
    'viewer': 'mh-file-viewer'

}


/**
 * Image viewer UI component for form fields. 
 */
export class ImageViewer {

    constructor(container, imageURL) {

    }

    // -- Getters & Setters --

    get viewer() {
        return this._dom.viewer
    }

    // -- Public methods --

    /**
     * Remove the image viewer.
     */
    destroy() {

    }

    /**
     * Initialize the image viewer.
     */
    init() {

    }
}


// -- CSS classes --

ImageViewer.css = {

    /**
     * Applied to the image viewer.
     */
    'viewer': 'mh-image-viewer'

}
