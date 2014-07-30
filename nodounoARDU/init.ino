#include <FileIO.h>

void initSerialBridge() {
  Serial.begin(115200);

  Serial.println("Starting bridge..");
  Bridge.begin();
  delay(1000);

  Serial.println("Starting YunServer..");
  server.listenOnLocalhost();
  server.begin();
  delay(1000);

  Serial.println("Starting FileSystem communication..");
  FileSystem.begin();
  delay(1000);
}

void initPinModes() {
  Serial.println("Set the pins..");

  // pin modes
  pinMode(shieldOKled, OUTPUT);
  pinMode(tickled, OUTPUT);

}

String serverAddress = "";
const char* settings_file = "/root/settings";
void initConfigs() {
  File settings = FileSystem.open(settings_file, FILE_READ);
  
  while(settings.available()) {
    char inByte = (char)settings.read();
    if(inByte != '\n' && inByte != '\r')
      serverAddress += inByte;
  }
  
  Serial.println(serverAddress);
}
