/**
 * A set of factories for creating behaviours common to file field/gallery
 * components and aimed at integration with the manhattan framework.
 */

import * as $ from 'manhattan-essentials'

import {ResponseError} from './../../errors'
import {Acceptor} from './../../ui/acceptor'
import {Metadata} from './../../ui/metadata'
import {formatBytes} from './../formatting'


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
        const transforms = []

        switch (name) {

        case 'alt':
            if (action === 'set') {
                _asset['user_meta']['alt'] = value
                return value
            }
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
            if (action === 'set') {
                _asset['preview_uri'] = value
                return value
            }
            if (_asset['preview_uri']) {
                return _asset['preview_uri']
            }

            console.log(options.preview)

            return _asset['variations'][options.preview].url

        case 'transforms':

            // Set transforms
            if (action === 'set') {
                for (let transform of value) {
                    switch (transform[0]) {

                    case 'rotate':
                        transforms.push({
                            'id': 'image.rotate',
                            'settings': {'angle': transform[1]}
                        })
                        break

                    case 'crop':
                        transforms.push({
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
                _asset['base_transforms'] = transforms
                return value
            }

            // Get transforms
            for (let transform of _asset['base_transforms']) {
                switch (transform.id) {

                case 'image.rotate':
                    transforms.push(['rotate', transform.settings.angle])
                    break

                case 'image.crop':
                    transforms.push([
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
            return transforms

        case 'url':
            return _asset.url

        // no default

        }

        return ''
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
