import * as $ from 'manhattan-essentials'

import {Acceptor} from './ui/acceptor.js'
import {ErrorMessage} from './ui/error-message.js'
import {ImageEditor} from './ui/image-editor.js'
import {Metadata} from './ui/metadata.js'
import {Uploader} from './ui/uploader.js'
import {FileViewer, ImageViewer} from './ui/viewers.js'


// -- Errors --

class ResponseError extends Error {

}


// Utils

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
    return `${size} ${units[unit]}`
}


// -- Class definition --

/**
 * An file field UI component.
 */
export class FileField {

    constructor(input, options={}, prefix='data-mh-file-field--') {

        // Configure the options
        this._options = {}

        $.config(
            this._options,
            {

                /**
                 * A comma separated list of file types that are accepted.
                 */
                'accept': '',

                /**
                 * If true then the field will support users dropping files on
                 * to the acceptor to upload them.
                 */
                'allowDrop': false,

                /**
                 * If true then a download button will be displayed in the
                 * viewer component.
                 */
                'allowDownload': false,

                /**
                 * If true then an edit button will be displayed in the
                 * viewer component.
                 */
                'allowEdit': false,

                /**
                 * The label displayed when the field is not populated and the
                 * user is dragging a file over the page.
                 */
                'dropLabel': 'Drop file here',

                /**
                 * The type of file that the field will accept, can be either
                 * 'file' or 'image'. The type does not validate the or
                 * enforce the types of files that can be accepted, instead it
                 * provides a hint to the class about how to configure itself
                 * best for the expected type of file.
                 */
                'fileType': 'file',

                /**
                 * The label displayed when the field is not populated.
                 */
                'label': 'Select a file...',

                /**
                 * If true then no remove button will be displayed in the
                 * viewer component.
                 */
                'preventRemove': false,

                /**
                 * The image variation to display as the preview in the
                 * viewer (if applicable).
                 */
                'preview': 'preview',

                /**
                 * The URL that any file will be uploaded to.
                 */
                'uploadUrl': '/upload'
            },
            options,
            input,
            prefix
        )

        // Configure the behaviours
        this._behaviours = {}

        $.config(
            this._behaviours,
            {
                'acceptor': 'default',
                'asset': 'default',
                'assetProp': 'default',
                'formData': 'minimal',
                'metadata': 'default',
                'uploader': 'default',
                'viewer': 'default'
            },
            options,
            input,
            prefix
        )

        // The current asset
        this._asset = null

        // The state of the field (initializing, accepting, uploading,
        // viewing).
        this._state = 'initializing'

        // Handles to the state components
        this._acceptor = null
        this._uploader = null
        this._viewer = null

        // Handle to the error message component
        this._error = null

        // Domain for related DOM elements
        this._dom = {
            'input': null,
            'field': null
        }

        // Store a reference to the input element
        this._dom.input = input

        // Set up event handlers
        this._handlers = {}
    }

    // -- Getters & Setters --

    get asset() {
        return Object.assign(this._asset, {})
    }

    get field() {
        return this._dom.field
    }

    get input() {
        return this._dom.input
    }

    get state() {
        return this._state
    }

    // -- Public methods --

    /**
     * Clear any error from the field.
     */
    clearError() {
        if (this._error) {
            this._error.destroy()

            // Clear the error CSS modifier from the field
            this.field.classList.remove(this.constructor.css['hasError'])
        }
    }

    /**
     * Clear the field (transition to the accepting state).
     */
    clear() {
        const cls = this.constructor

        // Clear the current state component
        this._destroyStateComponent()

        // Clear the asset input value
        this._asset = null
        this.input.value = ''

        // Set up the acceptor
        const behaviour = this._behaviours.acceptor
        this._acceptor = cls.behaviours.acceptor[behaviour](this)
        this._acceptor.init()

        // Set up event handlers for the acceptor
        $.listen(
            this._acceptor.acceptor,
            {
                'accepted': (event) => {
                    this.upload(event.files[0])
                }
            }
        )

        // Set the new state
        this._state = 'accepting'
    }

    /**
     * @@ Remove the file field.
     */
    destroy() {
        return this.todo
    }

    /**
     * Return the value of the named property from the asset.
     */
    getAssetProp(name) {
        const behaviours = this.constructor.behaviours.assetProp
        const behaviour = this._behaviours.assetProp
        return behaviours[behaviour](this, 'get', name)
    }

    /**
     * Initialize the file field.
     */
    init() {
        const cls = this.constructor

        // Create the field element
        this._dom.field = $.create(
            'div',
            {
                'class': [
                    cls.css['field'],
                    cls.css.types[this._options.fileType]
                ].join(' ')
            }
        )
        this.input.parentNode.insertBefore(
            this._dom.field,
            this.input.nextSibling
        )

        if (this.input.value) {
            this.populate(this.input.value)

        } else {
            this.clear()
        }

        if (this._options.fileType === 'image') {
            const imageEditor = new ImageEditor('../images/example.jpg')
            imageEditor.init()
            imageEditor.show()
        }
    }

    /**
     * Populate the file field (transition to the viewing state).
     */
    populate(asset) {
        const cls = this.constructor

        // Clear the current state component
        this._destroyStateComponent()

        // Update the asset and input value
        this._asset = asset
        this.input.value = JSON.stringify(asset)

        // Set up the viewer
        const behaviour = this._behaviours.viewer
        this._viewer = cls.behaviours.viewer[behaviour](this)
        this._viewer.init()

        // Set up event handlers for the viewer
        $.listen(
            this._viewer.viewer,
            {
                'download': () => {
                    // Build a link to trigger a file download
                    const a = $.create(
                        'a',
                        {
                            'download': '',
                            'href': this.getAssetProp('downloadURL'),
                            'target': '_blank'
                        }
                    )
                    a.click()
                },

                'edit': () => {
                    const imageEditor = new ImageEditor()
                    imageEditor.init()
                    imageEditor.show()

                    $.listen(
                        imageEditor.overlay,
                        {
                            'cancel': () => {
                                imageEditor.hide()
                            },
                            'hidden': () => {
                                imageEditor.destroy()
                            }
                        }
                    )
                },

                'metadata': () => {
                    const behaviour = this._behaviours.metadata
                    const metadata = cls.behaviours.metadata[behaviour](this)
                    metadata.init()
                    metadata.show()

                    $.listen(
                        metadata.overlay,
                        {
                            'okay': () => {
                                // Apply any metadata changes
                                const behaviour = this._behaviours.assetProp
                                const assetProp = cls.behaviours
                                    .assetProp[behaviour]

                                const props = metadata.props

                                for (let key in props) {
                                    assetProp(this, 'set',key, props[key])
                                }

                                // Hide the medata overlay
                                metadata.hide()
                            },
                            'cancel': () => {
                                metadata.hide()
                            },
                            'hidden': () => {
                                metadata.destroy()
                            }
                        }
                    )
                },

                'remove': () => {
                    // Clear the asset from the file
                    this.clear()
                }
            }
        )

        // Set the new state
        this._state = 'viewing'
    }

    /**
     * Post an error against the field.
     */
    postError(message) {
        // Clear any existing error
        this.clearError()

        // Post an error against the field
        this._error = new ErrorMessage(this.field)
        this._error.init(message)

        // Add the error CSS modifier to the field
        this.field.classList.add(this.constructor.css['hasError'])
    }

    /**
     * Set the value of the named property from the asset.
     */
    setAssetProp(name, value) {
        const behaviours = this.constructor.behaviours.assetProp
        const behaviour = this._behaviours.assetProp
        return behaviours[behaviour](this, 'set', name, value)
    }

    /**
     * Upload a file (transition to the uploading state).
     */
    upload(file) {
        const cls = this.constructor

        // Clear the current state component
        this._destroyStateComponent()

        // Build the form data
        const formData = cls.behaviours.formData[this._behaviours.formData](
            this,
            file
        )

        // Set up the uploader
        this._uploader = cls.behaviours.uploader[this._behaviours.uploader](
            this,
            this._options.uploadUrl,
            formData
        )
        this._uploader.init()

        // Set up event handlers for the uploader
        $.listen(
            this._uploader.uploader,
            {
                'aborted error': () => {
                    this.clear()
                },

                'uploaded': (event) => {
                    try {
                        // Extract the asset from the response
                        const behaviour = this._behaviours.asset
                        const asset = cls.behaviours.asset[behaviour](
                            this,
                            event.response
                        )

                        // Populate the field
                        this.populate(asset)
                    } catch (error) {
                        if (error instanceof ResponseError) {
                            // Clear the field
                            this.clear()

                            // Display the upload error
                            this.postError(error.message)

                        } else {

                            // Re-through any JS error
                            throw error
                        }
                    }
                }
            }
        )

        // Set the new state
        this._state = 'uploading'
    }

    // -- Private  methods --

    /**
     * Destroy the component for the current state (acceptor, uploader or
     * viewer).
     */
    _destroyStateComponent() {

        // Clear any error
        this.clearError()

        // Clear the state component
        switch (this.state) {

        case 'accepting':
            this._acceptor.destroy()
            break

        case 'uploading':
            this._uploader.destroy()
            break

        case 'viewing':
            this._viewer.destroy()
            break

        // no default

        }
    }
}


// -- Behaviours --

FileField.behaviours = {

    /**
     * The `acceptor` behaviour is used to create a file acceptor UI component
     * for the field.
     */
    'acceptor': {

        /**
         * Return an acceptor configured using the field options.
         */
        'default': (inst) => {
            return new Acceptor(
                inst.field,
                `${inst.input.name}__acceptor`,
                inst._options.label,
                inst._options.dropLabel,
                inst._options.allowDrop,
                inst._options.accept,
                false
            )
        }
    },

    /**
     * The `asset` behaviour is used to extract/build asset information from a
     * response (e.g the payload returned when uploading/transforming a
     * file/asset).
     */
    'asset': {

        /**
         * Return the asset value from the payload;
         *
         * - if payload contains 'asset' return that,
         * - if payload contains 'assets' return `assets[0]`,
         * - if payload does not contain either the 'asset' or 'assets' key ,
         *   then raise an error;
         *    - if the payload contains a 'reason' key the error is raised
         *      with this as the message,
         *    - if no reason is provided then we provide a default message for
         *      the error.
         *
         */
        'default': (inst, response) => {
            const {payload} = JSON.parse(response)

            // Attempt to extract the asset
            if (payload.asset) {
                return payload.asset
            } else if (payload.assets) {
                return payload.assets[0]
            }

            // Check for an reason there's no asset
            if (payload.reason) {
                throw new ResponseError(payload.reason)
            }

            throw new ResponseError('Unable to accept this file')
        }

    },

    /**
     * The `assetProp` behaviour is used to provide an interface/mapping for
     * property names and their values against the asset.
     *
     * As a minimum the following list of properties must be supported:
     *
     * - alt (get, set)
     * - contentType (get)
     * - downloadURL (get)
     * - filename (get)
     * - fileLength (get)
     * - imageMode (get)
     * - imageSize (get)
     * - previewURL (get)
     * - type (get)
     *
     */
    'assetProp': {

        /**
         * Provide the default behaviour for properties against the asset
         * (based on manhattan assets).
         */
        'default': (inst, action, name, value) => {

            switch (name) {

            case 'alt':
                if (action === 'set') {
                    inst._asset['user_meta']['alt'] = value
                    return value
                }
                return inst._asset['user_meta']['alt'] || ''
                break

            case 'contentType':
                return inst._asset['content_type']
                break

            case 'downloadURL':
                return inst._asset['url']
                break

            case 'filename':
                return inst._asset['filename']
                break

            case 'fileLength':
                return formatBytes(inst._asset['core_meta']['length'])
                break

            case 'imageMode':
                return inst._asset['core_meta']['image']['mode']
                break

            case 'imageSize':
                return inst._asset['core_meta']['image']['size'].join(' x ')
                break

            case 'previewURL':
                return inst._asset['variations'][inst._options.preview].url
                break

            // no default

            }

            return ''
        }

    },

    /**
     * The `formData` behaviour is used to create a `FormData` instance that
     * contains the file to be uploaded and any other parameters required, for
     * example a CSRF token.
     */
    'formData': {

        /**
         * Return the minimal form data required to upload a file.
         */
        'minimal': (inst, file) => {
            const formData = new FormData()
            formData.append('file', file)
            return formData
        }

    },

    /**
     * The `metadata` behaviour is used to create a metadata UI overlay which
     * allows users to view and modify metadata for the file.
     */
    'metadata': {

        /**
         * Return the default metadata configuration.
         */
        'default': (inst) => {

            const getProp = (prop) => {
                return inst.getAssetProp(prop)
            }

            // Build the props for the metadata
            const props = [
                ['Filename', 'filename', getProp('filename'), true],
                ['Content type', 'contentType', getProp('contentType'), true],
                ['File size', 'fileLength', getProp('fileLength'), true]
            ]

            if (inst._options.fileType) {
                props.push(['Mode', 'imageMode', getProp('imageMode'), true])
                props.push(['Size', 'imageSize', getProp('imageSize'), true])
                props.push(['Alt', 'alt', inst.getAssetProp('alt'), false])
            }

            return new Metadata(props)
        }
    },

    /**
     * The `uploader` behaviour is used to create a file uploader UI component
     * for the field.
     */
    'uploader': {

        /**
         * Return the default uploader configuration.
         */
        'default': (inst, endpoint, formData) => {
            return new Uploader(inst.field, endpoint, formData)
        }
    },

    /**
     * The `viewer` behaviour is used to create a file viewer UI component for
     * the field.
     */
    'viewer': {

        /**
         * Return the default uploader configuration.
         */
        'default': (inst) => {
            let viewer = null

            switch (inst._options.fileType) {

            case 'file':
                viewer = new FileViewer(
                    inst.field,
                    inst.getAssetProp('filename'),
                    inst.getAssetProp('fileLength')
                )
                break

            case 'image':
                viewer = new ImageViewer(
                    inst.field,
                    inst.getAssetProp('previewURL')
                )
                break

            // no default

            }

            return viewer
        }
    }
}


// -- CSS classes --

FileField.css = {

    /**
     * Applied to the field element.
     */
    'field': 'mh-file-field',

    /**
     * Applied to the field when it contains an error.
     */
    'hasError': 'mh-file-field--has-error',

    /**
     * A subset of CSS classes used to indicate the type of file the field is
     * expected to accept.
     */
    'types': {

        /**
         * Applied to the field element when the expected file type is any
         * file.
         */
        'file': 'mh-file-field--file',

        /**
         * Applied to the field element when the expected file type is an
         * image.
         */
        'image': 'mh-file-field--image'

    }
}
