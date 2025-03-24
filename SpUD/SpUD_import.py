import psycopg2
from configparser import ConfigParser
import RFA

RFA_source_file = '../inputs/sfaf 1 col all doc_a_2025.02.03.txt'
RFP_source_file = '../inputs/sfaf 1 col all doc_p_2025.02.03.txt'


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
        raise KeyError('RFAToSpUDMap.toSQL(): Column or attribute name, {}, not recognized'.format(key))

    def toRFA(self, key):
        for tuple in self.tupleList:
            if key == tuple[1]:
                return tuple[0]
        raise KeyError('RFAToSpUDMap.toRFA(): Column or attribute name, {}, not recognized'.format(key))

    def eval(self, col, value):
        for tuple in self.tupleList:
            if col in [tuple[0], tuple[1]]:
                return eval('{}(value)'.format(tuple[2]))
        raise KeyError('RFAToSpUDMap.eval(): Column or attribute name, {}, not recognized'.format(col))

# TODO: These functions will likely be deprecated, but replaced with more specific handlers for different fields
def quoteString(string): return "'"+string+"'"
def queryFormatString(string): return None if string == '' else string
def queryFormatList(List): return None if List == [] else List
def queryFormatDate(date): return None if date == '' else date


def config(filename='database.ini', section='postgresql'):
    parser = ConfigParser()
    parser.read(filename)
    db = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            db[param[0]] = param[1]
    else:
        raise Exception('Section {0} not found in the {1} file.'.format(section, filename))
    return db

def connect():
    params = config()
    connection = None
    print('Connecting to the PostgreSQL database {0} as user {1}...'.format(params['database'], params['user']))
    try:
        with psycopg2.connect(**params) as connection:
            with connection.cursor() as cursor:
                cursor.execute('SELECT version()')
                db_version = cursor.fetchone()
                print(db_version)
            return connection
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        raise error

def disconnect(connection):
    connection.close()
    print('Database connection closed.')

def execute(connection, SQLcode, **params):
    with connection:
        with connection.cursor() as cursor:
            if 'values' in params.keys():
                cursor.execute(SQLcode, params['values'])
            else:
                cursor.execute(SQLcode)

def importRFAs():
    importRFAsFromFile(RFA_source_file, RFP_source_file)

def importRFAsFromFile(filename_a, filename_p):
    RFAs_a = RFA.importRFAsFrom1ColFile(filename_a)
    RFAs_p = RFA.importRFAsFrom1ColFile(filename_p)
    RFAs = RFAs_a + RFAs_p
    idMap = RFAToSpUDMap()
    columns = []
    placeholders = []
    # TODO: Iterate through a different variable that includes all sql columns as there will be more than there are RFA-class attributes
    # Alternatively, a second loop that specifically goes through the added columns
    # In the common format, the RFA attributes will be one-to-one with RFA columns, and the additional columns will be found in different tables
    for key in RFAs[0].__dict__.keys():
        if idMap.testInclusion(key):
            col = idMap.toSQL(key)
            columns.append(col)
            placeholders.append('%s')

    # columns.append('frequency_hz')
    # placeholders.append('%s')

    columns = ', '.join(columns)
    placeholders = ', '.join(placeholders)
    # TODO: Rewrite this portion to utilize the psycopg2.sql module
    insertSQL = 'INSERT INTO RFAs ({}) VALUES ({});'.format(columns, placeholders)
    connection = connect()
    try:
        for rfa in RFAs:
            values = []
            for key, value in rfa.__dict__.items():
                if idMap.testInclusion(key):
                    col = idMap.toSQL(key)
                    values.append(idMap.eval(col, value))
            # values.append(float(RFA.formatFrequency(rfa.frequency)))
            values = tuple(values)
            # print(values)
            execute(connection, insertSQL, values=values)
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        raise error
    finally:
        if connection is not None:
            disconnect(connection)


if __name__ == '__main__':
    importRFAs()