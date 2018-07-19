import {Sortable} from 'manhattan-sortable'


/**
 * Clone behaviour for gallery items used when creating a helper for the
 * purpose of sorting.
 */
function cloneGalleryItem(inst, element) {

    // Clone the element
    const clone = element.cloneNode(true)

    // Remove id attribute to avoid unwanted duplicates
    clone.removeAttribute('id')

    // Add a helper class
    clone.classList.add('mh-gallery-item--sort-helper')

    return clone
}

Sortable.behaviours.helper['cloneGalleryItem'] = cloneGalleryItem