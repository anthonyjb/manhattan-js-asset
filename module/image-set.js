import * as $ from 'manhattan-essentials'

import {ResponseError} from './errors'
import {ErrorMessage} from './ui/error-message'
import {Metadata} from './ui/metadata'
import {ImageEditor} from './ui/image-editor'
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
                'accept': 'image/*',

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
                'alt': 'default',
                'acceptor': 'default',
                'assetProp': 'manhattan',
                'asset': 'manhattan',
                'formData': 'default',
                'imageEditor': 'default',
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

        // A map of preview URIs for each version generated by editing images
        this._previewURIs = null

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

    get alt() {
        return this._alt
    }

    set alt(value) {
        const cls = this.constructor

        // Set the alt value
        this._alt = value

        // Sync the input value with the image set
        const inputBehaviour = this._behaviours.input
        cls.behaviours.input[inputBehaviour](this, 'set')

        // Trigger a change event against the input
        $.dispatch(this.input, 'change')
    }

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

    get previewURIs() {
        return Object.assign(this._previewURIs || {}, {})
    }

    get state() {
        return this._state
    }

    get version() {
        return this._version
    }

    // -- Public methods --

    /**
     * Clear the field (transition to the accepting state).
     */
    clear() {
        const cls = this.constructor

        // Clear the current state component
        this._destroyStateComponent()

        // Clear the asset input value
        this._assets = {}
        this._baseTransforms = {}
        this._previewURIs = {}
        this._alt = ''

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

        this._updateInput()
    }

    /**
     * Clean the asset from a version of the image set.
     */
    clearAsset(version, asset) {
        delete this._assets[version]
        delete this._baseTransforms[version]
        delete this._previewURIs[version]

        this._updateInput()
    }

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
     * Get the crop aspect ratio for a version of the image set.
     */
    getCropAspectRatio(version) {
        return this
            ._options
            .cropAspectRatios[this._options.versions.indexOf(version)]
    }

    /**
     * Return a map of which versions have a unique asset (vs. using the base
     * version asset).
     */
    getOwnAssets() {
        const ownImages = {}
        for (const version of this._options.versions) {
            ownImages[version] = this._assets.hasOwnProperty(version)
        }
        return ownImages
    }

    /**
     * Return a preview URL/URI for a version of the image set.
     */
    getPreview(version) {

        if (this._previewURIs[version]) {

            // Preview URI available for this version
            return this._previewURIs[version]
        }

        if(this._assets[version]) {

            // Preview URL available for this version
            return this.getAssetProp(version, 'previewURL')
        }

        if (this._baseTransforms[version]) {

            // Use the variation related to this version against the base
            // version.
            return this.getAssetProp(version, 'previewURL')
        }

        return this.getAssetProp(this.baseVersion, 'editingURL')
    }

    /**
     * Return a map of preview URL/URIs for versions of the image set.
     */
    getPreviews() {
        const previews = {}
        for (const version of this._options.versions) {
            previews[version] = this.getPreview(version)
        }
        return previews
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
            this.populate(this.baseVersion)
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

        if (asset) {
            // Add the new asset to the image set (against its version)
            this._assets[version] = asset

            // Clear any existing base transforms and previews for this
            // version.
            delete this._baseTransforms[version]
            delete this._previewURIs[version]
        }

        // Set up the viewer
        const viewerBehaviour = this._behaviours.viewer
        this._viewer = cls.behaviours.viewer[viewerBehaviour](this, version)
        this._viewer.init()

        // Set up event handlers for the viewer
        $.listen(
            this._viewer.viewer,
            {
                'accepted': (event) => {
                    this.upload(this._viewer.version, event.files[0])
                },

                'alt': () => {
                    const altBehaviour = this._behaviours.alt
                    const altModal = cls.behaviours.alt[altBehaviour](this)
                    altModal.init()
                    altModal.show()

                    $.listen(
                        altModal.overlay,
                        {
                            'okay': () => {
                                // Apply any changes to the alt tag
                                this.alt = altModal.props.alt || ''

                                // Hide the medata overlay
                                altModal.hide()
                            },
                            'cancel': () => {
                                altModal.hide()
                            },
                            'hidden': () => {
                                altModal.destroy()
                            }
                        }
                    )
                },

                'clear': (event) => {
                    this.clearAsset(this._viewer.version)

                    // Update the viewer with the new preview URI and own
                    // image flag.
                    this._viewer.setImageURL(
                        this._viewer.version,
                        this.getPreview(this._viewer.version)
                    )
                    this._viewer.setOwnImage(this._viewer.version, false)
                },

                'edit': () => {
                    const imageEditorBehaviour = this._behaviours.imageEditor
                    const imageEditor = cls.behaviours
                        .imageEditor[imageEditorBehaviour](
                            this,
                            this._viewer.version
                        )
                    imageEditor.init()
                    imageEditor.show()

                    $.listen(
                        imageEditor.overlay,
                        {
                            'okay': () => {
                                const {transforms} = imageEditor
                                const {previewDataURI} = imageEditor

                                previewDataURI.then(([dataURI, sizeInfo]) => {

                                    // Set base transforms against the image
                                    this.setBaseTransform(
                                        this._viewer.version,
                                        imageEditor.transforms
                                    )

                                    // Set the preview URI
                                    this.setPreview(
                                        this._viewer.version,
                                        dataURI
                                    )

                                    // Update the image URLs for the viewer
                                    for (const [v, imageURL]
                                        of Object.entries(this.getPreviews())) {

                                        this._viewer.setImageURL(v, imageURL)
                                    }

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

                'remove': () => {
                    // Clear the image set
                    this.clear()
                }
            }
        )

        // Set the initial version in the viewer to the one we just populated
        this._viewer.version = version

        // Set the new state
        this._state = 'viewing'

        this._updateInput()
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
     * Set the asset for a version of the image set.
     */
    setAsset(version, asset) {
        this._assets[version] = asset
        this._updateInput()
    }

    /**
     * Set the base transforms for a version of the image set.
     */
    setBaseTransform(version, transforms) {
        this._baseTransforms[version] = transforms
        this._updateInput()
    }

    /**
     * Set the preview URI for a version of the image set.
     */
    setPreview(version, uri) {
        this._previewURIs[version] = uri
        this._updateInput()
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

    /**
     * Update the input value to the current state of the image set.
     */
    _updateInput() {
        const cls = this.constructor

        // Sync the input value with the image set
        const inputBehaviour = this._behaviours.input
        cls.behaviours.input[inputBehaviour](this, 'set')

        // Trigger a change event against the input
        $.dispatch(this.input, 'change')
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
     * The `alt` behaviour is used to create a alt tag UI overlay which
     * allows users to view and modify alt tag for the image.
     */
    'alt': {
        'default': (inst) => {
            return new Metadata([['Alt', 'alt', inst._alt, false]])
        }
    },

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
            const _asset = inst._assets[version]
            const _baseAsset = inst._assets[inst.baseVersion]

            if (action === 'set') {
                return manhattanFactories.setAssetProp(
                    inst._assets[version],
                    inst._options,
                    name,
                    value
                )
            }

            if (name === 'previewURL' && version !== inst.baseVersion) {
                if (!_asset) {
                    return _baseAsset['variations'][version].url
                }
            }

            return manhattanFactories.getAssetProp(
                _asset || _baseAsset,
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
     * The `imageEditor` behaviour is used to create an image editor which
     * allows users to edit an image in the image set.
     */
    'imageEditor': {
        'default': (inst, version) => {
            return new ImageEditor(
                inst.getAssetProp(version, 'editingURL'),
                inst.getCropAspectRatio(version),
                true,
                inst._options.maxPreviewSize
            )
        }
    },

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
                        'alt': inst.alt,
                        'images': inst.assets,
                        'base_transforms': baseTransforms,
                        'base_version': inst.baseVersion,
                        'preview_uris': inst.previewURIs
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

                // Values should not be set using setters to avoid updating
                // the input as part of the read.
                inst._alt = imageSetData['alt']
                inst._assets = imageSetData['images']
                inst._baseTransforms = baseTransforms
                inst._baseVersion = imageSetData['base_version']
                inst._previewURIs = imageSetData['preview_uris']
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
            const {assets} = inst

            // Build a map of labels for the image viewer
            const labels = {}
            for (const [i, v] of inst._options.versions.entries()) {
                labels[v] = inst._options.versionLabels[i]
            }

            // Build a map of which versions have a unique image (vs. using
            // the base image).
            const ownImages = {}
            for (const v of inst._options.versions) {
                ownImages[v] = assets.hasOwnProperty(v)
            }

            return new ImageSetViewer(
                inst.imageSet,
                inst._options.versions,
                inst.baseVersion,
                labels,
                inst.getPreviews(),
                inst.getOwnAssets(),
                inst.input.name,
                inst._options.accept
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
// * support uploading new images for versions
// * support saving image sets and generating variations for them
// * move CSS over from manage
//
