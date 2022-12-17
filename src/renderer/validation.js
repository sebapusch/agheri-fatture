
/**
 * Determines if is valid number and is gt then passed value
 * 
 * @param {number} then 
 * @param {any} value 
 * @returns {boolean}
 */
function gt(value, then) {
    if (typeof value !== 'number') {
        return false;
    }

    if (value <= then) {
        return false;
    }

    return true;
}

export { gt };