String ipServer = "192.168.1.10:3000";


void serveIncomingRequest() {
  YunClient client = server.accept();
  if (client) {
    String url = client.readString();
    String command = getTrimValue(url, '/', 0);
    Serial.println("-------- incoming connection ------->");
    Serial.println(command);
    command.trim();
    if (command == "read") {
      sendCardUIDtoCloud(client);
    } else if(command == "status") {
      sendStatus(client);
      Serial.print("should set the server ip: ");
      Serial.println( getTrimValue(url, '/', 1) );
      Serial.print("should set the timestamp in seconds from epoch:");
      String timestamp = getTrimValue(url, '/', 2);
      Serial.println(timestamp);
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

void sendCardUIDtoCloud(YunClient &client) {
  Serial.println("-------- read recieved.. responding with the json --------");
  client.println("Status:200");
  client.println("content-type:application/json");
  client.println();
  client.print("{ \"type\": ");
  client.print(uidLength);
  client.print(", \"value\": \"");
  client.print(uidString);
  client.println("\"}");
}

void askPermission() {
  HttpClient client;
  
  String url = ipServer+"/api/checkin/"+ uidString +"/"+"2000"+"/"+ String(NODE_ID);
  //String url = ipServer+"/api/users";
  
  Serial.println(url);
  client.get(url);

  String response = "";

  while (client.available()) {
    response += (char)client.read();
  }
  Serial.println(response);
  Serial.flush();
  
  if(response=="y") {
    tick = true;
    tick_prevMillis = millis();
  }
}
