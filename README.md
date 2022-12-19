# NOAA SpUD
A database used to track the spectrum usage of NOAA for the purpose of spectrum management.

# RFA.py
A python module that allows a user to more easily manipulate output data from SXXI. This module contains a class declaration for an RFA object, useful methods for manipulating RFA objects, a function to import records in either GMF or SFAF format, functions for exporting the data in particular formats, and functions for converting SXXI values into more readable formats.

# SXXI1ColToCSV.py
A script that uses the class specified in RFA.py along with examples of function calls. The script requests the name of an input file from the user, and requests the name of the desired output file. The script will verify that the correct file extension is used, but no further input validation is in place. The script then uses calls to functions in the module to import the data from the input file into a list of RFA objects, and then exports the RFA objects into a file with the requested name in standard output format.