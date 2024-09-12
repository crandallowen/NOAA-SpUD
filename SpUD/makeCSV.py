import RFA as rfa

inputFile_a = '../inputs/sfaf 1 col all doc_a_2024.08.19.txt'
inputFile_p = '../inputs/sfaf 1 col all doc_p_2024.08.19.txt'
outputFile = '../outputs/all doc 2024.08.19.csv'

RFAs_a = rfa.importRFAsFrom1ColFile(inputFile_a)
RFAs_p = rfa.importRFAsFrom1ColFile(inputFile_p)

RFAs = RFAs_a + RFAs_p

rfa.exportRFAsToCSV(RFAs, outputFile)