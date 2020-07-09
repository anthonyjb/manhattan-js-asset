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
        baseVersion,
        labels,
        imageURLs,
        ownImages
    ) {
        // A list of versions the image set supports
        this._versions = versions

        // The base version of the image set (different buttons are presented
        // for the base version.
        this._baseVersion = baseVersion

        // A map of labels for each version of the image set
        this._labels = labels

        // A map of image URLs for each version of the image set
        this._imageURLs = imageURLs

        // A map of flags (booleans) for each version indicating if they are
        // using their own image ()true or the base image (false).
        this._ownImages = ownImages

        // The current version of the image set being viewed
        this._version = null

        // Domain for related DOM elements
        this._dom = {
            'container': null,
            'image': null,
            'versions': null,
            'viewer': null
        }

        // Store a reference to the container element
        this._dom.container = container

        // Event handlers
        this._handlers = {

            /**
             * Close the version select.
             */
            'closeVersionSelect': (ev) => {
                const cls = this.constructor
                const openCSS = cls.css['versionsOpen']

                // Ignore this event if the version select is closed
                if (this._dom.versions.classList.contains(openCSS)) {

                    // Ignore this event if the user select a version
                    const versionElm = $.closest(
                        ev.target,
                        `.${cls.css['version']}`
                    )
                    if (!versionElm) {
                        this._dom.versions.classList.remove(openCSS)
                    }
                }
            },

            /**
             * Handle the version select interactions.
             */
            'versionSelect': (ev) => {
                const cls = this.constructor
                const openCSS = cls.css['versionsOpen']

                if (this._dom.versions.classList.contains(openCSS)) {

                    // Close version select
                    this._dom.versions.classList.remove(openCSS)

                    // Switch to the selected version (if changed)
                    const versionElm = $.closest(
                        ev.target,
                        `.${cls.css['version']}`
                    )
                    if (versionElm) {
                        const {version} = versionElm.dataset
                        if (version !== this.version) {
                            this.version = version
                        }
                    }

                } else {
                    // Open version select
                    this._dom.versions.classList.add(openCSS)
                }
            }

        }
    }

    // -- Getters & Setters --

    get version() {
        return this._version
    }

    set version(version) {
        this._version = version
        this._update()
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
            $.ignore(document, {'mousedown': this._handlers.closeVersionSelect})
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
        this.viewer.appendChild(this._dom.image)

        // Create the version selector
        this._dom.versions = $.create('div', {'class': cls.css['versions']})

        for (const version of this._versions) {
            const versionElm = $.create(
                'div',
                {
                    'class': cls.css['version'],
                    'data-version': version
                }
            )
            versionElm.textContent = this._labels[version]
            this._dom.versions.appendChild(versionElm)
        }

        // Handle events for versions
        $.listen(this._dom.versions, {'click': this._handlers.versionSelect})
        $.listen(document, {'mousedown': this._handlers.closeVersionSelect})

        this.viewer.appendChild(this._dom.versions)

        // Create buttons

        // Set alt tag
        const altElm = createIconButton(
            this.viewer,
            cls.css['alt'],
            'alt',
            cls.tooltips['alt']
        )
        this.viewer.appendChild(altElm)

        // Remove image set
        const removeElm = createIconButton(
            this.viewer,
            cls.css['remove'],
            'remove',
            cls.tooltips['remove']
        )
        this.viewer.appendChild(removeElm)

        // Add an element bar for version specific buttons
        const buttonsElm = $.create('div', {'class': cls.css['versionButtons']})
        this.viewer.appendChild(buttonsElm)

        // Edit version
        const editElm = createIconButton(
            this.viewer,
            cls.css['edit'],
            'edit',
            cls.tooltips['edit']
        )
        buttonsElm.appendChild(editElm)

        // Upload version
        const uploadElm = createIconButton(
            this.viewer,
            cls.css['upload'],
            'upload',
            cls.tooltips['upload']
        )
        buttonsElm.appendChild(uploadElm)

        // Clear version
        const clearElm = createIconButton(
            this.viewer,
            cls.css['clear'],
            'clear',
            cls.tooltips['clear']
        )
        buttonsElm.appendChild(clearElm)

        // Initially show theme base version for the image set
        this.version = this._baseVersion

        // Add the viewer element to the container
        this._dom.container.appendChild(this.viewer)
    }

    /**
     * Set the image URL for a version in the viewer.
     */
    setImageURL(version, imageURL) {
        this._imageURLs[version] = imageURL
        this._update()
    }

    /**
     * Set the own image flag for a version in the viewer.
     */
    setOwnImage(version, ownImage) {
        this._ownImages[version] = ownImage
        this._update()
    }

    // -- Private methods --

    /**
     * Update the viewer UI based on the current version.
     */
    _update() {
        const cls = this.constructor

        // Switch the image displayed
        const imageURL = this._imageURLs[this._version]
        this._dom.image.style.backgroundImage = `url('${imageURL}')`

        // Flag if the base version is being displayed
        const baseCSS = cls.css['viewerBase']
        const ownImageCSS = cls.css['viewerOwnImage']

        if (this._version === this._baseVersion) {
            this.viewer.classList.add(baseCSS)
            this.viewer.classList.remove(ownImageCSS)

        } else {
            this.viewer.classList.remove(baseCSS)

            // Flag if the version being viewed has it's own image
            if (this._ownImages[this._version]) {
                this.viewer.classList.add(ownImageCSS)
            } else {
                this.viewer.classList.remove(ownImageCSS)
            }

        }

        // Select the relevant version in the selector
        const selectedCSS = cls.css['versionSelected']
        for (const versionElm of [...this._dom.versions.children]) {
            if (versionElm.dataset.version === this._version) {
                versionElm.classList.add(selectedCSS)
            } else {
                versionElm.classList.remove(selectedCSS)
            }
        }
    }
}


// -- Tooltips --

ImageSetViewer.tooltips = {
    'alt': 'Set alt text for image set',
    'clear': 'Clear image for version (revert to base)',
    'edit': 'Edit image',
    'remove': 'Remove image set',
    'upload': 'Upload a new image for the version'
}


// -- CSS classes --

ImageSetViewer.css = {

    /**
     * Applied to image component within the viewer.
     */
    'image': 'mh-image-set-viewer__image',

    /**
     * Applied to each version (item) in the version selector.
     */
    'version': 'mh-image-set-viewer__version',

    /**
     * Applied to the version (item) currently selected.
     */
    'versionSelected': 'mh-image-set-viewer__version--selected',

    /**
     * Applied to the contain element for version specific buttons (edit,
     * upload and clear version).
     */
    'versionButtons': 'mh-image-set-viewer__version-buttons',

    /**
     * Applied to the version selector.
     */
    'versions': 'mh-image-set-viewer__versions',

    /**
     * Applied to the version selector when open.
     */
    'versionsOpen': 'mh-image-set-viewer__versions--open',

    /**
     * Applied to the image viewer.
     */
    'viewer': 'mh-image-set-viewer',

    /**
     * Applied to the image viewer when the base version is being displayed.
     */
    'viewerBase': 'mh-image-set-viewer--base',

    /**
     * Applied to the image viewer when the version being displayed has its
     * own image.
     */
    'viewerOwnImage': 'mh-image-set-viewer--own-image',

    // -- Buttons --

    /**
     * Applied to the alt tag button within the viewer.
     */
    'alt': 'mh-image-set-viewer__alt',

    /**
     * Applied to the clear version button within the viewer.
     */
    'clear': 'mh-image-set-viewer__clear',

    /**
     * Applied to the edit version button within the viewer.
     */
    'edit': 'mh-image-set-viewer__edit',

    /**
     * Applied to the remove button within the viewer.
     */
    'remove': 'mh-image-set-viewer__remove',

    /**
     * Applied to the upload version button within the viewer.
     */
    'upload': 'mh-image-set-viewer__upload'

}

// @@
//
// - Support image uploading button
//
