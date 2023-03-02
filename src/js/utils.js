import { RFAHeaderMap } from './RFAHeaderMap';

export async function request(options) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open(options.method || "GET", options.url);
        if (options.headers) {
            Object.keys(options.headers).forEach((key) => {
                xhr.setRequestHeader(key, options.headers[key]);
            });
        }
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject({status: xhr.status, statusText: xhr.statusText});
            }
        };
        xhr.onerror = () => reject({status: xhr.status, statusText: xhr.statusText});
        var body = options.body;
        if (body && typeof body === 'object') {
            body = Object.keys(body).map((key) => {
                return encodeURIComponent(key) + '=' + encodeURIComponent(body[key]);
            }).join('&');
        }
        xhr.send(options.body);
    });
};

export function headerMap(field) {
    return RFAHeaderMap[field];
};

export function formatFrequency(frequency_khz) {
    if (frequency_khz > 10 ** 9)
        return '' + (parseFloat(frequency_khz) / (10 ** 9)).toPrecision(12)/1 + ' THz';
    else if (frequency_khz >= 10 ** 6)
        return '' + (parseFloat(frequency_khz) / (10 ** 6)).toPrecision(12)/1 + ' GHz';
    else if (frequency_khz >= 10 ** 4)
        return '' + (parseFloat(frequency_khz) / (10 ** 3)).toPrecision(12)/1 + ' MHz';
    else return '' + (parseFloat(frequency_khz).toPrecision(12))/1 + ' KHz';
};

export function format(value, key) {
    if (Array.isArray(value))
        return value.join('\n');
    else if (key === 'frequency_khz')
        return formatFrequency(value);
    else if (key.slice(-4) === 'date' && value != null)
        return value.substring(5, 7) + '/' + value.substring(8, 10) + '/' + value.substring(0, 4);
    else return value;
}

export function frequencyToKHz(frequencyString) {
    let frequencyFloat;
    if (frequencyString.slice(-3).toLowerCase() == 'khz' || frequencyString.slice(-1) == 'k')
        if (frequencyString.includes(' '))
            frequencyFloat = parseFloat(frequencyString.split(' ')[0]);
        else
            return false;
    else if (frequencyString.slice(-3).toLowerCase() == 'mhz' || frequencyString.slice(-1) == 'm')
        if (frequencyString.includes(' '))
            frequencyFloat = parseFloat(frequencyString.split(' ')[0]) * (10 ** 3);
        else
            return false;
    else if (frequencyString.slice(-3).toLowerCase() == 'ghz' || frequencyString.slice(-1) == 'g')
        if (frequencyString.includes(' '))
            frequencyFloat = parseFloat(frequencyString.split(' ')[0]) * (10 ** 6);
        else
            return false;
    else if (frequencyString.slice(-3).toLowerCase() == 'thz' || frequencyString.slice(-1) == 't')
        if (frequencyString.includes(' '))
            frequencyFloat = parseFloat(frequencyString.split(' ')[0]) * (10 ** 9);
        else
            return false;
    return frequencyFloat.toPrecision(12).toString() / 1;
};

export const defaultColumns = ['serial_num', 'bureau', 'main_function_ID', 'frequency_khz', 'power', 'tx_state_country_code', 'tx_antenna_location', 'revision_date'];

export const allColumns = [
    'serial_num',
    'agency_action_num',
    'bureau',
    'agency',
    'main_function_id',
    'intermediate_function_id',
    'detailed_function_id',
    'frequency_khz',
    'station_class',
    'emission_designator',
    'power',
    'tx_state_country_code',
    'tx_antenna_location',
    'tx_station_control',
    'tx_station_call_sign',
    'tx_antenna_latitude',
    'tx_antenna_longitude',
    'tx_authorized_radius',
    'tx_inclination_angle',
    'tx_apogee',
    'tx_perigee',
    'tx_period_of_orbit',
    'tx_number_of_satellites',
    'tx_power_density',
    'tx_equipment_nomenclature',
    'tx_system_name',
    'tx_number_of_stations',
    'tx_ots_equipment',
    'tx_radar_tunability',
    'tx_pulse_duration',
    'tx_pulse_repetition_rate',
    'tx_antenna_name',
    'tx_antenna_nomenclature',
    'tx_antenna_gain',
    'tx_antenna_elevation',
    'tx_antenna_feed_point_height',
    'tx_antenna_horizontal_beamwidth',
    'tx_antenna_azimuth',
    'tx_antenna_orientation',
    'tx_antenna_polarization',
    'tx_JSC_area_code',
    'rx_state_country_code',
    'rx_antenna_location',
    'rx_control_ID_and_server_system_ID',
    'rx_antenna_latitude',
    'rx_antenna_longitude',
    'rx_station_call_sign',
    'rx_authorized_radius',
    'rx_repeater_indicator',
    'rx_inclination_angle',
    'rx_apogee',
    'rx_perigee',
    'rx_period_of_orbit',
    'rx_number_of_satellites',
    'rx_equipment_nomenclature',
    'rx_antenna_name',
    'rx_antenna_nomenclature',
    'rx_antenna_gain',
    'rx_antenna_elevation',
    'rx_antenna_feed_point_height',
    'rx_antenna_horizontal_beamwidth',
    'rx_antenna_azimuth',
    'rx_antenna_orientation',
    'rx_antenna_polarization',
    'rx_JSC_area_code',
    'last_transaction_date',
    'revision_date',
    'authorization_date',
    'expiration_date',
    'review_date',
    'entry_date',
    'receipt_date'
];