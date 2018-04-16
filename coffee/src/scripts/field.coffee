$ = require 'manhattan-essentials'

Acceptor = require('./acceptor.coffee').Acceptor
Asset = require('./asset.coffee').Asset
Monitor = require('./monitor.coffee').Monitor
Uploader = require('./uploader.coffee').Uploader
Viewer = require('./viewer.coffee').Viewer


class Field

    # The `Field` class converts an native HTML field (typically an input field)
    # into a field that can be used to upload assets.
    #
    # NOTE: To upload/manage multiple assets against see the `Gallery` class.

    # The prefix that identifies attributes used to configure the plugin
    @clsPrefix: 'data-mh-asset-field--'

    constructor: (input, options={}) ->

        # Configure the instance
        $.config(
            this,
            {
                # The end-point where files are uploaded to
                endpoint: '/upload-asset',

                # The label that should be displayed in the file acceptor
                label: 'Select a file...'
            },
            options,
            input,
            @constructor.clsPrefix
            )

        # Domain for related DOM elements
        @_dom = {}

        # Store a reference to the input the asset field is being created for
        # (we also store a reverse reference to this instance against the
        # input).
        @_dom.input = input
        @_dom.input.__mh_asset_field = this

        # Create a DOM element for the field as a sibling of the input field
        @_dom.field = $.create('div', {'class': @_bem('mh-asset-field')})
        input.parentNode.insertBefore(@_dom.field, input)

        # Define read-only properties
        Object.defineProperty(this, 'asset', {
            get: () =>
                return @_asset

            set: (value) =>
                # Set the value
                @_asset = value

                # Update the value of the input
                if @_asset
                    @input.value = JSON.stringify(@_asset.toJSONType())
                else
                    @input.value = ''

                # Update the field state
                @_update()

                # Dispatch a change event
                $.dispatch(@input, @_et('change'), {asset: @asset})
            })
        Object.defineProperty(this, 'field', {value: @_dom.field})
        Object.defineProperty(this, 'input', {value: @_dom.input})
        Object.defineProperty(this, 'upload', {get: () => return @_upload})

        # Hide the input field
        @input.style['display'] = 'none'

        # Check if the input field is populated and if so extract the asset
        @_asset = null
        if @input.value
            @_asset = Asset.fromJSONType(JSON.parse(@input.value))

        # Set an uploader to upload file with
        @_uploader = null

        # A reference to the current upload request, if there is one
        @_upload = null

        # Update the field to reflect it's current state
        @_update()

    # Private methods

    _bem: (block, element='', modifier='') ->
        # Build and return a class name
        name = block
        if element
            name = "#{name}__#{element}"
        if modifier
            name = "#{name}--#{modifier}"
        return name

    _et: (eventName) ->
        # Generate an event type name
        return "mh-assets--#{eventName}"

    _update: () ->
        # Update the field to reflect it's current state

        # Clear the existing state
        @field.innerHTML = ''

        # If the field is populated add a viewer...
        if @asset
            viewer = new Viewer(@asset)

            # Handle asset events
            $.listen viewer.view,
                'mh-assets--remove-asset': () =>
                    @asset = null

            @field.appendChild(viewer.view)

        # ...else if the field is uploading a file add a monitor
        else if @upload
            monitor = new Monitor(@_uploader, @upload)
            @field.appendChild(monitor.monitor)

        # ...else add a file acceptor
        else
            acceptor = new Acceptor(@label)
            @field.appendChild(acceptor.acceptor)

            # Change the uploader inline with the acceptor
            @_uploader = new Uploader(acceptor.input, {endpoint: @endpoint})

            # Listen for and handle relevant upload events
            $.listen acceptor.input,
                'mh-assets--upload-abort': (ev) =>
                    @_upload = null
                    @_update()

                'mh-assets--upload-error': (ev) =>
                    @_upload = null
                    @_update()

                'mh-assets--upload-start': (ev) =>
                    @_upload = ev.ref
                    @_update()

                'mh-assets--upload-success': (ev) =>
                    @_upload = null
                    @asset = ev.asset


module.exports = {Field: Field}