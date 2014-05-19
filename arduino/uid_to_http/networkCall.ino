void sendCardUIDtoCloud() {
  YunClient client = server.accept();
  if (client) {
    String command = client.readString();
    Serial.println("-------- incoming connection --------");
    Serial.println(command);
    command.trim();
    if (command == "read") {
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
    client.stop();
  }
  delay(50);
}

String ipServer = "192.168.1.17:3000";

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
