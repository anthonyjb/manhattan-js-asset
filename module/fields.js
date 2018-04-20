import * as $ from 'manhattan-essentials'

import {Acceptor} from './acceptor.js'


// -- Class definition --

// @@ Since we're going to allow the components (acceptor, uploader, viewer)
// to be defined by behaviours we probably don't need separate field types?
// Maybe though possible an asset type option could be provided instead? 

// @@ The name of the acceptor file field should be generated using the input
// field name from the field field.

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
                 * If true then the field will support users dropping files on
                 * to the acceptor to upload them.
                 */
                'allowDrop': false,

                /**
                 * If true then a download button will be displayed in the 
                 * viewer component.
                 */
                'allowDownload': false,

                /**
                 * If true then an edit button will be displayed in the 
                 * viewer component.
                 */
                'allowEdit': false,

                /**
                 * If true then no remove button will be displayed in the 
                 * viewer component.
                 */
                'preventRemove': false
            },
            options,
            input,
            prefix
        )

        // Configure the behaviours
        this._behaviours = {}

        $.config(
            this._behaviours,
            {},
            options,
            input,
            prefix
        )
        
        // Domain for related DOM elements
        this._dom = {
            'input': null,
            'field': null
        }

        // Store a reference to the input element
        this._dom.input = input

        // Set up event handlers
        this._handlers = {}
    }

    // -- Getters & Setters --

    get field() {
        return this._dom.field
    }

    get input() {
        return this._dom.input
    }

    // -- Public methods --

    /**
     * Remove the file field.
     */
    destroy() {

    }

    /**
     * Initialize the file field.
     */
    init() {
        
        // Create the field element
        this._dom.field = $.create(
            'div', 
            {'class': this.constructor.css['field']}
        )
        this.input.parentNode.insertBefore(
            this._dom.field,
            this.input.nextSibling
        )

        if (this.input.value) {
            // @@ If the field is populated then convert the value to an `Asset`
            // instance and insert the viewer.
        } else {
            // If not then create a file acceptor for the field.
            this._acceptor = new Acceptor(
                this.field,
                this._getTemplate('acceptor'),
                this._options.allowDrop
            )
            this._acceptor.init()
        }
    }

    /**
     * Return a template for the named component.
     */
    _getTemplate(name) {
        const {templates} = this.constructor

        // Initially check to see if the template exists in the set named in 
        // the options...
        if (name in templates[this._options.templates]) {
            return templates[this._options.templates][name]
        }

        // ...if not return the default template.
        return templates['default'][name]
    }
 }


// -- Behaviours --

Tokenizer.behaviours = {

    /**
     * The `acceptor` behaviour is used to create a file acceptor UI component
     * for the field.
     */
    'acceptor': {

    }
}


 // -- CSS classes --

 FileField.css = {

    /**
     * Applied to the body element when the user is dragging an element over 
     * the page that can be dropped.
     */
    'drop': 'mh-assets--file-drop',

    /**
     * Applied to the field field element.
     */
    'field': 'mh-field-field'
}


// -- HTML templates -- @@ DEFUNCT

FileField.templates = {

    // @@ Instead of templates could we use a behaviour that returns the 
    // various components (like acceptor) and then rely on the init method for
    // the component to take any real-time or parent related details? That way
    // we don't really need custom templates but we can configure the elements
    // using options and CSS. Though custom CSS is still potentially difficult
    // within a given acceptor :/ though possible through simple inheritance, 
    // or even just adding a modifier to the parent field (which is probably
    // the preferred method to be honest. OK lets take this approach it feels
    // more consistent and allows more complex configuration to be done 
    // against the behaviours if relevant. 

    /**
     * The default templates, this template set provides minimal functionality 
     * and is used as a fallback if a template doesn't exist in the template
     * set named in the options.
     */
    'default': {

        /**
         * @@
         */
        'acceptor': `
<div class="mh-file-acceptor">
    <input type="file" name="#NAME#" class="mh-file-acceptor__input">
    <div class="mh-file-acceptor__label"></div>
</div>`,

        'uploader': ``,
        
        'viewer': ``        

    },

    /**
     * The full featured template set used in the Manhattan CMS UI. 
     */
    'manhattan': {}

}
