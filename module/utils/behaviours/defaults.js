/**
 * A set of factories for creating behaviours common to file field/gallery
 * components.
 */

import * as $ from 'manhattan-essentials'

import {Acceptor} from './../../ui/acceptor'
import {ImageEditor} from './../../ui/image-editor'
import {Uploader, defaultStatusTemplate} from './../../ui/uploader'
import {FileViewer, ImageViewer} from './../../ui/viewers'


// Factories

export function acceptor(containerAttr, multiple) {

    /**
     * Return an Acceptor instance.
     */
    function _acceptor(inst) {
        return new Acceptor(
            inst[containerAttr],
            `${inst.input.name}__acceptor`,
            inst._options.label,
            inst._options.dropLabel,
            inst._options.allowDrop,
            inst._options.accept,
            multiple
        )
    }

    return _acceptor
}

export function formData() {

    /**
     * Return the minimal FormData instance required to upload a file.
     */
    function _formData(inst, file, version) {
        const data = new FormData()
        data.append('file', file)

        if (version) {
            data.append('version', version)
        }

        return data
    }

    return _formData
}

export function imageEditor(optionsAttr) {

    function _imageEditor(inst) {
        const options = inst[optionsAttr]

        return new ImageEditor(
            inst.getAssetProp('editingURL'),
            inst.getAssetProp('transforms'),
            options.cropAspectRatio,
            options.fixCropAspectRatio,
            options.maxPreviewSize
        )
    }

    return _imageEditor
}

export function uploader(containerAttr, semaphoreAttr=null) {

    /**
     * Return an Uploader instance.
     */
    function _uploader(inst, endpoint, data) {
        let semaphore = null
        if (semaphoreAttr) {
            semaphore = inst[semaphoreAttr]
        }

        return new Uploader(
            inst[containerAttr],
            endpoint,
            data,
            'horizontal',
            defaultStatusTemplate,
            semaphore
        )
    }

    return _uploader
}

export function viewer(containerAttr, optionsAttr) {

    /**
     * Return the default viewer configuration.
     */
    function _viewer(inst) {
        switch (inst[optionsAttr].fileType) {

        case 'file':
            return new FileViewer(
                inst[containerAttr],
                inst.getAssetProp('filename'),
                inst.getAssetProp('fileLength')
            )

        case 'image':
            return new ImageViewer(
                inst[containerAttr],
                inst.getAssetProp('previewURL')
            )

        case 'svg_image':
            return new ImageViewer(
                inst[containerAttr],
                inst.getAssetProp('url'),
                {
                    'download': true,
                    'metadata': true,
                    'remove': true
                }
            )

        // no default

        }

        return null
    }

    return _viewer
}
