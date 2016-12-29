$ = require 'manhattan-essentials'


class Monitor

    # The `Monitor` class provides a progress monitor UI for asset uploads.

    constructor: (uploader, upload) ->

        # The uploader responsible for uploading the asset
        @_uploader = uploader

        # The upload being monitored
        @_upload = upload

        # Domain for related DOM elements
        @_dom = {}

        # Create a base element for the monitor
        @_dom.monitor = $.create('div', {'class': @_bem('mh-assets-monitor')})
        @_template()

        # Define read-only properties
        Object.defineProperty(this, 'uploader', {value: @_uploader})
        Object.defineProperty(this, 'upload', {value: @_upload})
        Object.defineProperty(this, 'monitor', {value: @_dom.monitor})

        # Template the monitor
        @_template()

        # Listen for upload progress events
        $.listen @uploader.input
            'mh-assets--upload-progress': (ev) =>
                # We're only interested in events for the upload we're
                # monitoring.
                if ev.ref != @upload
                    return

                # Update the width of the progress bar
                @_dom.progress.style['width'] = "#{ev.progress * 100}%"

            'mh-assets--upload-end': (ev) =>
                # We're only interested in events for the upload we're
                # monitoring.
                if ev.ref != @upload
                    return

                # Flag that the upload being monitored is complete
                @monitor.classList.add(
                    @_bem('mh-asset-monitor', '', 'complete'))

                # Dispatch a complete event
                $.dispatch(@monitor, @_et('monitor-complete'))

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

    _template: () ->
        # Add the basic DOM elements required to view an asset

        # Gauge & Progress
        @_dom.gauge = $.create(
            'div',
            {'class': @_bem('mh-asset-monitor', 'gauge')}
            )
        @view.appendChild(@_dom.gauge)

        @_dom.progress = $.create(
            'div',
            {'class': @_bem('mh-asset-monitor', 'progress')}
            )
        @_dom.gauge.appendChild(@_dom.progress)

        # Cancel
        @_dom.cancel = $.create(
            'div',
            {'class': @_bem('mh-asset-monitor', 'cancel')}
            )
        @_dom.content.appendChild(@_dom.cancel)

        $.listen @_dom.cancel,
            'click': (ev) =>
                ev.preventDefault()

                # Dispatch a remove asset event against the view
                $.dispatch(@view, @_et('cancel'), {upload: @upload})


module.exports = {Monitor: Monitor}