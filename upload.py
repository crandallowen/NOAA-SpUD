import sys
import json
from SpUD_io import RFA as rfa
from SpUD_io import SpUD_upload as su

if __name__== '__main__':
    args = json.loads(sys.argv[1])
    params = args["params"]
    user = args["user"]
    inputString = sys.stdin.read()
    RFAsText_a, RFAsText_p = inputString.split('\n----------\n')
    RFAsText_a = RFAsText_a.split('\n')
    RFAsText_p = RFAsText_p.split('\n')
    try:
        RFAs_a = rfa.importRFAs(RFAsText_a, 'assignment')
    except Exception as error:
        raise Exception(f'Assignment Import Error: {error}') from None
    try:
        RFAs_p = rfa.importRFAs(RFAsText_p, 'proposal')
    except Exception as error:
        raise Exception(f'Proposal Import Error: {error}') from None
    RFAs = RFAs_a + RFAs_p
    try:
        su.uploadRFAs(RFAs, params, user)
    except Exception as error:
        raise Exception(f'Upload Error: {error}') from None