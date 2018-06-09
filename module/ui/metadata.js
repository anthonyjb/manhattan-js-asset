import * as $ from 'manhattan-essentials'

import {Overlay} from './overlay'


// -- Class definition --

/**
 * The meta property component display a key/value pair of metadata and
 * optionally allows the value to be modified.
 */
class MetaProp {

    constructor (container, label, key, value, readOnly=true) {

        // The meta properties label
        this._label = label

        // The meta properties key
        this._key = key

        // The meta properties initial value
        this._initialValue = value

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
    }

    // -- Getters & Setters --

    get key() {
        return this._key
    }

    get value() {
        return this._dom.value.value
    }

    get prop() {
        return this._dom.prop
    }

    get readOnly() {
        return this._readOnly
    }

    // -- Public methods --

    /**
     * Remove the meta prop.
     */
    destroy() {
        // Remove the prop element
        if (this.prop !== null) {
            this._dom.container.removeChild(this.prop)
            this._dom.prop = null
        }
    }

    /**
     * Initialize the meta key value.
     */
    init () {
        const cls = this.constructor

        // Create the meta property
        this._dom.prop = $.create('div', {'class': cls.css['prop']})

        // Key
        this._dom.label = $.create('div', {'class': cls.css['label']})
        this._dom.label.textContent = this._label
        this.prop.appendChild(this._dom.label)

        // Value
        this._dom.value = $.create('input', {'class': cls.css['value']})
        this._dom.value.value = this._initialValue

        if(this._readOnly) {

            // Flag the field as read-only
            this.prop.classList.add(cls.css['readOnly'])
            this._dom.value.readOnly = true
        }

        this.prop.appendChild(this._dom.value)

        // Add the property to the container
        this._dom.container.appendChild(this.prop)
    }

}


// -- CSS classes --

MetaProp.css = {

    /**
     * Applied to the label.
     */
    'label': 'mh-meta-prop__label',

    /**
     * Applied to the meta property.
     */
    'prop': 'mh-meta-prop',

    /**
     * Applied to the meta property if its value is read-only.
     */
    'readOnly': 'mh-meta-prop--read-only',

    /**
     * Applied to the value.
     */
    'value': 'mh-meta-prop__value'
}


/**
 * The metadata UI component provides an overlay for users to view and edit
 * an assets metadata.
 */
export class Metadata extends Overlay {

    constructor(props) {
        super()

        // A list meta properties to present, the format of the list should be
        // as follows:
        //
        //    [
        //        ['label', 'name', 'value', readonly (true or false)],
        //        ...
        //    ]
        this._props = props

        // A list of the meta prop components
        this._propComponents = []

        // Domain for related DOM elements
        this._dom['props'] = null
    }

    get props() {
        // Build an object of editable property values
        const props = {}
        for (let propComponent of this._propComponents) {
            if (!propComponent.readOnly) {
                props[propComponent.key] = propComponent.value
            }
        }
        return props
    }

    /**
     * Remove the metadata overlay.
     */
    destroy() {
        // Remove the props element
        if (this.props !== null) {
            this.content.removeChild(this._dom.props)
            this._dom.props = null
        }

        super.destroy()
    }

    /**
     * Initialize the metadata overlay.
     */
    init () {
        const cls = this.constructor

        // Initialize the overlay
        super.init(cls.css['metadata'])

        // Create a meta properties table to display the metadata
        this._dom.props = $.create('div', {'class': cls.css['props']})

        // Add the metadata properties
        this._propComponents = []
        for (let prop of this._props) {
            const propComponent = new MetaProp(this._dom.props, ...prop)
            this._propComponents.push(propComponent)
            propComponent.init()
        }
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
    'props': 'mh-metadata__props'
}
