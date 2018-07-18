
/**
 * Return a rect which represents the extent of movement of a one rect within
 * another.
 */
export function getExtents(rectA, rectB) {
    return [
        [
            rectB[0][0] - rectA[0][0],
            rectB[0][1] - rectA[0][1]
        ], [
            rectB[1][0] - rectA[1][0],
            rectB[1][1] - rectA[1][1]
        ]
    ]
}

/**
 * Return the height of the given rect ([[x1, y1], [x2, y2]]).
 */
export function getHeight(rect) {
    return Math.abs(rect[1][1] - rect[0][1])
}

/**
 * Return the width of the given rect ([[x1, y1], [x2, y2]]).
 */
export function getWidth(rect) {
    return Math.abs(rect[1][0] - rect[0][0])
}

/**
 * Return a rect with all values multipled by the given multiplier.
 */
export function multiply(rect, x) {
    return [
        [
            rect[0][0] * x,
            rect[0][1] * x
        ], [
            rect[1][0] * x,
            rect[1][1] * x
        ]
    ]
}

/**
 * Return a rect orientated to 0, 90, 180 or 270 degrees
 * ([[x1, y1], [x2, y2]]).
 */
export function orient(rect, orientation) {
    if (orientation === 90 || orientation === 270) {
        const width = getWidth(rect)
        const height = getHeight(rect)
        const center = [
            rect[0][0] + (width / 2),
            rect[0][1] + (height / 2)
        ]

        return [
            [
                center[0] - (height / 2),
                center[1] - (width / 2)
            ], [
                center[0] + (height / 2),
                center[1] + (width / 2)
            ]
        ]
    }

    return [
        rect[0].slice(),
        rect[1].slice()
    ]
}
