import psycopg2
from configparser import ConfigParser
import RFA

# class RFAToSpUDMap():
#     def __init__(self):
#         self.toSQL = {}
#         self.toRFA = {}
#         self.isIncluded = {}
    
#     def setMap(self, mapDict, direction):
#         revDict = {value: key for key, value in mapDict.items()}
#         if direction == 'toSQL':
#             self.toSQL = mapDict
#             self.toRFA = revDict
#         elif direction == 'toRFA':
#             self.toRFA = mapDict
#             self.toSQL = revDict

#     def setInclusion(self, inclDict):
#         self.isIncluded = inclDict

#     def testInclusion(self, key):
#         if key in self.toSQL:
#             return self.isIncluded[key]
#         elif key in self.toRFA:
#             return self.isIncluded[self.toRFA[key]]
#         else:
#             return False

#     def load(self, tupleList):
#         toSQL = {}
#         isIncluded = {}
#         for tuple in tupleList:
#             toSQL[tuple[0]] = tuple[1]
#             isIncluded[tuple[0]] = tuple[2]
#         self.setMap(toSQL, 'toSQL')
#         self.isIncluded = isIncluded

class RFAToSpUDMap():
    def __init__(self):
        self.tupleList = []
        self.load()

    def testInclusion(self, key):
        for tuple in self.tupleList:
            if key == tuple[0]:
                return True
            elif key == tuple[1]:
                return True
        return False

    def load(self):
        with open('RFAToSpUDMap.txt') as iFile:
            lines = iFile.readlines()
        for line in lines:
            if line[0] == '#':
                continue
            rfa, sql, func = line.strip().split(',')
            self.tupleList.append((rfa, sql, func))

    def toSQL(self, key):
        for tuple in self.tupleList:
            if key == tuple[0]:
                return tuple[1]
        raise KeyError('Column or attribute name not recognized')

    def toRFA(self, key):
        for tuple in self.tupleList:
            if key == tuple[1]:
                return tuple[0]
        raise KeyError('Column or attribute name not recognized')

    def eval(self, col, value):
        for tuple in self.tupleList:
            if col in [tuple[0], tuple[1]]:
                return eval('{}(value)'.format(tuple[2]))
        raise KeyError('Column or attribute name not recognized')

def quoteString(string):
    return "'"+string+"'"

def queryFormatString(string):
    if string == '':
        return 'NULL'
    else:
        return quoteString(string)

def queryFormatList(valList):
    if valList == []:
        return 'NULL'
    else:
        tempList = list(map(quoteString, valList))
        return 'ARRAY[' + ', '.join(tempList) + ']'

def queryFormatDate(date):
    if date == '':
        return 'NULL'
    else:
        month, day, year = date.split('/')
        return quoteString(year + '-' + month + '-' + day)

def config(filename='database.ini', section='postgresql'):
    parser = ConfigParser()
    parser.read(filename)
    db = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            db[param[0]] = param[1]
    else:
        raise Exception('Section {0} nor found in the {1} file.'.format(section, filename))
    return db

def connect():
    params = config()
    connection = None
    print('Connecting to the PostgreSQL database {0} as user {1}...'.format(params['database'], params['user']))
    with psycopg2.connect(**params) as connection:
        with connection.cursor() as cursor:
            cursor.execute('SELECT version()')
            db_version = cursor.fetchone()
            print(db_version)
        return connection

def disconnect(connection):
    connection.close()
    print('Database connection closed.')

def execute(connection, SQLcode, **params):
    with connection:
        with connection.cursor() as cursor:
            if 'values' in params.keys():
                for value in params['values']:
                    print(value, end=', ')
                print()
                cursor.execute(SQLcode, params['values'])
            else:
                cursor.execute(SQLcode)

def insertRFAs(filename):
    # insertSQL = '''INSERT INTO RFAs 
    #                (serial_num, agency_action_num, bureau, agency, main_function_id, intermediate_function_id, detailed_function_id, frequency, station_class, emission_designator, power, tx_state_country_code, tx_antenna_location, tx_station_control, tx_station_call_sign, tx_antenna_latitude, tx_antenna_longitude, tx_authorized_radius, tx_inclination_angle, tx_apogee, tx_perigee, tx_period_of_orbit, tx_number_of_satellites, tx_power_density, tx_equipment_nomenclature, tx_system_name, tx_number_of_stations, tx_OTS_equipment, tx_radar_tunability, tx_pulse_duration, tx_pulse_repetition_rate, tx_antenna_name, tx_antenna_nomenclature, tx_antenna_gain, tx_antenna_elevation, tx_antenna_feed_point_height, tx_antenna_horizontal_beamwidth, tx_antenna_azimuth, tx_antenna_orientation, tx_antenna_polarization, tx_JSC_area_code, rx_state_country_code, rx_antenna_location, rx_control_ID_and_server_system_ID, rx_antenna_latitude, rx_antenna_longitude, rx_station_call_sign, rx_authorized_radius, rx_repeater_indicator, rx_inclination_angle, rx_apogee, rx_perigee, rx_period_of_orbit, rx_number_of_satellites, rx_equipment_nomenclature, rx_antenna_name, rx_antenna_nomenclature, rx_antenna_gain, rx_antenna_elevation, rx_antenna_feed_point_height, rx_antenna_horizontal_beamwidth, rx_antenna_azimuth, rx_antenna_orientation, rx_antenna_polarization, rx_JSC_area_code) 
    #                VALUES 
    #                (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'''
    RFAs = RFA.importRFAsFrom1ColFile(filename)
    str1 = 'INSERT INTO RFAs ('
    str3 = ') VALUES ('
    str5 = ');'
    connection = connect()
    for rfa in RFAs:
        temp2 = []
        temp4 = []
        for key, value in rfa.__dict__.items():
            if idMap.testInclusion(key):
                col = idMap.toSQL(key)
                temp2.append(col)
                temp4.append(idMap.eval(col, value))
        str2 = ', '.join(temp2)
        str4 = ', '.join(temp4)
        insertSQL = str1 + str2 + str3 + str4 + str5
        # print(insertSQL)
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(insertSQL)
        # values = (rfa.serial, rfa.agency_action_number, rfa.bureau, rfa.agency, rfa.main_function_ID, rfa.intermediate_function_ID, rfa.detailed_function_ID, rfa.frequency, rfa.station_class, rfa.emission_designator, rfa.power, rfa.tx_state_country_code, rfa.tx_antenna_location, rfa.tx_station_control, rfa.tx_station_call_sign, rfa.tx_antenna_latitude, rfa.tx_antenna_longitude, rfa.tx_authorized_radius, rfa.tx_inclination_angle, rfa.tx_apogee, rfa.tx_perigee, rfa.tx_period_of_orbit, rfa.tx_number_of_satellites, rfa.tx_power_density, rfa.tx_equipment_nomenclature, rfa.tx_system_name, rfa.tx_number_of_stations, rfa.tx_OTS_equipment, rfa.tx_radar_tunability, rfa.tx_pulse_duration, rfa.tx_pulse_repetition_rate, rfa.tx_antenna_name, rfa.tx_antenna_nomenclature, rfa.tx_antenna_gain, rfa.tx_antenna_elevation, rfa.tx_antenna_feed_point_height, rfa.tx_antenna_horizontal_beamwidth, rfa.tx_antenna_azimuth, rfa.tx_antenna_orientation, rfa.tx_antenna_polarization, rfa.tx_JSC_area_code, rfa.rx_state_country_code, rfa.rx_antenna_location, rfa.rx_control_ID_and_server_system_ID, rfa.rx_antenna_latitude, rfa.rx_antenna_longitude, rfa.rx_station_call_sign, rfa.rx_authorized_radius, rfa.rx_repeater_indicator, rfa.rx_inclination_angle, rfa.rx_apogee, rfa.rx_perigee, rfa.rx_period_of_orbit, rfa.rx_number_of_satellites, rfa.rx_equipment_nomenclature, rfa.rx_antenna_name, rfa.rx_antenna_nomenclature, rfa.rx_antenna_gain, rfa.rx_antenna_elevation, rfa.rx_antenna_feed_point_height, rfa.rx_antenna_horizontal_beamwidth, rfa.rx_antenna_azimuth, rfa.rx_antenna_orientation, rfa.rx_antenna_polarization, rfa.rx_JSC_area_code)
        # execute(connection, insertSQL, values=values)
    if connection is not None:
        disconnect(connection)


if __name__ == '__main__':
    # conn = connect()
    idMap = RFAToSpUDMap()
    insertRFAs('./RFA Module/inputs/gmf 1 col all doc 2023.01.19.txt')
    # if conn is not None:
    #     disconnect(conn)