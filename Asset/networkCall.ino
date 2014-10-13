//---------------------------------------------------------------------------- incoming connection
void serveIncomingRequest() {
  YunClient client = server.accept();
  if (client) {
    String url = client.readString();
    String command = getTrimValue(url, '/', 0);
    Serial.println(F("incoming connection"));
    Serial.println(command);
    command.trim();
    
    // command to move the arduino in STATUS_RESERVED mode
    if(command == "reserved") {
      _status = STATUS_RESERVED;
    }
    
    // command to move the arduino in STATUS_RESERVED_END mode
    if(command == "reservedend") {
      _status = STATUS_RESERVED_END;
    }
    
    client.stop();
    Serial.println(F("connection closed"));
    delay(15); 
  }
}

//---------------------------------------------------------------------------- ask permission
void askPermission() {
  Serial.println(F("askPermission: "));  
  
  askPermissionProcess.begin(F("python"));
  askPermissionProcess.addParameter(F("/root/callserver.py"));
  askPermissionProcess.addParameter(F("2"));
  askPermissionProcess.addParameter(uidString);
  askPermissionProcess.run();

  const int COMMAND_NONE = 0;
  const int COMMAND_N = 1;
  const int COMMAND_Y = 2;

  int command = COMMAND_NONE;
  int d = 0;
  String timeString = "";

  Serial.println("answer:");
  while (askPermissionProcess.available()>0) {
    char c = askPermissionProcess.read();
    
    if(command==COMMAND_N) {
      // just debug
      Serial.print(c);
    } else if(command==COMMAND_Y) {
      timeString += c;
    }
    
    if(command==COMMAND_NONE && c=='n') {
      Serial.println("N");
      command = COMMAND_N;
      displayAccessDenied();
    } else if(command==COMMAND_NONE && c=='y') {
      Serial.println("Y");
      command = COMMAND_Y;
    }
  }
  
  if(command==COMMAND_Y) {
    reservation_active = true;
  }
  
  Serial.flush();
  Serial.println();
}

//---------------------------------------------------------------------------- notify server
void notifyServer() {
  notifyServerProcess.begin(F("python"));
  notifyServerProcess.addParameter(F("/root/callserver.py"));
  notifyServerProcess.addParameter(F("1"));
  if(shieldOK) notifyServerProcess.addParameter("8");
  else notifyServerProcess.addParameter("2");
  notifyServerProcess.run();

  Serial.println(F("notifyStatus: "));  
  while (notifyServerProcess.available()>0) {
    char c = notifyServerProcess.read();
    Serial.print(c);
    
    if(c=='y') {
      server_ok = true;
      break;  
    } else {
      server_ok = false;
    }
  }
  Serial.flush();
  Serial.println();
}
