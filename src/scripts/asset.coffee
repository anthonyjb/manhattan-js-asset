

class Asset

    # The `Asset` class provides representation for assets within a class
    # structure.
    #
    # NOTE: Information about assets is typically sent and received in JSON
    # format and can be managed as simple native objects but the Asset class
    # simplifies this process and is recommended over this approach.

    constructor: (key, filename, type, contentType, urls, coreMeta, userMeta) ->

        # A unique key for the asset
        @_key = key

        # The assets filename
        @_filename = filename

        # The type of asset (file or image)
        @_type = type

        # The asset's content type (e.g text/csv)
        @_contentType = contentType

        # A table of useful URLs for the asset, this typically includes:
        #
        # - 'origin' a URL the original asset can be retrieved from.
        #
        # For images assets only:
        #
        # - 'draft' a URL to a draft version of the asset suitable for using in
        #   image editing tools.
        # - 'thumb' a URL to a thumbnail of the asset can be retreived from.
        @_urls = urls

        # Meta data describing the asset
        @meta = new AssetMeta(coreMeta, userMeta)

        # Define read-only properties for the asset
        Object.defineProperty(this, 'key', {value: @_key})
        Object.defineProperty(this, 'filename', {value: @_filename})
        Object.defineProperty(this, 'type', {value: @_type})
        Object.defineProperty(this, 'contentType', {value: @_contentType})
        Object.defineProperty(this, 'urls', {
            get: () =>
                urls = {}
                for k, v of @_urls
                    urls[k] = v
                return urls
            })

    # I/O methods
    #
    # NOTE: Attribute names  use underscores and not camelCase as this is the
    # default conventions in manhattan applications.

    toJSONType: () ->
        # Return a JSON safe data object representing the asset
        return {
            'key': @key,
            'filename': @filename,
            'type': @type,
            'content_type': @contentType,
            'urls': @urls,
            'core_meta': @meta.getCoreMeta(),
            'user_meta': @meta.getUserMeta()
            }

    @fromJSONType: (data) ->
        # Return an Asset initialized using the given data.

        # Build the URLs for the asset
        urls = {'origin': data.url}

        if data.type is 'image'
            urls.draft = data.variations['--base--'].url
            urls.thumb = data.variations['--thumb--'].url

        return new Asset(
            data.key,
            data.filename,
            data.type,
            data.content_type
            urls,
            data.core_meta,
            data.user_meta
            )


class AssetMeta

    # The `AssetMeta` class provides a single interface to asset meta data held
    # against both the core and user meta data tables.

    constructor: (coreMeta, userMeta) ->

        # A table of meta data describing the asset's core attributes
        @_coreMeta = coreMeta or {}

        # A tabke of user defined meta data that overrides core meta data
        # attributes.
        @_coreOverrides = {}

        # Core meta data can't be set but it can be overridden by user defined
        # meta data. We define get properties get/set properties for all core
        # meta data properties.
        getter = (name) =>
            _this = this
            return () ->
                if _this._coreOverrides[name] != undefined
                    return _this._coreOverrides[name]
                if _this._coreMeta[name] != undefined
                    return _this._coreMeta[name]

        setter = (name) =>
            _this = this
            return (value) ->
                _this._coreOverrides[name] = value

        for name, _ of @_coreMeta
            Object.defineProperty(this, name, {
                get: getter(name),
                set: setter(name)
                })

        # User defined meta is store directly against the object
        for k, v of (userMeta or {})
            @[k] = v

    # Public methods

    getCoreMeta: () ->
        # Return the core meta data
        return JSON.parse(JSON.stringify(@_coreMeta))

    getUserMeta: () ->
        # Return the used defined meta data
        data = JSON.parse(JSON.stringify(@_coreOverrides))

        for k, v of this
            if @hasOwnProperty(k) and not @[k] instanceof Function
                data[k] = v

        return JSON.parse(JSON.stringify(data))


module.exports = {Asset: Asset}