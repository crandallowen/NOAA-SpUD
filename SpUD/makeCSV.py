import RFA as rfa

inputFile = './inputs/sfaf 1 col all doc 2024.01.23.txt'
outputFile = 'all doc 2024.01.23.csv'

RFAs = rfa.importRFAsFrom1ColFile(inputFile)

rfa.exportRFAsToCSV(RFAs, outputFile)