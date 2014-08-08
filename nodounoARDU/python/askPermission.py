import urllib2
import sys
import json

def basic_authorization(user, password):
    s = user + ":" + password
    return "Basic " + s.encode("base64").rstrip()

#curl -H 'Content-type: application/json'  -d '{"tag_id":"_FD_A4_F3_69", "asset_id":11}' http://localhost:5001/checkin -u"centralina:wemakemilano\!"

localauth = json.load( open('/root/local.auth') )
ipAddress = localauth['serverAddress']
uri = "/checkin"
json_checkin = json.dumps( {"tag_id":sys.argv[1], "asset_id":localauth["id"] } )
authString = basic_authorization(localauth['username'], localauth['password'])

req = urllib2.Request( ipAddress+uri,
                       headers = {
                           "Authorization": authString,
                           "Content-Type": "application/json"
                       },
                       data = json_checkin )

f = urllib2.urlopen(req)
print f.read()