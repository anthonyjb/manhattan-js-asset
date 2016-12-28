

class Asset

    # The `Asset` class provides representation for assets within a class
    # structure.
    #
    # NOTE: Information about assets is typically sent and received in JSON
    # format and can be managed as simple native objects but the Asset class
    # simplifies this process and is recommended over this approach.

    constructor: (key, type, urls, coreMeta, userMeta) ->

        # A unique key for the asset
        @_key = key

        # The type of asset (file or image)
        @_type = type

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

        # A table of meta data describing the asset's core attributes
        @_coreMeta = coreMeta or {}

        # A table of used defined meta information for the assets
        @_userMeta = userMeta or {}

        # Define read-only properties for the asset
        Object.defineProperty(this, 'input', {value: @_dom.input})

    # I/O methods
    #
    # NOTE: Attribute names  use underscores and not camelCase as this is the
    # default conventions in manhattan applications.

    to_json_type: () ->
        # Return a JSON safe data object representing the asset
        return {
            'key': data.key,
            'type': data.type,
            'urls': data.urls,
            'core_meta': data.coreMeta,
            'user_meta': data.userMeta
            }

    @from_json_type: (data) ->
        # Return an Asset initialized using the given data.

        # Build the URLs for the asset
        urls = {'origin': data.url}

        if data.type is 'image'
            urls.draft = data.variations['--base--'].url
            urls.thumb = data.variations['--thumb--'].url

        return new Asset(
            data.key,
            data.type,
            urls,
            data.core_meta,
            data.user_meta
            )