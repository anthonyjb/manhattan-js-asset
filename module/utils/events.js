
/**
 * Return the x/y position of a touch or mouse event.
 */
export function getEventPos(event) {
    if (typeof event.pageX === 'undefined') {
        return [event.touches[0].pageX, event.touches[0].pageX]
    }
    return [event.pageX, event.pageY]
}
