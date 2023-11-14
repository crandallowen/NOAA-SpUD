import RFA as rfa

inputFile = './inputs/sfaf 1 col all doc 2023.10.24.txt'
outputFile = 'all doc 2023.10.24.csv'

RFAs = rfa.importRFAsFrom1ColFile(inputFile)

rfa.exportRFAsToCSV(RFAs, outputFile)