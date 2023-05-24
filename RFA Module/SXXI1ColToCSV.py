import RFA as rfa

# Prompt user for input file name and ensure correct file extension
userIn = ''
inFilename = ''
acceptedInFileExtension = '.txt'
while(userIn[-len(acceptedInFileExtension):] != acceptedInFileExtension):
    userIn = input(f'Enter name of input file. File must end in {acceptedInFileExtension}.\n')
inFilename = userIn

# Prompt the user for output file name and ensure correct file extension
outFilename = 'output.csv' # Default out file name if none selected. Technically, not necessary as out file name is optional for exportRFAsToCSV()
acceptedOutFileExtension = '.csv'
while(userIn[-len(acceptedOutFileExtension):] != acceptedOutFileExtension):
    userIn = input(f'Enter name of output file. File must end in {acceptedOutFileExtension}. (ENTER for \'{outFilename}\')\n')
    if userIn == '':
        userIn = outFilename
outFilename = userIn

RFAs = rfa.importRFAsFrom1ColFile(inFilename)
rfa.exportRFAsToCSV(RFAs, outFilename)