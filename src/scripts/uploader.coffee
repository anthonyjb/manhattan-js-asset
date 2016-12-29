$ = require 'manhattan-essentials'

Asset = require('./asset.coffee').Asset


class Uploader

    # The `Uploader` class manages the process of uploading new assets to a
    # manhattan application instance.

    constructor: (input, options={}) ->

        # Domain for related DOM elements
        @_dom = {}

        # The file input used to collect file data from the user
        @_dom.input = input
        @_dom.input.__mh_assets_uploader = this

        # A table of all currently active XMLHttpRequest instances (those
        # uploading files.
        @_uploads = {}

        # A list of queued files waiting to be uploaded
        @_queued_uploads = []

        # Define read-only properties
        Object.defineProperty(this, 'input', {value: @_dom.input})
        Object.defineProperty(
            this,
            'uploadCount',
            {get: () => return (ref for ref, _ of @_uploads).length}
            )

        # Configure the instance
        $.config(
            this,
            {
                # If true then the uploader will attempt to upload any number of
                # files on a change event, if false then the uploader will only
                # attempt to upload the first file.
                allowMultiple: false,

                # The end-point where files are uploaded to
                endpoint: '/cms/upload-asset',

                # The maximum number of uploads allowed at any given time
                maxConcurrentUploads: 2
            },
            options
            )

        # Set up and configure behaviours
        @_behaviours = {}

        $.config(
            @_behaviours,
            {
                formData: 'manhattan',
                response: 'manhattan'
            },
            options
            )

        # If multiple uploads are allowed then add the `multiple` attribute to
        # the input field
        if @allowMultiple
            @input.setAttribute('multiple', true)

        # Add event handlers for the input
        $.listen @input,
            'change': (ev) =>
                # Upload the file(s)
                if @allowMultiple
                    for file in ev.target.files
                        @_upload(file)
                else
                    @_upload(ev.target.files[0])

                # Clear the input's value to ensure the same file can be
                # re-uploaded this session if the user desires.
                @input.value = ''
                if @input.value
                    # HACK: Can't clear the file field value in IE as it's a
                    # read-only attribute. Toggling the type to text and back
                    # resolves this.
                    #
                    # Anthony Blackshaw <ant@getme.co.uk>, 28 December 2016
                    @input.type = 'text'
                    @input.type = 'file'

    # Public methods

    cancel: (ref) ->
        # Cancel the referenced upload, or if no reference is provided then
        # cancel all uploads.
        if ref
            # Cancel referenced upload
            if @_uploads[ref]
                ref.abort()
        else
            # Cancel all uploads
            for req, _ of uploads
                req.abort()

    progress: (ref) ->
        # Return the progress for the referenced upload, or if no reference is
        # provided then the return the overall progress for all uploads.
        if ref
            # Return the progress for the referenced upload
            if @_uploads[ref]
                return @_uploads[ref].progress

        else
            # Return the progress for all uploads
            progress = 0
            for _, info of uploads
                progress += info.progress
            return progress / Math.max(1, @uploadCount)

    # Private methods

    _clear: (ref) ->
        # Clear the referenced upload from the table of uploads and start the
        # next queued upload if there is one.

        # Clear the upload from the active uploads table
        if @_uploads[ref]
            delete @_uploads[ref]

        # Check for any queued uploads and upload them
        if @_queued_uploads.length > 0
            queued = @_queued_uploads.shift()
            @_start_upload(queued[0], queued[1])

        # Dispatch an end event
        $.dispatch(@input, @_et('upload-end'), {'ref': ref})

    _start_upload: (req, formData) ->
        # Start the referenced upload

        # Add the upload to the uploads table
        @_uploads[req] = {'progress': 0}

        # Dispatch a start event
        $.dispatch(@input, @_et('upload-start'), {'ref': req})

        # Start the upload
        req.open('POST', @endpoint, true)
        req.send(formData)

    _et: (eventName) ->
        # Generate an event type name
        return "mh-assets--#{eventName}"

    _on_abort: (ref) ->
        # Handle an aborted upload
        if not @_uploads[ref]
            return

        # Dispatch an abort event
        $.dispatch(@input, @_et('upload-abort'), {'ref': ref})

        @_clear(ref)

    _on_error: (ref, reason='') ->
        # Handle an error while upload
        if not @_uploads[ref]
            return

        # Dispatch an error event
        $.dispatch(@input, @_et('upload-error'), {'ref': ref, 'reason': reason})

        @_clear(ref)

    _on_progress: (ref, progress) ->
        # Handle a progress update for an upload

        # Check the upload is active
        if not @_uploads[ref]
            return

        # Update the progress
        @_uploads[ref].progress = progress

        # Dispatch a progress event
        $.dispatch(
            @input,
            @_et('upload-progress'),
            {'ref': ref, 'progress': progress}
            )

    _on_success: (ref, asset) ->
        # Handle a successful upload
        if not @_uploads[ref]
            return

        # Dispatch a success event
        $.dispatch(@input, @_et('upload-success'), {'ref': ref, 'asset': asset})

        @_clear(ref)

    _upload: (file) ->
        # Upload a file

        # Build the payload for the request
        behaviourName = @_behaviours.formData
        behaviour = @constructor.behaviours.formData[behaviourName]
        formData = behaviour(this, file)

        # Create a request for the file to be upload
        req = new XMLHttpRequest()

        # Monitor progress of the upload
        on_progress = (uploader, req) ->
            return (ev) ->
                uploader._on_progress(req, ev.loaded / ev.total)

        req.upload.addEventListener('progress', on_progress(this, req))

        # Handle the end of the upload

        # Load
        on_load = (uploader, req) ->
            return (ev) ->
                # Attempt to parse the response
                res = ev.target.responseText
                behaviourName = uploader._behaviours.response
                behaviours = uploader.constructor.behaviours
                behaviour = behaviours.response[behaviourName]
                assetOrError = behaviour(this, req.responseText)

                # Handle the response
                if assetOrError instanceof Asset
                    uploader._on_success(req, assetOrError)
                else
                    uploader._on_error(req, assetOrError.message)

        req.addEventListener('load', on_load(this, req))

        # Error
        on_error = (uploader, req) ->
            return (ev) ->
                uploader._on_error(req)

        req.addEventListener('error', on_error(this, req))

        # Abort
        on_abort = (uploader, req) ->
            return (ev) ->
                uploader._on_abort(req)

        req.addEventListener('abort', on_abort(this, req))

        # Check if the maximum upload limit has been met
        if @uploadCount < @maxConcurrentUploads
            # Start the upload
            @_start_upload(req, formData)

        else
            # Queue the upload
            @_queued_uploads.push([req, formData])

    @behaviours:

        # The `formData` behaviour is used to build the `FormData` instance sent
        # to the server containing the file.
        formData:
            'manhattan': (uploader, file) ->
                # In the default scenario we attach the file against the `file`
                # parameter and look for a CSRF token to include
                formData = new FormData()
                formData.append('file', file)

                # Look for a CSRF token to include with the form data
                crsfToken = $.one("[name='crsf_token']", uploader.input.form)
                if crsfToken
                    formData.append('crsf_token', crsfToken.value)

                return formData

        # The `response` behaviour is used to parse the remote response to a
        # file upload. The behaviour must return either an asset or an error if
        # the upload has failed.
        response:
            'manhattan': (uploader, raw_res) ->
                # By default we expect the result to use the manhattan response
                # format.
                res = JSON.parse(raw_res)
                if res.status is 'success'
                    return Asset.fromJSONType(res.payload.asset)
                else
                    return new Error(res.payload.reason)


module.exports = {Uploader: Uploader}