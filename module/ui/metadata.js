import * as $ from 'manhattan-essentials'

import {Overlay} from './overlay'


// -- Class definition --


/**
 * The metadata UI component provides an interface for users to view and
 * manage a files meta data.
 */
export class Metadata extends Overlay {

    constructor() {
        super()

        // Domain for related DOM elements
        this._dom = {
            'props': null
        }
    }

    /**
     * Remove the metadata interface.
     */
    destroy() {

    }

    /**
     * Initialize the metadata interface.
     */
    init (metadata) {
        const cls = this.constructor

        // Initialize the overlay
        super.init(cls.css['metadata'])

        // Create a meta properties table to display the metadata
        this._dom.props = $.create(
            'div',
            {'class': cls.css['props']}
        )

        // TODO: Add the metadata properties
        const prop1 = new MetaProp(this._dom.props, 'size', '[320, 240]')
        prop1.init()

        const prop2 = new MetaProp(this._dom.props, 'alt', 'A test image')
        prop2.init()

        // - Add some example ones so we can get the styles in place before
        //   we add real meta data.

        this.content.appendChild(this._dom.props)

        // Create the buttons
        this.addButton('okay', 'okay')
        this.addButton('cancel', 'cancel')
    }
}


// -- CSS classes --

Metadata.css = {

    /**
     * Applied to the metadata overlay.
     */
    'metadata': 'mh-metadata',

    /**
     * Applied to the metadata properties container.
     */
    'props': 'mh-metadata__props',
}


/**
 * The meta property component display a key/value pair of metadata and
 * optionally allows the value to be modified.
 */
class MetaProp {

    constructor (container, key, value, readOnly=true) {

        // The meta properties key
        this._key = key

        // The meta properties value
        this._value = value

        // A flag indicating if the value is read-only or can be modified.
        this._readOnly = readOnly

        // Domain for related DOM elements
        this._dom = {
            'container': null,
            'label': null,
            'input': null,
            'prop': null
        }

        // Store a reference to the container element
        this._dom.container = container

        // Set up event handlers
        this._handlers = {}
    }

    // -- Getters & Setters --

    get key() {
        return this._key
    }

    get value() {
        return this._value
    }

    get prop() {
        return this._dom.prop
    }

    // -- Public methods --

    /**
     * TODO: Remove the meta key value.
     */
    destroy() {

    }

    /**
     * Initialize the meta key value.
     */
    init () {
        const css = this.constructor.css

        // Create the meta property
        this._dom.prop = $.create('div', {'class': css['prop']})

        // Key
        this._dom.key = $.create('div', {'class': css['key']})
        this._dom.key.textContent = this.key
        this.prop.appendChild(this._dom.key)

        // Value
        this._dom.value = $.create('input', {'class': css['value']})
        this._dom.value.value = this.value
        this.prop.appendChild(this._dom.value)

        // Add the property to the container
        this._dom.container.appendChild(this.prop)
    }

}


// -- CSS classes --

MetaProp.css = {

    /**
     * Applied to the key.
     */
    'key': 'mh-meta-prop__key',

    /**
     * Applied to the meta property.
     */
    'prop': 'mh-meta-prop',

    /**
     * Applied to the value.
     */
    'value': 'mh-meta-prop__value',
}