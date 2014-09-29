import urllib2
import sys
import json

def basic_authorization(user, password):
    s = user + ":" + password
    return "Basic " + s.encode("base64").rstrip()

#curl -H 'Content-type: application/json' -d '{"id":0, "status":1, "type":"gateway" }' http://localhost:5001/notifyStatus -ucentralina:wemakemilano!

def notifyStatus(status, path):
    try:
        localauth = json.load( open(path) )
    except Exception as e:
        print 'failed to load json'
        return

    ipAddress = localauth['serverAddress']
    uri = "/notifyStatus"
    json_status = json.dumps( {"node_id":localauth["id"], "status":status, "type":localauth["type"] } )
    authString = basic_authorization(localauth['username'], localauth['password'])

    req = urllib2.Request( ipAddress+uri,
                           headers = {
                               "Authorization": authString,
                               "Content-Type": "application/json"
                           },
                           data = json_status )

    try:
        f = urllib2.urlopen(req, timeout=3)
        print f.read()
    except Exception as e:
        print 'failed urlopen'

if __name__ == "__main__":
    path = '/root/local.auth'
    #path = './local.auth'
    notifyStatus(sys.argv[1], path)