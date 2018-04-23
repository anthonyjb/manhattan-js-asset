import * as $ from 'manhattan-essentials'

import {Acceptor} from './acceptor.js'
import {Uploader} from './uploader.js'


// @@
// - Viewer variation settings


// -- Class definition --

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
                 * A comma separated list of file types that are accepted.
                 */
                'accept': '',

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
                 * The label displayed when the field is not populated and the
                 * user is dragging a file over the page.
                 */
                'dropLabel': 'Drop file here',

                /**
                 * The type of file that the field will accept, can be either 
                 * 'file' or 'image'. The type does not validate the or 
                 * enforce the types of files that can be accepted, instead it 
                 * provides a hint to the class about how to configure itself
                 * best for the expected type of file.  
                 */
                'fileType': 'file',

                /**
                 * The label displayed when the field is not populated.
                 */
                'label': 'Select a file...',

                /**
                 * If true then no remove button will be displayed in the 
                 * viewer component.
                 */
                'preventRemove': false,

                /**
                 * The URL that any file will be uploaded to.
                 */
                'url': '/upload'
            },
            options,
            input,
            prefix
        )

        // Configure the behaviours
        this._behaviours = {}

        $.config(
            this._behaviours,
            {
                'acceptor': 'default',
                'formData': 'minimal',
                'uploader': 'default'
            },
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
        return this.todo
    }

    /**
     * Initialize the file field.
     */
    init() {
        const cls = this.constructor
        
        // Create the field element
        this._dom.field = $.create(
            'div', 
            {
                'class': [
                    cls.css['field'], 
                    cls.css.types[this._options.fileType]
                ].join(' ')
            }
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
            let behaviour = this._behaviours.acceptor
            this._acceptor = cls.behaviours.acceptor[behaviour](this)
            this._acceptor.init()
        
            $.listen(
                this._acceptor.acceptor, 
                {
                    'accepted': (event) => { 
                        let {formData} = this._behaviours
                        let {uploader} = this._behaviours

                        this._acceptor.destroy()
                        this._uploader = cls.behaviours.uploader[uploader](
                            this,
                            this._options.url,
                            cls.behaviours.formData[formData](
                                this,
                                event.files[0]
                            )
                        )
                        this._uploader.init()

                        $.listen(
                            this._uploader.uploader,
                            {
                                'aborted': (e) => {
                                    this._uploader.destroy()
                                },

                                'error': (e) => {
                                    this._uploader.destroy()
                                },

                                'uploaded': (e) => {
                                    this._uploader.destroy()
                                    return e.response
                                }
                            }
                        )
                    }
                }
            ) 
        }
    }
}

// @@
// - Should we display an error that can be cleared?


// -- Behaviours --

FileField.behaviours = {

    /**
     * The `acceptor` behaviour is used to create a file acceptor UI component
     * for the field.
     */
    'acceptor': {

        /**
         * Return an acceptor configured using the field options.
         */
        'default': (inst) => {
            return new Acceptor(
                inst.field,
                `${inst.input.name}__acceptor`,
                inst._options.label,
                inst._options.dropLabel,
                inst._options.allowDrop,
                inst._options.accept,
                false
            )
        }
    },

    /**
     * The `formData` behaviour is used to create a `FormData` instance that
     * contains the file to be uploaded and any other parameters required, for
     * example a CSRF token.
     */
    'formData': {

        /**
         * Return the minimal form data required to upload a file.
         */
        'minimal': (inst, file) => {
            const formData = new FormData()
            formData.append('file', file)
            return formData
        }

    },

    /**
     * The `uploader` behaviour is used to create a file uploader UI component
     * for the field.
     */
    'uploader': {

        /**
         * Return the default uploader configuration.
         */
        'default': (inst, endpoint, formData) => {
            return new Uploader(inst.field, endpoint, formData)
        }
    }
}


// -- CSS classes --

FileField.css = {

    /**
     * Applied to the field element.
     */
    'field': 'mh-file-field',

    /**
     * A subset of CSS classes used to indicate the type of file the field is
     * expected to accept. 
     */
    'types': {
    
        /**
         * Applied to the field element when the expected file type is any 
         * file. 
         */
        'file': 'mh-file-field--file',

        /**
         * Applied to the field element when the expected file type is an 
         * image. 
         */
        'image': 'mh-file-field--image'

    }
}
