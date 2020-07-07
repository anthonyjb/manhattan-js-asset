/**
 * A set of factories for creating behaviours common to file field/gallery
 * components and aimed at integration with the manhattan framework.
 */

import * as $ from 'manhattan-essentials'

import {ResponseError} from './../../errors'
import {Acceptor} from './../../ui/acceptor'
import {Metadata} from './../../ui/metadata'
import {formatBytes} from './../formatting'

/**
 * Convert transforms from manhattan server format to manhattan client
 * format.
 */
export function transformsToClient(transforms) {
    const convertedTransforms = []
    for (let transform of transforms) {
        switch (transform.id) {

        case 'image.rotate':
            convertedTransforms.push(['rotate', transform.settings.angle])
            break

        case 'image.crop':
            convertedTransforms.push([
                'crop',
                [
                    [
                        transform.settings.left,
                        transform.settings.top
                    ],
                    [
                        transform.settings.right,
                        transform.settings.bottom
                    ]
                ]
            ])
            break

        // no default
        }
    }
    return convertedTransforms
}

/**
 * Convert transforms from manhattan client format to manhattan server
 * format.
 */
export function transformsToServer(transforms) {
    const convertedTransforms = []
    for (let transform of transforms) {
        switch (transform[0]) {

        case 'rotate':
            convertedTransforms.push({
                'id': 'image.rotate',
                'settings': {'angle': transform[1]}
            })
            break

        case 'crop':
            convertedTransforms.push({
                'id': 'image.crop',
                'settings': {
                    'top': transform[1][0][1],
                    'left': transform[1][0][0],
                    'bottom': transform[1][1][1],
                    'right': transform[1][1][0]
                }
            })
            break

        // no default
        }
    }
    return convertedTransforms
}

/**
 * Manhattan get function for assets (don't use directly as a behaviour, it's
 * designed to be used inside a behaviour).
 */
export function getAssetProp(_asset, options, name, value) {
    const transforms = []

    switch (name) {

    case 'alt':
        return _asset['user_meta']['alt'] || ''

    case 'contentType':
        return _asset['content_type']

    case 'downloadURL':
        return _asset['url']

    case 'editingURL':
        return _asset['variations'][options.editing].url

    case 'filename':
        return _asset['filename']

    case 'fileLength':
        return formatBytes(_asset['core_meta']['length'])

    case 'imageMode':
        return _asset['core_meta']['image']['mode']

    case 'imageSize':
        return _asset['core_meta']['image']['size'].join(' x ')

    case 'previewURL':
        if (_asset['preview_uri']) {
            return _asset['preview_uri']
        }
        return _asset['variations'][options.preview].url

    case 'transforms':
        return transformsToClient(_asset['base_transforms'])

    case 'url':
        return _asset.url

    // no default

    }

    return ''
}

/**
 * Manhattan set function for assets (don't use directly as a behaviour, it's
 * designed to be used inside a behaviour).
 */
export function setAssetProp(_asset, options, name, value) {
    const transforms = []

    switch (name) {

    case 'alt':
        _asset['user_meta']['alt'] = value
        return value

    case 'previewURL':
        _asset['preview_uri'] = value
        return value

    case 'transforms':
        _asset['base_transforms'] = transformsToServer(value)
        return value

    // no default

    }

    return ''
}

export function asset() {

    /**
     * Return the asset value from the payload.
     */
    function _asset(inst, response) {
        const {payload} = JSON.parse(response)

        // Check for a valid asset response
        if (payload.asset) {
            return payload.asset
        }

        // Check for an reason there's no asset
        if (payload.reason) {
            throw new ResponseError(payload.reason)
        }

        throw new ResponseError('Unable to accept this file')
    }

    return _asset
}

export function assetProp(assetAttr, optionsAttr) {

    /**
     * Get/Set behaviour for asset properties.
     */
    function _assetProp(inst, action, name, value) {
        const _asset = inst[assetAttr]
        const options = inst[optionsAttr]

        if (action === 'set') {
            return setAssetProp(_asset, options, name, value)
        }
        return getAssetProp(_asset, options, name)
    }

    return _assetProp
}

export function metadata(optionsAttr) {

    /**
     * Return the a Metadata instance.
     */
    function _metadata(inst) {
        const options = inst[optionsAttr]

        const getProp = (prop) => {
            return inst.getAssetProp(prop)
        }

        // Build the props for the Metadata instance
        const props = [
            ['Filename', 'filename', getProp('filename'), true],
            ['Content type', 'contentType', getProp('contentType'), true],
            ['File size', 'fileLength', getProp('fileLength'), true]
        ]

        if (options.fileType === 'image') {
            props.push(['Mode', 'imageMode', getProp('imageMode'), true])
            props.push(['Size', 'imageSize', getProp('imageSize'), true])
            props.push(['Alt', 'alt', getProp('alt'), false])

        } else if (options.fileType === 'svg_image') {
            props.push(['Alt', 'alt', getProp('alt'), false])
        }

        return new Metadata(props)
    }

    return _metadata
}
