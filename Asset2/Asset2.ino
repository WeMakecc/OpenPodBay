#include <Bridge.h>
#include <YunServer.h>
#include <YunClient.h>
#include <Wire.h>
#include <Adafruit_NFCShield_I2C.h>
#include <SimpleTimer.h>
#include <TimerThree.h>

//---------------------------------------------- NFC
#define IRQ   (6)
#define RESET (7)  // Not connected by default on the NFC Shield

Adafruit_NFCShield_I2C nfc(IRQ, RESET);

bool shieldOK = false;

#define NOT_FOUND 0
#define MIFARE_CLASSIC 4
#define MIFARE_ULTRA 7

uint8_t uid[7];
uint8_t uidLength;
String uidString = "";
String uidString_last = "";

//---------------------------------------------- communication to the Bridge
SimpleTimer timerNotify;
YunServer server;

Process askPermissionProcess;
Process notifyServerProcess;

bool server_ok = false;

//---------------------------------------------- setup
void setup(void) {
  delay(2000);      // we're lazy

  setupCustom();

  Serial.begin(115200);

  // the bridge library
  Serial.println(F("Bridge"));
  Bridge.begin();
  delay(1000);

  // the yun server
  Serial.println(F("YunServer"));
  server.listenOnLocalhost();
  server.begin();
  delay(1000);

  // nfc
  setupNFC();

  // notify the server
  timerNotify.setInterval(60000, notifyServer);

  // the end
  Serial.println(F("."));
}

//---------------------------------------------- loop
void loop(void) {
  
  // try to read a new NFC tag
  if (shieldOK) {
    readNFC();
    delay(100);
  }

  // periodically notify the server
  timerNotify.run();

  // do the custom operation
  loopCustom();
}

//---------------------------------------------- notifyServer

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
    
    if(c=='y') {
      server_ok = true;
      Serial.print("OK");
      break;  
    } else {
      //Serial.print("n");
      server_ok = false;
    }
  }
  Serial.flush();
  Serial.println();
}

//---------------------------------------------- utils

void uid_array2string2(String &s, const byte * pin, const uint8_t numBytes) {
  s = "_";
  const char * hex = "0123456789ABCDEF";
  int i = 0;
  for (; i < numBytes - 1; ++i) {
    s += hex[(*pin >> 4) & 0xF];
    s += hex[(*pin++) & 0xF];
    s += '_';
  }
  s += hex[(*pin >> 4) & 0xF];
  s += hex[(*pin++) & 0xF];
}

String getTrimValue(const String &data, char separator, int index)
{
  // from http://stackoverflow.com/questions/9072320/split-string-into-string-array
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length() - 1;

  for (int i = 0; i <= maxIndex && found <= index; i++) {
    if (data.charAt(i) == separator || i == maxIndex) {
      found++;
      strIndex[0] = strIndex[1] + 1;
      strIndex[1] = (i == maxIndex) ? i + 1 : i;
    }
  }

  return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}
