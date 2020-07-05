import * as $ from 'manhattan-essentials'


// -- Class definition --

/**
 * An image set UI component (behaves similar to an file field for images but
 * provides support for managing multiple versions of the image.
 */
export class ImageSet {

    constructor(input, options={}, prefix='data-mh-image-set--') {

    }

}


// -- Behaviours --

ImageSet.behaviours = {

}


// -- CSS classes --

ImageSet.css = {

}

// @@
//
// * - Image set fields apply fixed crops and expect crop ratios version
//
// 1 - Consider adding a parameter to smart crop that means it only applies
//     itself if there is no existing crop transform applied.
//
// ? - How will analyzers and variations be configured for image sets :/
//       - We want the same analyzers to run for each separate image.
//       - We want a specific version of the variations to be generated for
//         each version of the imge set. We'll potentially end up generating
//         all the variations for all the images, which may not be a problem
//         though one option may be to be able to send upload a specific
//         variation key to generate that prevents the general overall map.
