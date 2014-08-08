void serveIncomingRequest() {
  YunClient client = server.accept();
  if (client) {
    String url = client.readString();
    String command = getTrimValue(url, '/', 0);
    Serial.println(F("-------- incoming connection ------->"));
    Serial.println(command);
    command.trim();
    if(command == "doortick") {
      Serial.println(F("rough door tick"));
      doTheCheckIn();
      client.println(F("Status:200"));
    }
    client.stop();
    Serial.println(F("-------- connection closed -------<"));
  }
  delay(50);
}

void askPermission() {
  Process p;
  p.begin(F("python"));
  p.addParameter(F("/root/askPermission.py"));
  p.addParameter(uidString);
  p.run();

  Serial.println(F("askPermission: "));  
  while (p.available()>0) {
    char c = p.read();
    Serial.print(c);
    
    if(c=='y') {
      doTheCheckIn();
    }
    
  }
  Serial.flush();
  Serial.println();
}

void notifyServer() {
  
  Process p;
  p.begin(F("python"));
  p.addParameter(F("/root/notifyStatus.py"));
  p.addParameter("8");
  p.run();

  Serial.println(F("notifyStatus: "));  
  while (p.available()>0) {
    char c = p.read();
    Serial.print(c);
  }
  Serial.flush();
  Serial.println();
}
