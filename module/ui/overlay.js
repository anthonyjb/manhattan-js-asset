import * as $ from 'manhattan-essentials'


// -- Class definition --

/**
 * An overlay UI component on top of which floating in-page UIs are built.
 */

export class Overlay {

    constructor(transitionDuration=250) {

        // The duration between transitioning the overlay from a hidden to
        // visible state.
        this._transitionDuration = transitionDuration

        // Flag indicating if the overlay is transitioning between hidden and
        // visible state.
        this._transitioning = false

        // Flag indicating if the overlay is visible
        this._visible = false

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
                // Make sure the event was triggered by pressing the escape
                // key being pressed.
                if (event.keyCode === 27) {
                    event.preventDefault()
                    $.dispatch(this.overlay, 'cancel')
                }
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

    get visible() {
        return this._visible
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
     * Remove the overlay.
     */
    destroy () {
        // Remove event listeners
        $.ignore(document, {'keydown': this._handlers.cancel})

        // Allow the body to scroll again
        document.body.style.overflow = null

        // Remove the overlay
        if (this.overlay) {
            document.body.removeChild(this.overlay)
        }

        // Clear DOM references
        this._dom.buttons = null
        this._dom.close = null
        this._dom.content = null
        this._dom.overlay = null
    }

    /**
     * Hide the overlay (and its contents).
     */
    hide() {

        // Ignore the request if the overlay is transitioning or is already
        // hidden.
        if (this._transitioning || !this.visible) {
            return
        }

        // Remove the visible modifier
        this.overlay.classList.remove(Overlay.css['visible'])

        // Flag that the overlay is transitioning to the new state
        this._transitioning = true

        setTimeout(
            () => {
                // Once the transition is complete flag that the overlay is no
                // longer transitioning and that the overlay is now hidden.
                this._transitioning = false
                this._visible = true

                // Dispatch a hidden event against the overlay
                $.dispatch(this.overlay, 'hidden')
            },
            this._transitionDuration
        )

    }

    /**
     * Initialize the overlay.
     */
    init(css) {
        // Reset the transitioning and visible states
        this._transitioning = false
        this._visible = false

        // Create the overlay element
        this._dom.overlay = $.create(
            'div',
            {'class': [Overlay.css['overlay'], css].join(' ')}
        )
        // Create a component for mounting content in
        this._dom.content = $.create('div', {'class': Overlay.css['content']})
        this.overlay.appendChild(this._dom.content)

        // Create a component for mounting buttons in
        this._dom.buttons = $.create('div', {'class': Overlay.css['buttons']})
        this.overlay.appendChild(this._dom.buttons)

        // Add the overlay to the page
        document.body.appendChild(this.overlay)

        // Prevent the page from scrolling whilst the overlay is open
        document.body.style.overflow = 'hidden'

        // Set-up event handlers
        $.listen(document, {'keydown': this._handlers.cancel})

        // HACK: Force the browser to recognize the overlay element (allows
        // transitions to run against the overlay element if shown straight
        // after init).
        //
        // ~ Anthony Blackshaw, <ant@getme.co.uk>, 27 May 2018
        window.getComputedStyle(this.overlay).opacity
    }

    /**
     * Show the overlay (and its contents).
     */
    show() {

        // Ignore the request if the overlay is transitioning or is already
        // visible.
        if (this._transitioning || this.visible) {
            return
        }

        // Apply the visible modifier
        this.overlay.classList.add(Overlay.css['visible'])

        // Flag that the overlay is transitioning to the new state
        this._transitioning = true

        setTimeout(
            () => {
                // Once the transition is complete flag that the overlay is no
                // longer transitioning and that the overlay is now visible.
                this._transitioning = false
                this._visible = true

                // Dispatch a visible event against the overlay
                $.dispatch(this.overlay, 'visible')

            },
            this._transitionDuration
        )
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
    'rotate': 'mh-overlay__rotate',

    /**
     * Applied to the overlay when visible.
     */
    'visible': 'mh-overlay--visible'
}
