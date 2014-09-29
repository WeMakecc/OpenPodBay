import urllib2
import sys
import json

def basic_authorization(user, password):
    s = user + ":" + password
    return "Basic " + s.encode("base64").rstrip()

#curl -H 'Content-type: application/json'  -d '{"tag_id":"_FD_A4_F3_69", "asset_id":11}' http://localhost:5001/checkin -u"centralina:wemakemilano\!"

def askPermission(tag, path):
    try:
        localauth = json.load( open(path) )
    except Exception as e:
        print 'n'
        return

    ipAddress = localauth['serverAddress']
    uri = "/checkin"
    json_checkin = json.dumps( {"tag_id":tag, "node_id":localauth["id"] } )
    authString = basic_authorization(localauth['username'], localauth['password'])

    req = urllib2.Request( ipAddress+uri,
                           headers = {
                               "Authorization": authString,
                               "Content-Type": "application/json"
                           },
                           data = json_checkin )

    try:
        f = urllib2.urlopen(req, timeout=5)
        print f.read()
    except Exception as e:
        print 'n'

if __name__ == "__main__":
    path = '/root/local.auth'
    #path = './local.auth'
    askPermission(sys.argv[1], path)