
/**
 * Format the size of a file in bytes to use common units.
 */
export function formatBytes(bytes) {
    if (bytes === 0) {
        return '0 bytes'
    }
    const units = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pb']
    const unit = Math.floor(Math.log(bytes) / Math.log(1024))
    const size = parseFloat((bytes / Math.pow(1024, unit)).toFixed(1))
    return `${size} ${units[unit]}`
}
