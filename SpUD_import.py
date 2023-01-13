import psycopg2
from configparser import ConfigParser
import RFA as rfa

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

def execute(connection, SQLcode, params=None):
    with connection:
        with connection.cursor() as cursor:
            if params is not None:
                cursor.execute(SQLcode, params)
            else:
                cursor.execute(SQLcode)

if __name__ == '__main__':
    conn = connect()
    if conn is not None:
        disconnect(conn)