# The index file acts simply to provide a main entry point for the package

Field = require('./field.coffee').Field
Gallery = require('./gallery.coffee').Gallery

module.exports = {
    Field: Field,
    Gallery: Gallery
}