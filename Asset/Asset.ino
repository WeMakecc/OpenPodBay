
//---------------------------------------------- includes
#include <Bridge.h>
#include <YunServer.h>
#include <YunClient.h>
#include <Wire.h>
#include <Adafruit_NFCShield_I2C.h>
#include <SimpleTimer.h>

//---------------------------------------------- NFC
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

bool tagOver = false;

//---------------------------------------------- some globals
SimpleTimer timer;
YunServer server;

bool tick = false;
int tickled = 5;

//---------------------------------------------- led status notification
#define STATUS_NOT_RESERVED 0
#define STATUS_RESERVED 1

int _status = STATUS_NOT_RESERVED;
bool reservation_active = false;

int pinRed = 8;
int pinGreen = 9;
int pinYellow = 10;

long time_to_use = 0;
long time_to_be_reserved = 0;

//---------------------------------------------- setup
void setup(void) {
  delay(2000);      // we're lazy

  tagOver = false;
  _status = STATUS_NOT_RESERVED;

  pinMode(pinRed, OUTPUT);
  pinMode(pinGreen, OUTPUT);
  pinMode(pinYellow, OUTPUT);

  initSerialBridge();
  initPinModes();
  initConfigs();
  setupNFC();

  Serial.println(F("."));

  timer.setInterval(60000, notifyServer);
  notifyServer();
}

//---------------------------------------------- loop
void loop(void) {
  // try to read a new NFC tag
  if ( shieldOK && _status==STATUS_RESERVED && !reservation_active ) {
    digitalWrite(shieldOKled, HIGH);
    readNFC();
    delay(100);
  } else {
    digitalWrite(shieldOKled, LOW);
  }

  // accept connection from server that ask if a tag is present and respond with the current UID
  serveIncomingRequest();

  // periodically notify the server
  timer.run();

  // if the door has to be opened tick the relay
  tickTheDoor();

  ledStatus();
  
  if(_status==STATUS_RESERVED && millis() >= time_to_be_reserved) {
    _status = STATUS_NOT_RESERVED;
    reservation_active = false;
  }
}

//---------------------------------------------- led handling

unsigned long green_blink_previousMillis = 0;
const long green_blink_interval = 500;
int green_blink_ledState = LOW;

void ledStatus() {
  if (_status == STATUS_NOT_RESERVED) {
    
    digitalWrite(pinGreen, HIGH);
    digitalWrite(pinYellow, LOW);

  } else if (_status == STATUS_RESERVED) {
    digitalWrite(pinYellow, HIGH);
    
    unsigned long green_blink_currentMillis = millis();
    if (green_blink_currentMillis - green_blink_previousMillis >= green_blink_interval) {
      green_blink_previousMillis = green_blink_currentMillis;
      if (green_blink_ledState == LOW) green_blink_ledState = HIGH;
      else green_blink_ledState = LOW;
      digitalWrite(pinGreen, green_blink_ledState);
      
    }
    
    if(reservation_active) digitalWrite(pinYellow, HIGH);
    else digitalWrite(pinYellow, LOW);

  }

}

//---------------------------------------------- door tick

unsigned long tick_prevMillis = 0;
const long tick_interval = 1000;

void doTheCheckIn() {
  tick = true;
  tick_prevMillis = millis();
}

void tickTheDoor() {
  if (tick == false) {
    digitalWrite(tickled, LOW);
    return;
  }
  digitalWrite(tickled, HIGH);

  unsigned long tick_currentMillis = millis();
  if (tick_currentMillis - tick_prevMillis >= tick_interval) {
    tick_prevMillis = tick_currentMillis;
    tick = false;
    Serial.println("tick closed");
  } else {

  }
}

//---------------------------------------------- utils

void uid_array2string2(String & s, const byte * pin, const uint8_t numBytes) {
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

String getTrimValue(const String & data, char separator, int index)
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
