$ = require 'manhattan-essentials'


class Viewer

    # The `Viewer` class provides a UI to manage uploaded assets (temporary or
    # permenant).

    constructor: (asset) ->

        # The asset being viewed
        @_asset = asset

        # Domain for related DOM elements
        @_dom = {}

        # Create a base element for the view
        @_dom.view = $.create('div', {'class': @_bem('mh-assets-view')})

        # Define read-only properties
        Object.defineProperty(this, 'asset', {value: @_asset})
        Object.defineProperty(this, 'view', {value: @_dom.view})

        # Template and populate the view
        @_template()
        @_populate()

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

    _populate: () ->
        # Populate the view with the asset's details

        # Flag the type of asset being viewed with a CSS modifier
        if @asset.type is 'image'
            @view.classList.add(@_bem('mh-asset-view', '', 'image'))
        else
            @view.classList.add(@_bem('mh-asset-view', '', 'file'))

        # Set the content for the asset based on type
        if @asset.type is 'image'
            @_dom.thumb.style['background-image'] = "url(#{@asset.urls.thumb})"
        else
            @_dom.icon.setAttribute('data-mh-content-type', @asset.contentType)

        # Set the information about the asset
        @_dom.filename.textContent = @asset.filename
        if @asset.meta['length']

            # Convert to kb
            size = @asset.meta['length'] / 1000
            unit = 'kb'

            if size > 1000
                # Convert to mb
                size = @asset.meta['length'] / 1000
                unit = 'mb'

            # Format the string to include commas
            size = size.toFixed(1)
            size = size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

            @_dom.fileSize.textContent = "#{size}#{unit}"

        # Set the assets download link
        @_dom.download.setAttribute('href', @asset.urls.origin)

    _template: () ->
        # Add the basic DOM elements required to view an asset

        # Content
        @_dom.content = $.create(
            'div',
            {'class': @_bem('mh-asset-view', 'content')}
            )
        @view.appendChild(@_dom.content)

        # Content > Icon
        @_dom.icon = $.create(
            'div',
            {'class': @_bem('mh-asset-view', 'icon')}
            )
        @_dom.content.appendChild(@_dom.icon)

        # Content > Thumb
        @_dom.icon = $.create(
            'div',
            {'class': @_bem('mh-asset-view', 'thumb')}
            )
        @_dom.content.appendChild(@_dom.icon)

        # Info
        @_dom.info = $.create(
            'div',
            {'class': @_bem('mh-asset-view', 'info')}
            )
        @view.appendChild(@_dom.info)

        # Info > Filename
        @_dom.filename = $.create(
            'div',
            {'class': @_bem('mh-asset-view', 'filename')}
            )
        @_dom.info.appendChild(@_dom.filename)

        # Info > File size
        @_dom.fileSize = $.create(
            'div',
            {'class': @_bem('mh-asset-view', 'file-size')}
            )
        @_dom.info.appendChild(@_dom.fileSize)

        # Actions
        @_dom.actions = $.create(
            'div',
            {'class': @_bem('mh-asset-view', 'actions')}
            )
        @view.appendChild(@_dom.actions)

        # Actions > Download
        @_dom.download = $.create('a', {'download': true, 'target': '_blank'})
        @_dom.download.classList.add(@_bem('mh-asset-view', 'action'))
        @_dom.download.classList.add(
            @_bem('mh-asset-view', 'action', 'download'))
        @_dom.download.textContent = 'Download'
        @_dom.actions.appendChild(@_dom.download)

        # Actions > Remove
        @_dom.remove = $.create('a', {'href': '#'})
        @_dom.remove.classList.add(@_bem('mh-asset-view', 'action'))
        @_dom.remove.classList.add(
            @_bem('mh-asset-view', 'action', 'remove'))
        @_dom.remove.textContent = 'Remove'
        @_dom.actions.appendChild(@_dom.remove)

        $.listen @_dom.remove,
            'click': (ev) =>
                ev.preventDefault()

                # Dispatch a remove asset event against the view
                $.dispatch(@view, @_et('remove'), {asset: @asset})


module.exports = {Viewer: Viewer}