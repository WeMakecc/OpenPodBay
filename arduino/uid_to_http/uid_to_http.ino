#include <Bridge.h>
#include <YunServer.h>
#include <YunClient.h> 
#include <HttpClient.h>
 
#include <Wire.h>
#include <Adafruit_NFCShield_I2C.h>

#define NODE_ID 0

#define IRQ   (6)
#define RESET (7)  // Not connected by default on the NFC Shield

Adafruit_NFCShield_I2C nfc(IRQ, RESET);

bool shieldOK = false;
int shieldOKled = 12;

#define NOT_FOUND 0
#define MIFARE_CLASSIC 4
#define MIFARE_ULTRA 7

uint8_t uid[7];
uint8_t uidLength;
String uidString = "";
String uidString_last = "";

YunServer server;

bool tick = false;
int tickled = 13;

void setup(void) {
  
  // pin modes
  pinMode(shieldOKled, OUTPUT);
  pinMode(tickled, OUTPUT);

  // setup and inits
  Bridge.begin();
  server.listenOnLocalhost();
  server.begin();
  setupNFC();
  
  //let's go!
  Serial.begin(115200);
  delay(5000);
  Serial.println("Hello!");  
}

void loop(void) {
  // try to read a new NFC tag
  if(shieldOK) {
    digitalWrite(shieldOKled, HIGH);  
    readNFC();
  } else {
    digitalWrite(shieldOKled, LOW);
  }
  
  // accept connection from server that ask if a tag is present and respond with the current UID
  sendCardUIDtoCloud(); 
  
  tickTheDoor();
}

unsigned long tick_prevMillis = 0;
const long tick_interval = 5000;
void tickTheDoor() {
  if(tick==false) {
    digitalWrite(tickled, LOW);
    return;
  }
  digitalWrite(tickled, HIGH); 
  
  unsigned long tick_currentMillis = millis();
  if(tick_currentMillis - tick_prevMillis >= tick_interval) {
    tick_prevMillis = tick_currentMillis;  
    tick = false;
  } else {
    
  }
}

void uid_array2string2(String &s, const byte * pin, const uint8_t numBytes) { 
  s = "_";
  const char * hex = "0123456789ABCDEF";
  int i = 0;
  for(; i < numBytes-1; ++i){
    s += hex[(*pin>>4)&0xF];
    s += hex[(*pin++)&0xF];
    s += '_';
  }
  s += hex[(*pin>>4)&0xF];
  s += hex[(*pin++)&0xF];
}