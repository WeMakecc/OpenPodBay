void serveIncomingRequest() {
  YunClient client = server.accept();
  if (client) {
    String url = client.readString();
    String command = getTrimValue(url, '/', 0);
    Serial.println(F("incoming connection"));
    Serial.println(command);
    command.trim();
    if(command == "doortick") {
      doTheCheckIn();
      client.println(F("Status:200"));
    }
    client.stop();
    Serial.println(F("connection closed"));
  }
  delay(50);
}

void askPermission() {
  askPermissionProcess.begin(F("python"));
  askPermissionProcess.addParameter(F("/root/askPermission.py"));
  askPermissionProcess.addParameter(uidString);
  askPermissionProcess.run();

  Serial.println(F("askPermission: "));  
  while (askPermissionProcess.available()>0) {
    char c = askPermissionProcess.read();
    Serial.print(c);
    
    if(c=='y') {
      //doTheCheckIn();
      doTheCheckInServo();
    }
    
  }
  Serial.flush();
  Serial.println();
}

void notifyServer() {
  notifyServerProcess.begin(F("python"));
  notifyServerProcess.addParameter(F("/root/notifyStatus.py"));
  if(shieldOK) notifyServerProcess.addParameter("8");
  else notifyServerProcess.addParameter("2");
  notifyServerProcess.run();

  Serial.println(F("notifyStatus: "));  
  while (notifyServerProcess.available()>0) {
    char c = notifyServerProcess.read();
    Serial.print(c);
  }
  Serial.flush();
  Serial.println();
}
