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
// - How will we specifiy versions anmd version labels?
//
//     ? data-mh-image-set--versions="s,m,l"
//     ? data-mh-image-set--version-labels="Small,Medium,Large" (can't have
//       labels will commas then though)
//
//     ? JSON is the other option
//
// - How will crop ratios and fixed crop be specified?
//
//     ? data-mh-image-set--crop-aspect-ratios="0.5,0.667,0.75"
//     ? data-mh-image-set--fixed-crop-aspect-ratio (probably safe to say
//       fixed for one fixed for all.
//
// 1 - Consider adding an ImageField to assets that supports for crop stuff to
//     make this easier to understand.
//
// 2 - Consider making crop stuff something you can set for ImageSetFields.
//
// 3 - The above suggestions would remove the need to use custom data fields
//     in the render_kw.
