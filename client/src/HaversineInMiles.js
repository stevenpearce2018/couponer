const HaversineInMiles = (lat1, long1, lat2, long2) => {
    const eQuatorialEarthRadius = 6378.1370;
    const d2r = (Math.PI / 180.0);
    const dlong = (long2 - long1) * d2r;
    const dlat = (lat2 - lat1) * d2r;
    const a = Math.pow(Math.sin(dlat / 2.0), 2.0) + Math.cos(lat1 * d2r) * Math.cos(lat2 * d2r) * Math.pow(Math.sin(dlong / 2.0), 2.0);
    const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
    const d = eQuatorialEarthRadius * c * 0.621371;
    return d.toFixed(2) + ' miles';
}

module.exports = HaversineInMiles;