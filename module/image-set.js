import * as $ from 'manhattan-essentials'


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

        // @@ versions

        // @@ version labels (confirm length of labels)

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

            // @@ Confirm lengths for crop ratios
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

        // Domain for related DOM elements
        this._dom = {
            'imageSet': null,
            'input': null
        }

        // Store a reference to the input element
        this._dom.input = input
    }

    // -- Getters & Setters --

    get input() {
        return this._dom.input
    }

    /**
     * Remove the image set.
     */
    destroy() {
        console.log(this, 'destroy image set')
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

        // @@

        // Add the image set to the page
        this.input.parentNode.insertBefore(
            this._dom.imageSet,
            this.input.nextSibling
        )

    }
}


// -- Behaviours --

// ImageSet.behaviours = {

// }


// -- CSS classes --

ImageSet.css = {

    /**
     * Applied to the image set element.
     */
    'imageSet': 'mh-image-set'

}

// @@
//
// * - Image set fields apply fixed crops and expect crop ratios version
//
// 1 - Options
// 2 - Behaviours
//
// ? - How will analyzers and variations be configured for image sets :/
//       - We want the same analyzers to run for each separate image.
//       - We want a specific version of the variations to be generated for
//         each version of the imge set. We'll potentially end up generating
//         all the variations for all the images, which may not be a problem
//         though one option may be to be able to send upload a specific
//         variation key to generate that prevents the general overall map.
