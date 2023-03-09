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

export function format(value, field) {
    if (Array.isArray(value))
        return value.join('\n');
    else if (field === 'frequency_khz')
        return formatFrequency(value);
    else if (field.slice(-4) === 'date' && value != null)
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

export const rowFilters = ['Frequency', 'Bureau', 'Function Identifier', 'Tx State/Country Code']

export const frequencyFilters = {
    band0: {
        name: 'F < 400 MHz',
        lowerBound: 0,
        upperBound: 400000
    },
    band1: {
        name: '400 MHz <= F < 411 MHz',
        lowerBound: 400000,
        upperBound: 411000
    },
    band2: {
        name: 'F >= 411 MHz',
        lowerBound: 411000,
        upperBound: 300000000
    }
};

export const defaultColumns = ['serial_num', 'bureau', 'main_function_id', 'frequency_khz', 'power', 'tx_state_country_code', 'tx_antenna_location', 'revision_date'];

// export const hiddenColumns = []

export const emissionGroup = ['station_class', 'emission_designator', 'power'];
export const txGroup = [
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
    'tx_JSC_area_code'
];

export const rxGroup = [
    'rx_state_country_code',
    'rx_antenna_location',
    'rx_control_ID_and_server_system_ID',
    'rx_station_call_sign',
    'rx_antenna_latitude',
    'rx_antenna_longitude',
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
    'rx_JSC_area_code'
];

//Excludes frequency as a column, but should be added in final build
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

export const RFAHeaderMap = {
    serial_num: 'Serial Number',
    agency_action_num: 'Agency Action Number',
    bureau: 'Bureau',
    agency: 'Agency',
    main_function_id: 'Main Function Identifier',
    intermediate_function_id: 'Intermediate Function Indentifier',
    detailed_function_id: 'Detailed Function Identifier',
    frequency_khz: 'Frequency',
    frequency: 'SXXI Frequency',
    station_class: 'Station Class',
    emission_designator: 'Emission Designator',
    power: 'Power',
    tx_state_country_code: 'Tx State/Country Code',
    tx_antenna_location: 'Tx Antenna Location',
    tx_station_control: 'Tx Station Control',
    tx_station_call_sign: 'Tx Station Call Sign',
    tx_antenna_latitude: 'Tx Antenna Latitude',
    tx_antenna_longitude: 'Tx Antenna Longitude',
    tx_authorized_radius: 'Tx Authorized Radius',
    tx_inclination_angle: 'Tx Inclination Angle',
    tx_apogee: 'Tx Apogee',
    tx_perigee: 'Tx Perigee',
    tx_period_of_orbit: 'Tx Period of Orbit',
    tx_number_of_satellites: 'Tx Number of Satellites',
    tx_power_density: 'Tx Power Density',
    tx_equipment_nomenclature: 'Tx Equipment Nomenclature',
    tx_system_name: 'Tx System Name',
    tx_number_of_stations: 'Tx Number of Stations',
    tx_ots_equipment: 'Tx Off-the-Shelf Equipment',
    tx_radar_tunability: 'Tx Radar Tunability',
    tx_pulse_duration: 'Tx Pulse Duration',
    tx_pulse_repetition_rate: 'Tx Pulse Repetiion Rate',
    tx_antenna_name: 'Tx Antenna Name',
    tx_antenna_nomenclature: 'Tx Antenna Nomenclature',
    tx_antenna_gain: 'Tx Antenna Gain',
    tx_antenna_elevation: 'Tx Antenna Elevation',
    tx_antenna_feed_point_height: 'Tx Antenna Feed Point Height',
    tx_antenna_horizontal_beamwidth: 'Tx Antenna Horizontal Beamwidth',
    tx_antenna_azimuth: 'Tx Antenna Azimuth',
    tx_antenna_orientation: 'Tx Antenna Orientation',
    tx_antenna_polarization: 'Tx Antenna Polarization',
    tx_JSC_area_code: 'Tx JSC Area Code',
    rx_state_country_code: 'Rx State/Country Code',
    rx_antenna_location: 'Rx Antenna Location',
    rx_control_ID_and_server_system_ID: 'Rx Control ID and Server System ID',
    rx_antenna_latitude: 'Rx Antenna Latitude',
    rx_antenna_longitude: 'Rx Antenna Longitude',
    rx_station_call_sign: 'Rx Station Call Sign',
    rx_authorized_radius: 'Rx Authorized Radius',
    rx_repeater_indicator: 'Rx Repeater Indicator',
    rx_inclination_angle: 'Rx Inclination Angle',
    rx_apogee: 'Rx Apogee',
    rx_perigee: 'Rx Perigee',
    rx_period_of_orbit: 'Rx Period of Orbit',
    rx_number_of_satellites: 'Rx Number of Satellites',
    rx_equipment_nomenclature: 'Rx Equipment Nomenclature',
    rx_antenna_name: 'Rx Antenna Name',
    rx_antenna_nomenclature: 'Rx Antenna Nomenclature',
    rx_antenna_gain: 'Rx Antenna Gain',
    rx_antenna_elevation: 'Rx Antenna Elevation',
    rx_antenna_feed_point_height: 'Rx Antenna Feed Point Height',
    rx_antenna_horizontal_beamwidth: 'Rx Antenna Horizontal Beamwidth',
    rx_antenna_azimuth: 'Rx Antenna Azimuth',
    rx_antenna_orientation: 'Rx Antenna Orientation',
    rx_antenna_polarization: 'Rx Antenna Polarization',
    rx_JSC_area_code: 'Rx JSC Area Code',
    last_transaction_date: 'Last Transaction Date',
    revision_date: 'Revision Date',
    authorization_date: 'Authorization Date',
    expiration_date: 'Expiration Date',
    review_date: 'Review Date',
    entry_date: 'Entry Date',
    receipt_date: 'Receipt Date'
};