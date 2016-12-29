$ = require 'manhattan-essentials'


class Acceptor

    # The `Acceptor` class provides a component for accepting files to upload.

    # The counter is used to provide a session unique Id for each acceptor (used
    # for the `input` fields name) through simple increments.
    @_counter: 0

    constructor: (label='Select a file...') ->

        # Domain for related DOM elements
        @_dom = {}

        # Create the acceptor
        @_dom.acceptor = $.create('div', {'class': @_bem('mh-assets-acceptor')})
        @_dom.input = $.create('input', {
            'class': @_bem('mh-assets-acceptor', 'input')
            'type': 'file',
            'name': "acceptor__#{@_newId()}"
            })
        @_dom.acceptor.appendChild(@_dom.input)

        @_dom.label = $.create('div', {
            'class': @_bem('mh-assets-acceptor', 'label')})
        @_dom.label.textContent = label
        @_dom.acceptor.appendChild(@_dom.label)

        # Define read-only properties
        Object.defineProperty(this, 'acceptor', {value: @_dom.acceptor})
        Object.defineProperty(this, 'input', {value: @_dom.input})

    # Private methods

    _bem: (block, element='', modifier='') ->
        # Build and return a class name
        name = block
        if element
            name = "#{name}__#{element}"
        if modifier
            name = "#{name}--#{modifier}"
        return name

    _newId: () ->
        # Return a new session unique Id
        Acceptor._counter += 1
        return Acceptor._counter


module.exports = {Acceptor: Acceptor}