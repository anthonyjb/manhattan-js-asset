import * as $ from 'manhattan-essentials'


// -- Utils --

/**
 * Shortcut for creating an icon button within a viewer.
 */
function createIconButton(viewerElm, css, eventType, tooltip='') {
    const buttonElm = $.create(
        'div',
        {
            'class': css,
            'title': tooltip
        }
    )
    $.listen(
        buttonElm,
        {
            'click': (event) => {
                event.preventDefault()
                if (event.buttons === 0) {
                    $.dispatch(viewerElm, eventType)
                }
            }
        }
    )
    return buttonElm
}


// -- Class definition --

/**
 * File viewer UI component for form fields.
 */
export class FileViewer {

    constructor(
        container,
        filename,
        fileSize,
        buttons={
            'download': true,
            'metadata': true,
            'remove': true
        }
    ) {

        // The file's filename
        this._filename = filename

        // The size of the file (in bytes)
        this._fileSize = fileSize

        // A set of flags which indicate which buttons should be displayed in
        // the viewer.
        this._buttons = buttons

        // Domain for related DOM elements
        this._dom = {
            'container': null,
            'handle': null,
            'viewer': null
        }

        // Store a reference to the container element
        this._dom.container = container
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

        // Remove the viewer element
        if (this.viewer !== null) {
            this.viewer.parentNode.removeChild(this.viewer)
        }

        // Clear DOM element references
        this._dom.container = null
        this._dom.viewer = null
    }

    /**
     * Initialize the file viewer.
     */
    init() {
        const cls = this.constructor

        // Create the viewer element
        this._dom.viewer = $.create('div', {'class': cls.css['viewer']})

        // Create the file info element
        const infoElm = $.create('div', {'class': cls.css['info']})
        this.viewer.appendChild(infoElm)

        const filenameElm = $.create('div', {'class': cls.css['filename']})
        filenameElm.textContent = this._filename
        infoElm.appendChild(filenameElm)

        const fileSizeElm = $.create('div', {'class': cls.css['fileSize']})
        fileSizeElm.textContent = this._fileSize
        infoElm.appendChild(fileSizeElm)

        // Create the handle
        const handleElm = $.create('div', {'class': cls.css['handle']})
        this.viewer.appendChild(handleElm)

        // Create the buttons
        const buttonsElm = $.create('div', {'class': cls.css['buttons']})
        for (let button of ['download', 'metadata', 'remove']) {
            if (this._buttons[button]) {
                let buttonElm = createIconButton(
                    this.viewer,
                    cls.css[button],
                    button,
                    cls.tooltips[button]
                )
                buttonsElm.appendChild(buttonElm)
            }
        }

        // If there are buttons add the buttons element to the viewer
        if (buttonsElm.children.length > 0) {
            this.viewer.appendChild(buttonsElm)
        }

        // Add the viewer element to the container
        this._dom.container.appendChild(this.viewer)
    }
}

// -- Tooltips --

FileViewer.tooltips = {
    'download': 'Download',
    'metadata': 'Metadata',
    'remove': 'Remove'
}


// -- CSS classes --

FileViewer.css = {

    /**
     * Applied to the buttons component within the viewer.
     */
    'buttons': 'mh-file-viewer__buttons',

    /**
     * Applied to the download button within the buttons component.
     */
    'download': 'mh-file-viewer__download',

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
     * Applied to the handle element which is used to enable drag/sort when
     * the viewer is displayed within a gallery item.
     */
    'handle': 'mh-file-viewer__handle',

    /**
     * Applied to the file information component within the viewer.
     */
    'info': 'mh-file-viewer__info',

    /**
     * Applied to the metadata button within the buttons component.
     */
    'metadata': 'mh-file-viewer__metadata',

    /**
     * Applied to the remove button within the buttons component.
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

    constructor(
        container,
        imageURL,
        buttons={
            'download': true,
            'edit': true,
            'metadata': true,
            'remove': true
        }
    ) {

        // The image to view
        this._imageURL = imageURL

        // A set of flags which indicate which buttons should be displayed in
        // the viewer.
        this._buttons = buttons

        // Domain for related DOM elements
        this._dom = {
            'container': null,
            'image': null,
            'viewer': null
        }

        // Store a reference to the container element
        this._dom.container = container
    }

    // -- Getters & Setters --

    get imageURL() {
        return this._imageURL
    }

    set imageURL(value) {
        this._imageURL = value
        if (this._dom.image) {
            this._dom.image.style.backgroundImage = `url('${this._imageURL}')`
        }
    }

    get viewer() {
        return this._dom.viewer
    }

    // -- Public methods --

    /**
     * Remove the image viewer.
     */
    destroy() {

        // Remove the viewer element
        if (this.viewer !== null) {
            this.viewer.parentNode.removeChild(this.viewer)
        }

        // Clear DOM element references
        this._dom.container = null
        this._dom.viewer = null
    }

    /**
     * Initialize the image viewer.
     */
    init() {
        const cls = this.constructor

        // Create the viewer element
        this._dom.viewer = $.create('div', {'class': cls.css['viewer']})

        // Create the image element
        this._dom.image = $.create('div', {'class': cls.css['image']})
        this._dom.image.style.backgroundImage = `url('${this._imageURL}')`
        this.viewer.appendChild(this._dom.image)

        // Create the handle
        const handleElm = $.create('div', {'class': cls.css['handle']})
        this.viewer.appendChild(handleElm)

        // Create the buttons
        const buttonsElm = $.create('div', {'class': cls.css['buttons']})
        for (let button of ['download', 'edit', 'metadata', 'remove']) {
            if (this._buttons[button]) {
                let buttonElm = createIconButton(
                    this.viewer,
                    cls.css[button],
                    button,
                    cls.tooltips[button]
                )
                buttonsElm.appendChild(buttonElm)
            }
        }

        // If there are buttons add the buttons element to the viewer
        if (buttonsElm.children.length > 0) {
            this.viewer.appendChild(buttonsElm)
        }

        // Add the viewer element to the container
        this._dom.container.appendChild(this.viewer)
    }
}


// -- Tooltips --

ImageViewer.tooltips = {
    'edit': 'Edit',
    'download': 'Download',
    'metadata': 'Metadata',
    'remove': 'Remove'
}


// -- CSS classes --

ImageViewer.css = {

    /**
     * Applied to the buttons component within the viewer.
     */
    'buttons': 'mh-image-viewer__buttons',

    /**
     * Applied to the download button within the viewer.
     */
    'download': 'mh-image-viewer__download',

    /**
     * Applied to the edit button within the viewer.
     */
    'edit': 'mh-image-viewer__edit',

    /**
     * Applied to the handle element which is used to enable drag/sort when
     * the viewer is displayed within a gallery item.
     */
    'handle': 'mh-image-viewer__handle',

    /**
     * Applied to image component within the viewer.
     */
    'image': 'mh-image-viewer__image',

    /**
     * Applied to the properties button within the viewer.
     */
    'metadata': 'mh-image-viewer__metadata',

    /**
     * Applied to the remove button within the viewer.
     */
    'remove': 'mh-image-viewer__remove',

    /**
     * Applied to the image viewer.
     */
    'viewer': 'mh-image-viewer'

}


/**
 * Image viewer UI component for image sets.
 */
export class ImageSetViewer {

    constructor(
        container,
        versions,
        labels,
        imageURLs,
        baseVersion,
        buttons={}
    ) {
        // A list of versions the image set supports
        this._versions = versions

        // A map of image URLs for each version of the image set
        this._imageURLs = imageURLs

        // A map of labels for each version of the image set
        this._labels = labels

        // The base version of the image set (different buttons are presented
        // for the base version.
        this._baseVersion = baseVersion

        // A set of flags which indicate which buttons should be displayed in
        // the viewer.
        this._buttons = buttons

        // The current version of the image set being viewed
        this._version = null

        // Domain for related DOM elements
        this._dom = {
            'container': null,
            'image': null,
            'viewer': null
        }

        // Store a reference to the container element
        this._dom.container = container
    }

    // -- Getters & Setters --

    get version() {
        return this._version
    }

    set version(version) {
        this._version = version
        const imageURL = this._imageURLs[version]
        this._dom.image.style.backgroundImage = `url('${imageURL}')`
    }

    get viewer() {
        return this._dom.viewer
    }

    // -- Public methods --

    /**
     * Remove the image viewer.
     */
    destroy() {
        console.log(this, 'destroy')
    }

    /**
     * Initialize the image viewer.
     */
    init() {
        const cls = this.constructor

        // Create the viewer element
        this._dom.viewer = $.create('div', {'class': cls.css['viewer']})

        // Create the image element
        this._dom.image = $.create('div', {'class': cls.css['image']})
        this.viewer.appendChild(this._dom.image)

        // @@ Create the version selector

        // @@ START HERE

        // Initially show the base version for the image set
        this.version = this._baseVersion

        // Add the viewer element to the container
        this._dom.container.appendChild(this.viewer)
    }
}


// -- Tooltips --

ImageSetViewer.tooltips = {}


// -- CSS classes --

ImageSetViewer.css = {

    /**
     * Applied to image component within the viewer.
     */
    'image': 'mh-image-set-viewer__image',

    /**
     * Applied to the image viewer.
     */
    'viewer': 'mh-image-set-viewer'
}

// @@
//
// - Ability to set the version
// - Ability to update the image URL for a version
// - Ability to hide the view when uploading (but not remove it)
// - Ability to show an acceptor within the viewer
// - Button support
//     - Alt tag
//     - Clear image set
//     - Download
//     - Edit
//     - Metadata
//     - Edit
//     - Clear version
//     - Upload version


