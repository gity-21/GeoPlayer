/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param {number} lat1 - Latitude of point 1 (degrees)
 * @param {number} lng1 - Longitude of point 1 (degrees)
 * @param {number} lat2 - Latitude of point 2 (degrees)
 * @param {number} lng2 - Longitude of point 2 (degrees)
 * @returns {number} Distance in kilometers
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Calculate score based on distance
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} Score (0-5000)
 */
export function calculateScore(distanceKm) {
    if (distanceKm <= 1) return 5000;
    if (distanceKm <= 50) {
        // 50km → 5000-4000 points (linear scale)
        return Math.round(5000 - (distanceKm / 50) * 1000);
    }
    if (distanceKm <= 500) {
        // 50-500km → 4000-1500 points
        return Math.round(4000 - ((distanceKm - 50) / 450) * 2500);
    }
    if (distanceKm <= 2000) {
        // 500-2000km → 1500-500 points
        return Math.round(1500 - ((distanceKm - 500) / 1500) * 1000);
    }
    if (distanceKm <= 5000) {
        // 2000-5000km → 500-100 points
        return Math.round(500 - ((distanceKm - 2000) / 3000) * 400);
    }
    // 5000km+ → 100-0 points
    const score = Math.round(100 - ((distanceKm - 5000) / 15000) * 100);
    return Math.max(0, score);
}

/**
 * Get score rating label
 * @param {number} totalScore - Total score across all rounds
 * @param {number} rounds - Number of rounds
 * @returns {object} Rating with label and color
 */
export function getScoreRating(totalScore, rounds = 5) {
    const maxScore = rounds * 5000;
    const percentage = (totalScore / maxScore) * 100;

    if (percentage >= 95) return { label: 'KUSURSUZ', color: '#fbbf24', icon: 'perfect' };
    if (percentage >= 85) return { label: 'MÜKEMMEL', color: '#22d3ee', icon: 'amazing' };
    if (percentage >= 70) return { label: 'HARİKA', color: '#a855f7', icon: 'great' };
    if (percentage >= 55) return { label: 'İYİ', color: '#6366f1', icon: 'good' };
    if (percentage >= 40) return { label: 'İDARE EDER', color: '#22c55e', icon: 'decent' };
    if (percentage >= 25) return { label: 'ORTALAMA', color: '#f97316', icon: 'okay' };
    return { label: 'DAHA İYİ OLABİLİR', color: '#ef4444', icon: 'bad' };
}

/**
 * Format distance for display
 * @param {number} distanceKm
 * @returns {string}
 */
export function formatDistance(distanceKm) {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    }
    if (distanceKm < 100) {
        return `${distanceKm.toFixed(1)} km`;
    }
    return `${Math.round(distanceKm).toLocaleString()} km`;
}

/**
 * Format time for display
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
