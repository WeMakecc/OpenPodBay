import urllib2
import sys
import json

def basic_authorization(user, password):
    s = user + ":" + password
    return "Basic " + s.encode("base64").rstrip()

#curl -H 'Content-type: application/json' -d '{"id":0, "status":1 }' http://localhost:5001/notifyStatus

localauth = json.load( open('/root/local.auth') )
ipAddress = localauth['serverAddress']
uri = "/notifyStatus"
json_status = json.dumps( {"id":localauth["id"], "status":sys.argv[1] } )
authString = basic_authorization(localauth['username'], localauth['password'])

req = urllib2.Request( ipAddress+uri,
                       headers = {
                           "Authorization": authString,
                           "Content-Type": "application/json"
                       },
                       data = json_status )

f = urllib2.urlopen(req)
print f.read()