import RFA as rfa

date = '2025.02.24'
inputFile_a = '../inputs/sfaf 1 col all doc_a_'+date+'.txt'
inputFile_p = '../inputs/sfaf 1 col all doc_p_'+date+'.txt'
outputFile = '../outputs/all doc '+date+'.csv'

RFAs_a = rfa.importRFAsFrom1ColFile(inputFile_a)
RFAs_p = rfa.importRFAsFrom1ColFile(inputFile_p)

RFAs = RFAs_a + RFAs_p

rfa.exportRFAsToCSV(RFAs, outputFile)