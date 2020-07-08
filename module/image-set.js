import * as $ from 'manhattan-essentials'

import {ResponseError} from './errors'
import {ErrorMessage} from './ui/error-message'
import {ImageSetViewer} from './ui/viewers'
import * as defaultFactories from './utils/behaviours/defaults'
import * as manhattanFactories from './utils/behaviours/manhattan'

// -- Class definition --

/**
 * An image set UI component (behaves similar to an file field for images but
 * provides support for managing multiple versions of the image.
 */
export class ImageSet {

    constructor(input, options={}, prefix='data-mh-image-set--') {

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
            {
                'acceptor': 'default',
                'assetProp': 'manhattan',
                'asset': 'manhattan',
                'formData': 'default',
                'input': 'manhattan',
                'uploader': 'default',
                'viewer': 'default'
            },
            options,
            input,
            prefix
        )

        // A map of assets (for each version) currently being managed by the
        // image set.
        this._assets = null

        // A map of transforms applied to each version of the image set
        this._baseTransforms = null

        // The base version of the
        this._baseVersion = null

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

    get assets() {
        if (this._assets) {
            const assets = {}
            for (let version in this._assets) {
                assets[version] = Object.assign(this._assets[version], {})
            }
            return assets
        }
        return null
    }

    get baseTransforms() {
        return Object.assign(this._baseTransforms || {}, {})
    }

    get baseVersion() {
        return this._baseVersion || this._options.versions[0]
    }

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
        this._assets = {}
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
                    this.upload(this.baseVersion, event.files[0])
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
     * Return the value of the named property from the asset.
     */
    getAssetProp(version, name) {
        const behaviours = this.constructor.behaviours.assetProp
        const behaviour = this._behaviours.assetProp
        return behaviours[behaviour](this, 'get', version, name)
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

        if (this.input.value) {
            const behaviour = this._behaviours.input
            cls.behaviours.input[behaviour](this, 'get')
            this.populate(this.baseVersion, this.assets[this.baseVersion])
        } else {
            this.clear()
        }
    }

    /**
     * Populate the image set (transition to the viewing state).
     */
    populate(version, asset) {
        const cls = this.constructor

        // Clear the current state component
        this._destroyStateComponent()

        // Update the asset and input value
        this._assets[version] = asset

        // Sync the input value with the image set
        const inputBehaviour = this._behaviours.input
        cls.behaviours.input[inputBehaviour](this, 'set')

        // Set up the viewer
        const viewerBehaviour = this._behaviours.viewer
        this._viewer = cls.behaviours.viewer[viewerBehaviour](this, version)
        this._viewer.init()

        // Set up event handlers for the viewer
        $.listen(
            this._viewer.viewer,
            {
                'remove': () => {
                    // Clear the image set
                    this.clear()
                }
            }
        )

        // Set the new state
        this._state = 'viewing'

        // Trigger a change event against the input
        $.dispatch(this.input, 'change')
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

    /**
     * Upload a file (transition to the uploading state).
     */
    upload(version, file) {
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
        $.dispatch(this.input, 'uploading')

        $.listen(
            this._uploader.uploader,
            {
                'aborted cancelled error': () => {
                    $.dispatch(this.input, 'uploadfailed')
                    this.clear()
                },

                'uploaded': (event) => {
                    $.dispatch(this.input, 'uploaded')

                    try {
                        // Extract the asset from the response
                        const behaviour = this._behaviours.asset
                        const asset = cls.behaviours.asset[behaviour](
                            this,
                            event.response
                        )

                        // Populate the field
                        this.populate(version, asset)

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

ImageSet.behaviours = {

    /**
     * The `acceptor` behaviour is used to create a file acceptor UI component
     * for the image set.
     */
    'acceptor': {'default': defaultFactories.acceptor('imageSet', false)},

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
        'manhattan': (inst, action, version, name, value) => {
            if (action === 'set') {
                return manhattanFactories.setAssetProp(
                    inst._assets[version],
                    inst._options,
                    name,
                    value
                )
            }
            return manhattanFactories.getAssetProp(
                inst._assets[version],
                inst._options,
                name
            )
        }
    },

    /**
     * The `formData` behaviour is used to create a `FormData` instance that
     * contains the file to be uploaded and any other parameters required, for
     * example a CSRF token.
     */
    'formData': {'default': defaultFactories.formData()},

    /**
     * The `input` behaviour is used to map the image set data to the input,
     * the action determines if the value is `set` against input or used to
     * populate the image set component (`get`).
     */
    'input': {
        'manhattan': (inst, action) => {
            let baseTransforms = null
            let imageSetData = null

            if (action === 'set') {

                // Set
                if (inst.assets) {

                    baseTransforms = {}
                    for (const [version, transform]
                        of Object.entries(inst.baseTransforms)) {

                        baseTransforms[version] = manhattanFactories
                            .transformsToServer(transform)
                    }

                    imageSetData = {
                        'images': inst.assets,
                        'base_transforms': baseTransforms,
                        'base_version': inst.baseVersion
                    }

                    inst.input.value = JSON.stringify(imageSetData)

                } else {
                    inst.input.value = ''
                }

            } else {

                // Get
                imageSetData = JSON.parse(inst.input.value)

                baseTransforms = {}
                for (const [version, transform]
                    of Object.entries(imageSetData['base_transforms'])) {

                    baseTransforms[version] = manhattanFactories
                        .transformsToClient(transform)
                }

                inst._assets = imageSetData['images']
                inst._baseTransforms = baseTransforms
                inst._baseVersion = imageSetData['base_version']
            }
        }
    },

    /**
     * The `uploader` behaviour is used to create a file uploader UI component
     * for the image set.
     */
    'uploader': {'default': defaultFactories.uploader('imageSet')},

    /**
     * The `viewer` behaviour is used to create a file viewer UI component for
     * the image set.
     */
    'viewer': {
        'default': (inst, version) => {

            // @@ NEED TO REPLACE: This should build a map of previews from a
            // dedicated preview object, or the asset, or the primary asset.

            const {assets} = inst
            const imageURLs = {}
            for (const v of inst._options.versions) {
                if (assets[v]) {
                    imageURLs[v] = inst.getAssetProp(v, 'previewURL')
                } else {
                    imageURLs[v] = inst.getAssetProp(
                        inst.baseVersion,
                        'previewURL'
                    )
                }
            }

            const labels = {}
            for (const [i, v] of inst._options.versions.entries()) {
                labels[v] = inst._options.versionLabels[i]
            }

            return new ImageSetViewer(
                inst.imageSet,
                inst._options.versions,
                labels,
                imageURLs,
                inst.baseVersion
            )
        }
    }
}


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
// - `getAsset` needs to return a copy of the asset currently being viewed
//   based on version if not key is provided.
// - `clearAsset` to clear an individual asset from the image set and reset
//   the viewer.
// - `populate`
// - `setVersion` (`getAsset` and `getBaseAsset`)
// - `upload`
// - `acceptor` needs a special mode (CSS) so that it's available for a non
//   base image.
//
// - Copy over CSS from manage when done

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
