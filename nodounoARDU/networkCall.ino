void serveIncomingRequest() {
  YunClient client = server.accept();
  if (client) {
    String url = client.readString();
    String command = getTrimValue(url, '/', 0);
    Serial.println("-------- incoming connection ------->");
    Serial.println(command);
    command.trim();
    if(command == "status") {
      sendStatus(client);
      Serial.print("should set the server ip: ");
      Serial.println( getTrimValue(url, '/', 1) );
      Serial.print("should set the timestamp in seconds from epoch:");
      String timestamp = getTrimValue(url, '/', 2);
      Serial.println(timestamp);
    } else if(command == "doortick") {
      Serial.println('rough door tick');
      doTheCheckIn();
      client.println("Status:200");
    }
    client.stop();
    Serial.println("-------- connection closed -------<");
  }
  delay(50);
}

void sendStatus(YunClient &client) {
  
  // test from a remote address:
  // date +%s | xargs -I % curl -u root:password http://192.168.1.10/arduino/status/1.1.1.1/%
  
  Serial.println("-------- status recieved.. responding with the json --------");
  client.println("Status:200");
  client.println("content-type:application/json");
  client.println();
  client.print("{ \"status\": \"OK\"");
  client.print(", \"nodeId\": "); client.print(NODE_ID);
  client.println("}");
}

void askPermission() {
  HttpClient client;
  
  String url = serverAddress+"/api/checkin/"+ uidString +"/"+"2000"+"/"+ String(NODE_ID);
  //String url = ipServer+"/api/users";
  
  Serial.println(url);
  client.get(url);

  String response = "";
  String serverIp, port;

  while (client.available()) {
    response += (char)client.read();
  }
  Serial.println(response);
  Serial.flush();
  
  if(response=="y") {
    doTheCheckIn();
  }
}

void notifyServer() {
  
  Process p;
  p.begin("python");
  p.addParameter("/root/notifyStatus.py");
  p.addParameter("8");
  p.run();

  Serial.println("notifyStatus: ");  
  while (p.available()>0) {
    char c = p.read();
    Serial.print(c);
  }
  Serial.println();
}
