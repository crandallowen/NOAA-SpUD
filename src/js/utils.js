export function headerMap(field) {
    return RFAHeaderMap[field];
};

export function formatFrequency(frequency_hz) {
    if (frequency_hz > 10 ** 12)
        return '' + (parseFloat(frequency_hz) / (10 ** 12)).toPrecision(12)/1 + ' THz';
    else if (frequency_hz >= 10 ** 9)
        return '' + (parseFloat(frequency_hz) / (10 ** 9)).toPrecision(12)/1 + ' GHz';
    else if (frequency_hz >= 10 ** 6)
        return '' + (parseFloat(frequency_hz) / (10 ** 6)).toPrecision(12)/1 + ' MHz';
    else if (frequency_hz >= 10 ** 4)
        return '' + (parseFloat(frequency_hz) / (10 ** 3)).toPrecision(12)/1 + ' kHz';
    else return '' + (parseFloat(frequency_hz).toPrecision(12))/1 + ' Hz';
};

export function formatPower(power_w) {
    if (power_w > 10 ** 12)
        return '' + (parseFloat(power_w) / (10 ** 12)).toPrecision(12)/1 + ' TW';
    else if (power_w >= 10 ** 9)
        return '' + (parseFloat(power_w) / (10 ** 9)).toPrecision(12)/1 + ' GW';
    else if (power_w >= 10 ** 6)
        return '' + (parseFloat(power_w) / (10 ** 6)).toPrecision(12)/1 + ' MW';
    else if (power_w >= 10 ** 3)
        return '' + (parseFloat(power_w) / (10 ** 3)).toPrecision(12)/1 + ' kW';
    else return '' + (parseFloat(power_w).toPrecision(12))/1 + ' W';
};

// TODO: identify date format first to apply proper formatting
export function formatDate(date) {
    return `${date.substring(5, 7)}/${date.substring(8, 10)}/${date.substring(0, 4)}`;
};

export function formatDateYYYYMMDD(date) {
    return `${date.substring(4, 6)}/${date.substring(6, 8)}/${date.substring(0, 4)}`;
};

// TODO: Handle area codes in the future; not initially necessary as SXXI does not allow for more than 10 characters in this field
export function formatPhoneNumber(num) {
    return `(${num.substring(0,3)}) ${num.substring(3,6)}-${num.substring(6)}`;
};

//Transforms values stored in database into human-readable format
//Will be affected by user settings in time
export function format(value, field) {
    if (Array.isArray(value))
        return value.map((x) => format(x,field)).join('\n');
    else if (field === 'center_frequency')
        return formatFrequency(value);
    else if (field.slice(-4) === 'date' && value != null)
        // return value.substring(5, 7) + '/' + value.substring(8, 10) + '/' + value.substring(0, 4);
        return formatDate(value);
    else if (field === 'power_w' || field === 'max_power')
        return formatPower(value);
    else if (field.slice(-12) === 'phone_number')
        return formatPhoneNumber(value);
    else return value;
};

export function isShortSerialNumber(serial_num) {
    return (serial_num.length <= 6) ? true : false;
};

export function appendCommerceSerialNumber(serial_num) {
    return `C   ${serial_num.padEnd(6, '0')}`;
};

export function validateSerialNumberString(serialNumString) {
    return /(?:^[A-Z][A-Z ]{3}|^)\d{1,6}\s*$/.test(serialNumString);
};

// Does not validate the correct capitalization of the unit
export function validateFrequencyString(frequencyString) {
    // /^\s*\d+\s*(?i:[hkmgt]|[kmgt]?hz)?\s*$/.test(frequencyString);
    return /^\s*\d+\s*([hkmgt]|[kmgt]?hz)?\s*$/i.test(frequencyString);
};

export function frequencyStringToHz(frequencyString) {
    let frequencyFloat;
    frequencyString = frequencyString.trim();
    if (frequencyString.slice(-3).toLowerCase() == 'thz' || frequencyString.slice(-1) == 't')
        frequencyFloat = parseFloat(frequencyString.split('t')[0].trim()) * (10 ** 12);
    else if (frequencyString.slice(-3).toLowerCase() == 'ghz' || frequencyString.slice(-1) == 'g')
        frequencyFloat = parseFloat(frequencyString.split('g')[0].trim()) * (10 ** 9);
    else if (frequencyString.slice(-3).toLowerCase() == 'mhz' || frequencyString.slice(-1) == 'm')
        frequencyFloat = parseFloat(frequencyString.split('m')[0].trim()) * (10 ** 6);
    else if (frequencyString.slice(-3).toLowerCase() == 'khz' || frequencyString.slice(-1) == 'k')
        frequencyFloat = parseFloat(frequencyString.split('k')[0].trim()) * (10 ** 3);
    // else if (frequencyString.slice(-2).toLowerCase() == 'hz' || frequencyString.slice(-1) == 'h')
    else
        frequencyFloat = parseFloat(frequencyString.split('h')[0].trim());
    return frequencyFloat.toPrecision(12).toString() / 1;
};

export function frequencyHzTokHz(frequency_hz) {
    return frequency_hz * (10 ** -3);
};

export function dateStringToSQL(date) {

};

export const defaultColumns = ['serial_num', 'bureau', 'main_function_id', 'center_frequency', 'power_w', 'tx_state_country_code', 'tx_antenna_location', 'revision_date'];

// export const hiddenColumns = []

export const recordColumns = [
    'serial_num',
    'agency_action_num',
    'bureau',
    'agency',
    'main_function_id',
    'intermediate_function_id',
    'detailed_function_id',
    'irac_docket_num',
    // 'docket_num_old',
    'center_frequency',
    // 'frequency_band',
    // 'frequency_upper_limit',
    // 'excluded_frequency_bands',
    // 'paired_frequency',
    'gmf_time',
    'irac_notes',
    'free_text',
    'misc_agency_data',
    // 'fas_agenda',
    'supplementary_details',
    // 'point_of_contact',
    'poc_name',
    'poc_phone_number',
    // 'poc_date_of_verification',
    'joint_agency_names',
    'international_coordination_id',
    'canadian_coordination_comments',
    'mexican_coordination_comments',
    'user_net_code',
    
];

export const emissionGroup = ['station_class', 'emission_designator', 'power_w', 'max_power'];

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
    'tx_jsc_area_code'
];

export const rxGroup = [
    'rx_state_country_code',
    'rx_antenna_location',
    'rx_control_id_and_server_system_id',
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
    'rx_jsc_area_code'
];

export const recordDates = [
    'last_transaction_date',
    'revision_date',
    'authorization_date',
    'expiration_date',
    'review_date',
    'entry_date',
    'receipt_date'
]

export const visibleColumnGroups = {
    'Record Columns': recordColumns,
    'Emission Group Columns': emissionGroup,
    'Transmitter Columns': txGroup,
    'Receiver Columns': rxGroup,
    'Dates': recordDates,
};

export const allColumns = [...recordColumns, ...emissionGroup, ...txGroup, ...rxGroup, ...recordDates];

export const RFAHeaderMap = {
    serial_num: 'Serial Number',
    isAssignment: 'Assignments/Proposals',
    agency_action_num: 'Agency Action Number',
    bureau: 'Bureau',
    agency: 'Agency',
    main_function_id: 'Main Function Identifier',
    intermediate_function_id: 'Intermediate Function Indentifier',
    detailed_function_id: 'Detailed Function Identifier',
    function_identifier: 'Function Identifier',
    irac_docket_num: 'IRAC Docket Number',
    docket_num_old: 'Docket Number of Older Authority',
    center_frequency: 'Frequency',
    frequency_band: 'Frequency Band',
    frequency_upper_limit: 'Upper Frequency Limit',
    excluded_frequency_bands: 'Excluded Frequency Bands',
    paired_frequency: 'Paired Frequency',
    gmf_time: 'Time',
    // timing: '',
    irac_notes: 'IRAC Notes',
    free_text: 'Free Text',
    misc_agency_data: 'Misc. Agency Data',
    fas_agenda: 'FAS Agenda',
    supplementary_details: 'Supplementary Details',
    // point_of_contact: '',
    poc_name: 'Point of Contact',
    poc_phone_number: 'PoC Phone Number',
    // poc_date_of_verification: 'PoC Verification Date',
    joint_agency_names: 'Joint Agency Names',
    international_coordination_id: 'International Coordination ID',
    canadian_coordination_comments: 'Canadian Coordination Comments',
    mexican_coordination_comments: 'Mexican Coordination Comments',
    user_net_code: 'User Net Code',
    station_class: 'Station Class',
    emission_designator: 'Emission Designator',
    power_w: 'Power',
    max_power: 'Max Power',
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
    tx_jsc_area_code: 'Tx JSC Area Code',
    rx_state_country_code: 'Rx State/Country Code',
    rx_antenna_location: 'Rx Antenna Location',
    rx_control_id_and_server_system_id: 'Rx Control ID and Server System ID',
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
    rx_jsc_area_code: 'Rx JSC Area Code',
    last_transaction_date: 'Last Transaction Date',
    revision_date: 'Revision Date',
    authorization_date: 'Authorization Date',
    expiration_date: 'Expiration Date',
    review_date: 'Review Date',
    entry_date: 'Entry Date',
    receipt_date: 'Receipt Date'
};