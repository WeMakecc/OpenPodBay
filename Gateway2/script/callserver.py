import sys
import os
import json
import urllib2

timeout = 3  # timeout for http request in seconds

NOTIFY_STATUS = 1
ASK_PERMISSION = 2

notifystatus_uri = "/notifyStatus"
askpermission_uri = "/checkin"

localauth = None


def basic_authorization(user, password):
    s = user + ":" + password
    return "Basic " + s.encode("base64").rstrip()


def loadconfig():
    global localauth
    currentpath = os.path.dirname(os.path.abspath(__file__))
    namefile = os.path.join(currentpath, 'local.auth')

    try:
        localauth = json.load(open(namefile))
        return True
    except IOError:
        return None


def notifystatus(status):
    args = {
        "node_id": localauth["id"],
        "status": status,
        "type": localauth["type"]
    }
    callserver(notifystatus_uri, args)


def askpermission(tag):
    args = {
        "tag_id": tag,
        "node_id": localauth["id"]
    }
    callserver(askpermission_uri, args)


def callserver(uri, args):
    authstring = basic_authorization(localauth['username'], localauth['password'])
    args = json.dumps(args)

    req = urllib2.Request( 
        localauth['serverAddress']+uri,
        headers={
            "Authorization": authstring,
            "Content-Type": "application/json"
        },
        data=args
    )
    try:
        f = urllib2.urlopen(req, timeout=timeout)
        print f.read()
    except Exception as e:
        print 'failed urlopen ', e

if __name__ == "__main__":

    if not loadconfig():
        print 'failed to load config file'
        exit(0)
    elif len(sys.argv) < 2:
        print 'Usage:\n\t python callserver.py [command] [params]'
        exit(0)
    else:
        command = int(sys.argv[1])
        if command == NOTIFY_STATUS:
            notifystatus(sys.argv[2])
        elif command == ASK_PERMISSION:
            askpermission(sys.argv[2])
        else:
            print 'invalid command.'
            print '\t1 to notify server'
            print '\t2 to ask permission'
            exit(0)