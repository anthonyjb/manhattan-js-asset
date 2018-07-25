import * as $ from 'manhattan-essentials'

import {ResponseError} from './errors'
import {ErrorMessage} from './ui/error-message'
import {ImageEditor} from './ui/image-editor'
import * as defaultFactories from './utils/behaviours/defaults'
import * as manhattanFactories from './utils/behaviours/manhattan'
import {formatBytes} from './utils/formatting'


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
                 * The initial aspect ratio to apply to the crop region for
                 * an image.
                 */
                'cropAspectRatio': 1.0,

                /**
                 * The label displayed when the field is not populated and the
                 * user is dragging a file over the page.
                 */
                'dropLabel': 'Drop file here',

                /**
                 * The image variation to display as the preview in the
                 * image editor (if applicable).
                 */
                'editing': 'editing',

                /**
                 * The type of file that the field will accept, can be either
                 * 'file' or 'image'. The type does not validate or enforce
                 * the types of files that can be accepted, instead it
                 * provides a hint to the class about how to configure itself
                 * best for the expected type of file.
                 */
                'fileType': 'file',

                /**
                 * Flag indicating if the aspect ratio of the crop region for
                 * the image should be fixed.
                 */
                'fixCropAspectRatio': false,

                /**
                 * The label displayed when the field is not populated.
                 */
                'label': 'Select a file...',

                /**
                 * The image variation to display as the preview in the
                 * viewer (if applicable).
                 */
                'preview': 'preview',

                /**
                 * The image variation to display as the preview in the
                 * viewer (if applicable).
                 */
                'maxPreviewSize': [480, 480],

                /**
                 * The URL that any file will be uploaded to.
                 */
                'uploadUrl': '/upload'
            },
            options,
            input,
            prefix
        )

        // Convert `maxPreviewSize` option given as an attribute to a list
        if (typeof this._options.maxPreviewSize === 'string') {
            const maxPreviewSize = this._options.maxPreviewSize.split(',')
            this._options.maxPreviewSize = [
                maxPreviewSize[0],
                maxPreviewSize[1]
            ]
        }

        // Configure the behaviours
        this._behaviours = {}

        $.config(
            this._behaviours,
            {
                'acceptor': 'default',
                'asset': 'manhattan',
                'assetProp': 'manhattan',
                'formData': 'default',
                'metadata': 'manhattan',
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

        // Remove the field reference from the input
        delete this._dom.input._mhFileField
    }

    /**
     * Remove the file field.
     */
    destroy() {
        if (this._dom.field) {
            this._dom.field.parentNode.removeChild(this._dom.field)
            this._dom.field = null
        }

        // Remove the file field reference from the input
        delete this._dom.input._mhFileField
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

        // Store a reference to the file field instance against the input
        this._dom.input._mhFileField = this

        // Store a reference to the file field instance against the input
        this.input._mhFileField = this

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
            this.populate(JSON.parse(this.input.value))

        } else {
            this.clear()
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
                    const editingURL = this.getAssetProp('editingURL')
                    const imageEditor = new ImageEditor(
                        editingURL,
                        this._options.cropAspectRatio,
                        this._options.fixCropAspectRatio,
                        this._options.maxPreviewSize
                    )
                    imageEditor.init()
                    imageEditor.show()

                    $.listen(
                        imageEditor.overlay,
                        {
                            'okay': () => {
                                const {transforms} = imageEditor
                                const {previewDataURI} = imageEditor

                                previewDataURI.then((dataURI) => {

                                    // Set the preview image
                                    this._viewer.imageURL = dataURI

                                    // Set base transforms against the image
                                    this.setAssetProp(
                                        'transforms',
                                        imageEditor.transforms
                                    )

                                    imageEditor.hide()
                                })
                            },
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
                    const metaBehaviour = this._behaviours.metadata
                    const metadata = cls.behaviours
                        .metadata[metaBehaviour](this)
                    metadata.init()
                    metadata.show()

                    $.listen(
                        metadata.overlay,
                        {
                            'okay': () => {
                                // Apply any  metadata changes
                                const {props} = metadata
                                for (let key in props) {
                                    this.setAssetProp(key, props[key])
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

        // Set the asset property
        behaviours[behaviour](this, 'set', name, value)

        // Update the input value to reflect the change
        this.input.value = JSON.stringify(this._asset)

        // Trigger a change event against the input
        $.dispatch(this.input, 'change')
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
                'aborted cancelled error': () => {
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
    'acceptor': {'default': defaultFactories.acceptor('field', false)},

    /**
     * The `asset` behaviour is used to extract/build asset information from a
     * response (e.g the payload returned when uploading/transforming a
     * file/asset).
     */
    'asset': {'manhattan': manhattanFactories.asset()},

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
     * - transform (get, set)
     *
     */
    'assetProp': {
        'manhattan': manhattanFactories.assetProp(
            '_asset',
            '_options'
        )
    },

    /**
     * The `formData` behaviour is used to create a `FormData` instance that
     * contains the file to be uploaded and any other parameters required, for
     * example a CSRF token.
     */
    'formData': {'default': defaultFactories.formData()},

    /**
     * The `metadata` behaviour is used to create a metadata UI overlay which
     * allows users to view and modify metadata for the file.
     */
    'metadata': {'manhattan': manhattanFactories.metadata('_options')},

    /**
     * The `uploader` behaviour is used to create a file uploader UI component
     * for the field.
     */
    'uploader': {'default': defaultFactories.uploader('field')},

    /**
     * The `viewer` behaviour is used to create a file viewer UI component for
     * the field.
     */
    'viewer': {'default': defaultFactories.viewer('field', '_options')}
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
