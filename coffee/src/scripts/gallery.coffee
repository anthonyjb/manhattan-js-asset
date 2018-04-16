$ = require 'manhattan-essentials'
Sortable = require('manhattan-sortable').Sortable

Acceptor = require('./acceptor.coffee').Acceptor
Asset = require('./asset.coffee').Asset
Monitor = require('./monitor.coffee').Monitor
Uploader = require('./uploader.coffee').Uploader
Viewer = require('./viewer.coffee').Viewer


class Gallery

    # The `Gallery` class implements a UI for managing multiple assets
    # (typcially via a hidden field) including:
    #
    # - Upload asset
    # - Update asset
    # - Remove asset
    # - Order assets
    #
    # NOTE: To upload/manage single assets against see the `Field` class.

    # The prefix that identifies attributes used to configure the plugin
    @clsPrefix: 'data-mh-asset-gallery--'

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

        # A list of assets in the gallery
        @_assets = []

        # Domain for related DOM elements
        @_dom = {}

        # Store a reference to the input the asset gallery is being created for
        # (we also store a reverse reference to this instance against the
        # input).
        @_dom.input = input
        @_dom.input.__mh_asset_gallery = this

        # Create a DOM element for the gallery as a sibling of the input field
        @_dom.gallery = $.create('div', {'class': @_bem('mh-asset-gallery')})
        input.parentNode.insertBefore(@_dom.gallery, input)

        # Create a DOM element for the assets within the gallery to be viewed
        @_dom.assetsView = $.create(
            'div',
            {'class': @_bem('mh-asset-gallery__assets-view')}
        )
        @_dom.gallery.appendChild(@_dom.assetsView)

        # Create a DOM element for the file upload UI to sit within
        @_dom.uploadControl = $.create(
            'div',
            {'class': @_bem('mh-asset-gallery__upload-control')}
        )
        @_dom.gallery.appendChild(@_dom.uploadControl)

        # Define read-only properties
        Object.defineProperty(this, 'assets', {get: () => return @_assets})
        Object.defineProperty(this, 'assetsView', {value: @_dom.assetsView})
        Object.defineProperty(this, 'gallery', {value: @_dom.gallery})
        Object.defineProperty(this, 'input', {value: @_dom.input})
        Object.defineProperty(this, 'upload', {get: () => return @_upload})
        Object.defineProperty(
            this,
            'uploadControl',
            {value: @_dom.uploadControl}
        )

        # A table mapping assets to the viewer element that represents them
        @_assetViewers = {}

        # Check if the input field is populated and if so extract the assets
        initalAssets = []
        if @input.value
            for raw_asset in JSON.parse(@input.value)
                initalAssets.push(Asset.fromJSONType(raw_asset))

        # Add the initial assets to the gallery
        @addAssets(initalAssets)

        # A reference to the current file uploader
        @_uploader = null

        # A reference to the current upload request, if there is one
        @_upload = null

        # Update the galleries upload control
        @_updateUploadControl()

    # Methods

    addAsset: (asset) ->
        # Add the given asset to the gallery

        # Add the asset to the existing list of assets
        @_assets.push(asset)

        # Add the asset to the assets view
        viewer = new Viewer(asset)
        @_assetViewers[asset.key] = viewer

        # Handle asset events
        $.listen viewer.view,
            'mh-assets--remove-asset': (ev) =>
                @removeAsset(ev.asset)

        @assetsView.appendChild(viewer.view)

        # Sync the list of assets with the input field
        @_syncInput()

        # Enable sorting
        @_updateSorting()

        # Trigger an event
        $.dispatch(@input, @_et('change'), {asset: @asset})

    addAssets: (assets) ->
        # Add one or more assets to the gallery
        for asset in assets

            # Add the asset to the existing list of assets
            @_assets.push(asset)

            # Add the asset to the assets view
            viewer = new Viewer(asset)
            @_assetViewers[asset.key] = viewer

            # Handle asset events
            $.listen viewer.view,
                'mh-assets--remove-asset': (ev) =>
                    @removeAsset(ev.asset)

            @assetsView.appendChild(viewer.view)

        # Sync the list of assets with the input field
        @_syncInput()

        # Enable sorting
        @_updateSorting()

        # Trigger an event
        $.dispatch(@input, @_et('change'), {asset: @asset})

    removeAsset: (asset) ->
        # Remove the given asset from the gallery

        # Remove the asset from the gallery
        for existingAsset, i in @assets
            if asset.key == existingAsset.key
                @_assets.splice(i, 1)
                break

        # Sync the list of assets with the input field
        @_syncInput()

        # Enable sorting
        @_updateSorting()

        # Find and remove the asset from the assets view
        viewer = @_assetViewers[asset.key]
        if viewer
            @assetsView.removeChild(viewer.view)
            delete @_assetViewers[asset.key]

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

    _syncInput: () ->
        # Update the input field inline with the list of assets in the gallery
        assets = []
        for asset in @assets
            assets.push(asset.toJSONType())
        @input.value = JSON.stringify(assets)

    _updateSorting: () ->
        # Update the asset view so that assets can be sorted

        # Remove any existing sorting behaviour
        if @assetsView.__mh_sortable
            @assetsView.__mh_sortable.destroy()

        # If there's more than one asset add sortable behaviour
        if @assets.length > 1

            # Add sorting behaviour
            sortable = new Sortable(
                @assetsView,
                {axis: 'horizontal'}
            )

            $.listen sortable.container, 'mh-sortable--sorted': (ev) =>

                # Update the assets to be in the new order
                sortedAssets = []
                for child in ev.children
                    sortedAssets.push(child.__mh_viewer.asset)
                @_assets = sortedAssets

                # Sync the list of assets with the input field
                @_syncInput()

    _updateUploadControl: () ->
        # Update the upload control to reflect it's current state

        # Clear the existing state
        @uploadControl.innerHTML = ''

        # If we're currently upload a file add a monitor...
        if @upload
            monitor = new Monitor(@_uploader, @upload)
            @uploadControl.appendChild(monitor.monitor)

        # ...else add a file acceptor
        else
            acceptor = new Acceptor(@label)
            @uploadControl.appendChild(acceptor.acceptor)

            # Change the uploader inline with the acceptor
            @_uploader = new Uploader(acceptor.input, {endpoint: @endpoint})

            # Listen for and handle relevant upload events
            $.listen acceptor.input,
                'mh-assets--upload-abort': (ev) =>
                    @_upload = null
                    @_updateUploadControl()

                'mh-assets--upload-error': (ev) =>
                    @_upload = null
                    @_updateUploadControl()

                'mh-assets--upload-start': (ev) =>
                    @_upload = ev.ref
                    @_updateUploadControl()

                'mh-assets--upload-success': (ev) =>
                    @_upload = null
                    @_updateUploadControl()
                    @addAsset(ev.asset)


module.exports = {Gallery: Gallery}