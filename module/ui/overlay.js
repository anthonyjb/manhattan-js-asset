import * as $ from 'manhattan-essentials'


// -- Class definition --

/**
 * A  overlay component on top of which floating in-page UIs are built.
 *
 */

export class Overlay {

    constructor() {

        // The state of overlay (hidden, visible, inTransition)
        this._state = 'hidden'

        // Domain for related DOM elements
        this._dom = {
            'buttons': null,
            'close': null,
            'content': null,
            'overlay': null,
        }

        // TODO: Set up event handlers
    }

    // -- Getters & Setters --

    get overlay() {
        return this._dom.overlay
    }

    // -- Public methods --

    /**
     * Hide the overlay (and its contents).
     */
    hide() {

    }

    /**
     * Initialize the overlay.
     */
    init() {
        const cls = this.constructor

        // Create the overlay element
        this._dom.overlay = $.create('div', {'class': cls.css['overlay']})

        // Create the close element
        this._dom.close = $.create('div', {'class': cls.css['close']})
        this.overlay.appendChild(this._dom.close)

        // Create a component for mounting content in
        this._dom.content = $.create('div', {'class': cls.css['content']})
        this.overlay.appendChild(this._dom.content)

        // Create a component for mounting buttons in
        this._dom.buttons = $.create('div', {'class': cls.css['buttons']})
        this.overlay.appendChild(this._dom.buttons)

        // Add the overlay to the page
        document.body.appendChild(this.overlay)
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
    'content': 'mh-overlay__content',

    /**
     * Applied to the close button.
     */
    'close': 'mh-overlay__close',

    /**
     * Applied to the content container within the overlay.
     */
    'buttons': 'mh-overlay__buttons',

    /**
     * Applied to the overlay element.
     */
    'overlay': 'mh-overlay'

}
