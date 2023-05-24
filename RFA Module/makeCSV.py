import RFA as rfa

inputFile = './inputs/sfaf 1 col all doc 2023.05.16.txt'
outputFile = 'all doc 2023.05.16.csv'

RFAs = rfa.importRFAsFrom1ColFile(inputFile)

rfa.exportRFAsToCSV(RFAs, outputFile)