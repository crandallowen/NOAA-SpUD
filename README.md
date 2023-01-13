# NOAA SpUD #
A database used to track the spectrum usage of NOAA for the purpose of spectrum management.

# RFA Scripts
A collection of scripts that utilize the module described in RFA.py along with sample input data.

## SXXI1ColToCSV.py
A script that uses the class specified in RFA.py along with examples of function calls. The script requests the name of an input file from the user, and requests the name of the desired output file. The script will verify that the correct file extension is used, but no further input validation is in place. The script then uses calls to functions in the module to import the data from the input file into a list of RFA objects, and then exports the RFA objects into a file with the requested name in standard output format.

# SpUD
A folder that will be eventually form a python package that includes different database format modules, import/export modules, and all associated files. Currently, this folder includes many files that are empty, but will be necessary when it is time to package.

## RFA.py
A python module that allows a user to more easily manipulate output data from SXXI. This module contains a class declaration for an RFA object, useful methods for manipulating RFA objects, a function to import records in either GMF or SFAF format, functions for exporting the data in particular formats, and functions for converting SXXI values into more readable formats.
### PLEASE NOTE ###
The SpUD package is not yet a valid python package, and as such, the Python import module will be unable to locate the RFA.py module unless your scripts are stored in the SpUD folder. Alternatively, an environment variable can be set to inform the import module of the correct directory. On Windows, this can be done with following in CMD or PowerShell: >SET PYTHONPATH=C:\your\path\here\NOAA-SpUD\SpUD\

# SQL
A folder that contains all of the SQL files used for the SpUD database administration.

## createTables.sql
This file creates the tables for the SpUD

## createTypes.sql
This file creates all user defined datatypes that will be used in the SpUD

## deleteAll.sql
This file deletes all data in all tables

## dropAll.sql
This file drops all tables