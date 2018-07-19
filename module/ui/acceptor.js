import * as $ from 'manhattan-essentials'


// -- Class definition --

/**
 * File acceptor UI component for form fields.
 *
 * Acceptors allow users to select a file from the file system or (optionally)
 * to drag a file on to the acceptor.
 */

export class Acceptor {

    constructor(
        container,
        name,
        label='Select a file...',
        dropLabel='Drop file here',
        allowDrop=false,
        accept='',
        multiple=false
    ) {
        // The acceptor will create an input field used to capture/accept
        // a file the user wants to upload. The input field requires a name,
        // typically this will be a combination of the associated hidden asset
        // input field and a string such as `__acceptor`.
        this._name = name

        // The label displayed in the acceptor in its default state
        this._label = label

        // The lavel displayed in the acceptor when a file is being dragged
        // over the page.
        this._dropLabel = dropLabel

        // Flag indicating if the acceptor should allow users to drop files on
        // to the acceptor.
        this._allowDrop = allowDrop

        // A comma separated list of file types that are accepted.
        this._accept = accept

        // Flag indicating if the acceptor can accept multiple files
        this._multiple = multiple

        // Domain for related DOM elements
        this._dom = {
            'acceptor': null,
            'container': null,
            'dropZone': null,
            'faceplate': null,
            'input': null
        }

        // Store a reference to the container element
        this._dom.container = container

        // Set up event handlers
        this._handlers = {

            'acceptDrop': (event) => {
                event.preventDefault()

                let {files} = event.dataTransfer

                // If the acceptor doesn't support accepting multiple files
                // then select only the first file dropped.
                files = [...files]
                if (!this._multiple) {
                    files = [files[0]]
                }

                // Trigger an 'accepted' event against the acceptor element
                $.dispatch(
                    this.acceptor,
                    'accepted',
                    {files}
                )
            },

            'change': (event) => {
                let {files} = event.target

                // Convert the list of files to an array of files (of the
                // appropriate size).
                files = [...files]
                if (!this._multiple) {
                    files = [files[0]]
                }

                // Clear the input's value to ensure the same files can be
                // re-uploaded using the acceptor in a single session.
                this._dom.input.value = ''

                // Trigger an 'accepted' event against the acceptor element
                $.dispatch(
                    this.acceptor,
                    'accepted',
                    {files, a: files}
                )
            },

            'dragEnd': (event) => {
                event.preventDefault()

                // Delay removing the file inbound CSS class for a short
                // period to allow the dragover event to counter act it if
                // applicable.
                this.__dragEndTimout = setTimeout(
                    () => {
                        this.acceptor
                            .classList
                            .remove(this.constructor.css['fileInbound'])
                    },
                    150
                )
            },

            'dragStart': (event) => {
                event.preventDefault()

                // Clear any timeout set to remove the file inbound CSS class
                clearTimeout(this.__dragEndTimout)

                this.acceptor
                    .classList
                    .add(this.constructor.css['fileInbound'])
            }
        }
    }

    // -- Getters & Setters --

    get acceptor() {
        return this._dom.acceptor
    }

    // -- Public methods --

    /**
     * Remove the acceptor.
     */
    destroy() {
        // Remove event listeners
        $.ignore(
            document,
            {
                'dragenter dragover': this._handlers.dragStart,
                'dragleave drop': this._handlers.dragEnd
            }
        )

        // Remove the acceptor element
        if (this.acceptor !== null) {
            this.acceptor.parentNode.removeChild(this.acceptor)
        }

        // Clear DOM element references
        this._dom.acceptor = null
        this._dom.dropZone = null
        this._dom.faceplate = null
        this._dom.input = null
    }

    /**
     * Initialize the acceptor.
     */
    init() {
        const cls = this.constructor

        // Create the acceptor element
        this._dom.acceptor = $.create('div', {'class': cls.css['acceptor']})

        // Create the file input element for the acceptor
        this._dom.input = $.create(
            'input',
            {
                'type': 'file',
                'name': this._name,
                'class': cls.css['input'],
                'title': ' '
            }
        )

        if (this._accept !== '') {
            this._dom.input.setAttribute('accept', this._accept)
        }

        if (this._multiple) {
            this._dom.input.setAttribute('multiple', '')
        }

        this.acceptor.appendChild(this._dom.input)

        // Create the faceplate for the acceptor, the faceplate allows a
        // custom appearance to be presented for the file input.
        this._dom.faceplate = $.create('div', {'class': cls.css['faceplate']})
        this._dom.faceplate.innerHTML = this._label
        this.acceptor.appendChild(this._dom.faceplate)

        if (this._allowDrop) {

            // Create the drop zone for the acceptor
            this._dom.dropZone = $.create(
                'div',
                {'class': cls.css['dropZone']}
            )
            this._dom.dropZone.innerHTML = this._dropLabel
            this.acceptor.appendChild(this._dom.dropZone)
        }

        // Add the acceptor element to the container
        this._dom.container.appendChild(this.acceptor)

        // Set up event listeners
        $.listen(
            document,
            {
                'dragenter dragover dragleave drop':
                    this._handlers.preventDefault,
                'dragenter dragover': this._handlers.dragStart,
                'dragleave drop': this._handlers.dragEnd
            }
        )

        if (this._allowDrop) {
            $.listen(
                this._dom.dropZone,
                {'drop': this._handlers.acceptDrop}
            )
        }

        $.listen(
            this._dom.input,
            {'change': this._handlers.change}
        )
    }
}


// -- CSS classes --

Acceptor.css = {

    /**
     * Applied to the acceptor element.
     */
    'acceptor': 'mh-acceptor',

    /**
     * Applied to the drop zone element within the acceptor.
     */
    'dropZone': 'mh-acceptor__drop-zone',

    /**
     * Applied when the user is dragging a file over the page.
     */
    'fileInbound': 'mh-acceptor--file-inbound',

    /**
     * Applied to the faceplate element within the acceptor.
     */
    'faceplate': 'mh-acceptor__faceplate',

    /**
     * Applied to the file input field within the acceptor.
     */
    'input': 'mh-acceptor__input'
}
