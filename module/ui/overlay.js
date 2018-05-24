import * as $ from 'manhattan-essentials'


// -- Class definition --

/**
 * An overlay UI component on top of which floating in-page UIs are built.
 */

export class Overlay {

    constructor() {

        // Domain for related DOM elements
        this._dom = {
            'buttons': null,
            'close': null,
            'content': null,
            'overlay': null
        }

        // Set up event handlers
        this._handlers = {

            'cancel': (event) => {
                // Make sure the event was triggered by clicking the close
                // button or the escape key being pressed.
                if (event.currentTarget != this._dom.close) {
                    if (event.keyCode === 27) {
                        return false
                    }
                }

                event.preventDefault()
                $.dispatch(this.overlay, 'cancel')
            }

        }
    }

    // -- Getters & Setters --

    get buttons() {
        return this._dom.buttons
    }

    get content() {
        return this._dom.content
    }

    get overlay() {
        return this._dom.overlay
    }

    // -- Public methods --

    /**
     * Add a button to the overlay.
     */
    addButton(css, eventType) {

        // Create the button
        const buttonElm = $.create(
            'div',
            {'class': Overlay.css[css]}
        )

        // Add event handlers
        $.listen(
            buttonElm,
            {
                'click': (event) => {
                    event.preventDefault()
                    $.dispatch(this.overlay, eventType)
                }
            }
        )

        // Add the button to the buttons container
        this.buttons.appendChild(buttonElm)

        return buttonElm
    }

    /**
     * @@ Remove the overlay.
     */
    destroy () {

    }

    /**
     * Hide the overlay (and its contents).
     */
    hide() {

    }

    /**
     * Initialize the overlay.
     */
    init(css) {
        // Create the overlay element
        this._dom.overlay = $.create(
            'div',
            {'class': [Overlay.css['overlay'], css].join(' ')}
        )

        // Create the close element
        this._dom.close = $.create('div', {'class': Overlay.css['close']})
        this.overlay.appendChild(this._dom.close)

        // Create a component for mounting content in
        this._dom.content = $.create('div', {'class': Overlay.css['content']})
        this.overlay.appendChild(this._dom.content)

        // Create a component for mounting buttons in
        this._dom.buttons = $.create('div', {'class': Overlay.css['buttons']})
        this.overlay.appendChild(this._dom.buttons)

        // Add the overlay to the page
        document.body.appendChild(this.overlay)

        // Set-up event handlers
        $.listen(document, {'keydown': this._handlers.cancel})
        $.listen(this._dom.close, {'click': this._handlers.cancel})
    }

    /**
     * Show the overlay (and its contents).
     */
    show() {

    }

}


// -- CSS classes --

Overlay.css = {

    /**
     * Applied to the buttons container within the overlay.
     */
    'buttons': 'mh-overlay__buttons',

    /**
     * Applied to the okay button.
     */
    'cancel': 'mh-overlay__cancel',

    /**
     * Applied to the content container within the overlay.
     */
    'content': 'mh-overlay__content',

    /**
     * Applied to the close button.
     */
    'close': 'mh-overlay__close',

    /**
     * Applied to the okay button.
     */
    'okay': 'mh-overlay__okay',

    /**
     * Applied to the overlay element.
     */
    'overlay': 'mh-overlay',

    /**
     * Applied to the rotate button.
     */
    'rotate': 'mh-overlay__rotate'

}
