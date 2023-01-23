import psycopg2
from configparser import ConfigParser
import RFA

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
        # return 'NULL'
        return None
    else:
        # return quoteString(string)
        return string

def queryFormatList(valList):
    if valList == []:
        # return 'NULL'
        return None
    else:
        # tempList = list(map(quoteString, valList))
        # return 'ARRAY[' + ', '.join(tempList) + ']'
        return valList

def queryFormatDate(date):
    if date == '':
        # return 'NULL'
        return None
    else:
        # month, day, year = date.split('/')
        # return quoteString(year + '-' + month + '-' + day)
        return date

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
                # for value in params['values']:
                #     print(value, end=', ')
                # print()
                cursor.execute(SQLcode, params['values'])
            else:
                cursor.execute(SQLcode)

def insertRFAs(filename):
    RFAs = RFA.importRFAsFrom1ColFile(filename)
    connection = connect()
    for rfa in RFAs:
        columns = []
        placeholders = []
        values = []
        for key, value in rfa.__dict__.items():
            if idMap.testInclusion(key):
                col = idMap.toSQL(key)
                columns.append(col)
                placeholders.append('%s')
                values.append(idMap.eval(col, value))
        columns = ', '.join(columns)
        placeholders = ', '.join(placeholders)
        # values = ', '.join(values)
        values = tuple(values)
        # insertSQL = 'INSERT INTO RFAs ({}) VALUES ({});'.format(columns, values)
        insertSQL = 'INSERT INTO RFAs ({}) VALUES ({});'.format(columns, placeholders)
        # print(insertSQL)
        # with connection:
        #     with connection.cursor() as cursor:
        #         cursor.execute(insertSQL, values)
        execute(connection, insertSQL, values=values)
    if connection is not None:
        disconnect(connection)


if __name__ == '__main__':
    idMap = RFAToSpUDMap()
    insertRFAs('./RFA Module/inputs/gmf 1 col all doc 2023.01.19.txt')