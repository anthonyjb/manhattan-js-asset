Acceptor = require('./asset.coffee').Acceptor
Asset = require('./asset.coffee').Asset
Monitor = require('./monitor.coffee').Monitor
Uploader = require('./uploader.coffee').Uploader
Viewer = require('./uploader.coffee').Viewer


class Field

    # The `Field` class converts an native HTML field (typically an input field)
    # into a field that can be used to upload assets.
    #
    # NOTE: To upload/manage multiple assets against see the `Gallery` class.

    constructor: (input, options={}) ->

        # Domain for related DOM elements
        @_dom = {}

        # Store a reference to the input the asset field is being created for
        # (we also store a reverse reference to this instance against the
        # input).
        @_dom.input = input
        @_dom.input.__mh_typeahead = this




# - Hide the existing input field using CSS
# - Add a DOM element that provide support for uploading an element and while
#   uploading shows the upload progress and provides the option to cancel it.


module.exports = {Field: Field}