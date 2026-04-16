import { blinkRequest } from '../client.js';
export async function getContext(config) {
    return blinkRequest(config, '/context/current');
}
export async function getLiveLocation(config) {
    return blinkRequest(config, '/location/latest');
}
