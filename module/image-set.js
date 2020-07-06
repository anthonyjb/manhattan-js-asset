import * as $ from 'manhattan-essentials'

import {ResponseError} from './errors'
import {ErrorMessage} from './ui/error-message'

// -- Class definition --

/**
 * An image set UI component (behaves similar to an file field for images but
 * provides support for managing multiple versions of the image.
 */
export class ImageSet {

    constructor(input, options={}, prefix='data-mh-image-set--') {

        // Configure the options
        this._options = {}

        // versions
        // version-labels
        // crop-aspect-ratios

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
                 * The aspect ratios to apply to the crop region for each
                 * version within the image set (the number of crop aspect
                 * ratios must match that number of versions).
                 */
                'cropAspectRatios': [],

                /**
                 * The label displayed when the field is not populated and the
                 * user is dragging a file over the page.
                 */
                'dropLabel': 'Drop image here',

                /**
                 * The image variation to display as the preview in the
                 * image editor (if applicable).
                 */
                'editing': 'editing',

                /**
                 * The label displayed when the field is not populated.
                 */
                'label': 'Select an image...',

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
                'uploadUrl': '/upload',

                /**
                 * A list of labels for each version within the image set (the
                 * number of versions must match that number of versions).
                 */
                'versionLabels': [],

                /**
                 * A list of named versions that this image set supports.
                 */
                'versions': []
            },
            options,
            input,
            prefix
        )

        // Convert `versions` option given as an attribute to a list
        if (typeof this._options.versions === 'string') {
            this._options.versions = this._options.versions.split(',')
        }

        // Convert `versionLabels` option given as an attribute to a list
        if (typeof this._options.versionLabels === 'string') {
            this._options.versionLabels = this._options.versionLabels.split(',')

            if (this._options.versions.length
                    !== this._options.versionLabels.length) {
                throw Error('Length of version labels must match versions')
            }
        }

        // Convert `cropAspectRatios` option given as an attribute to a list
        // of floats.
        if (typeof this._options.cropAspectRatios === 'string') {
            const cropAspectRatios = this._options.cropAspectRatios.split(',')
            this._options.cropAspectRatios = []
            for(let cropAspectRatio of cropAspectRatios) {
                this
                    ._options
                    .cropAspectRatios.push(parseFloat(cropAspectRatio))
            }

            if (this._options.versions.length
                    !== this._options.cropAspectRatios.length) {
                throw Error('Length of crop aspect ratios must match versions')
            }
        }

        // Conver `maxPreviewSize` option given as an attribute to a list of
        // integers.
        if (typeof this._options.maxPreviewSize === 'string') {
            const maxPreviewSize = this._options.maxPreviewSize.split(',')
            this._options.maxPreviewSize = [
                parseInt(maxPreviewSize[0], 10),
                parseInt(maxPreviewSize[1], 10)
            ]
        }

        // Configure the behaviours
        this._behaviours = {}

        $.config(
            this._behaviours,
            {},
            options,
            input,
            prefix
        )

        // A map of assets (for each version) currently being managed by the
        // image set.
        this._assets = null

        // The version of the image set currently being viewed
        this._version = null

        // The alt tag for the image set
        this._alt = ''

        // The state of the image set (initializing, accepting, uploading,
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
            'imageSet': null,
            'input': null
        }

        // Store a reference to the input element
        this._dom.input = input
    }

    // -- Getters & Setters --

    get imageSet() {
        return this._dom.imageSet
    }

    get input() {
        return this._dom.input
    }

    get state() {
        return this._state
    }

    get version() {
        return this._version
    }

    // -- Public methods --

    /**
     * Clear any error from the field.
     */
    clearError() {
        if (this._error) {
            this._error.destroy()

            // Clear the error CSS modifier from the field
            this.imageSet.classList.remove(this.constructor.css['hasError'])
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
        this._assets = null
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

        // Trigger a change event against the input
        $.dispatch(this.input, 'change')
    }

    /**
     * Remove the image set.
     */
    destroy() {
        if (this._dom.imageSet) {
            this._dom.imageSet.parentNode.removeChild(this._dom.imageSet)
            this._dom.imageSet = null
        }

        // Remove the file field reference from the input
        delete this._dom.input._mhImageSet
    }

    /**
     * Initialize the image set.
     */
    init() {
        const cls = this.constructor

        // Store a reference to the image set instance against the input
        this.input._mhImageSet = this

        // Create the image set element
        this._dom.imageSet = $.create(
            'div',
            {'class': cls.css['imageSet']}
        )

        // Add the image set to the page
        this.input.parentNode.insertBefore(
            this._dom.imageSet,
            this.input.nextSibling
        )

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

        // Add clear handler
        $.listen(
            this._error.error,
            {
                'clear': () => {

                    // Clear the error
                    this.clearError()

                }
            }
        )

        // Add the error CSS modifier to the field
        this.imageSet.classList.add(this.constructor.css['hasError'])
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

ImageSet.behaviours = {}


// -- CSS classes --

ImageSet.css = {

    /**
     * Applied to the image set element.
     */
    'imageSet': 'mh-image-set',

    /**
     * Applied to the image set when it contains an error.
     */
    'hasError': 'mh-file-field--has-error'

}

// @@
//
// - Build a state map (FSM) to determine the possible image set states to
//   account for.
// - `getAssets` needs to return a copy of the map of assets.
// - `getAsset` needs to return a copy of the asset currently being viewed
//   based on version if not key is provided.
// - `clearAsset` to clear an individual asset from the image set and reset
//   the viewer.
// - `getAssetProp` and `setAssetProp` should use the `_version`
// - `populate`
// - `setVersion` (`getAsset` and `getBaseAsset`)
// - `upload`
//

//
// * - Image set fields apply fixed crops and expect crop ratios version
//
// ? - How will analyzers and variations be configured for image sets :/
//       - We want the same analyzers to run for each separate image.
//       - We want a specific version of the variations to be generated for
//         each version of the imge set. We'll potentially end up generating
//         all the variations for all the images, which may not be a problem
//         though one option may be to be able to send upload a specific
//         variation key to generate that prevents the general overall map.
