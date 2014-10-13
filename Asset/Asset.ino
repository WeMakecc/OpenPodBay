
//---------------------------------------------- includes
#include <Bridge.h>
#include <YunServer.h>
#include <YunClient.h>
#include <Wire.h>
#include <Adafruit_NFCShield_I2C.h>
#include <SimpleTimer.h>
#include <TimerOne.h>

//---------------------------------------------- NFC
#define IRQ   (6)
#define RESET (7)  // Not connected by default on the NFC Shield

#define NOT_FOUND 0
#define MIFARE_CLASSIC 4
#define MIFARE_ULTRA 7

Adafruit_NFCShield_I2C nfc(IRQ, RESET);

bool shieldOK = false;

uint8_t uid[7];
uint8_t uidLength;
String uidString = "";
String uidString_last = "";

bool tagOver = false;

//---------------------------------------------- communication to the Bridge
SimpleTimer timer;
YunServer server;

Process askPermissionProcess;
Process notifyServerProcess;

bool server_ok = false;

//---------------------------------------------- led status notification
#define STATUS_NOT_RESERVED 0
#define STATUS_RESERVED 1
#define STATUS_RESERVED_END 2

int _status = STATUS_NOT_RESERVED;
bool reservation_active = false;

//
int pinRed = 8;
int pinGreen = 9;
int pinYellow = 10;

long time_to_use = 0;
long time_to_be_reserved = 0;

//---------------------------------------------- setup
void setup(void) {
  delay(2000);      // we're lazy

  server_ok = false;
  tagOver = false;
  _status = STATUS_NOT_RESERVED;

  pinMode(pinRed, OUTPUT);
  pinMode(pinGreen, OUTPUT);
  pinMode(pinYellow, OUTPUT);

  initSerialBridge();
  setupNFC();

  timer.setInterval(60000, notifyServer);
  notifyServer();
  
  Timer1.initialize(1000000);
  Timer1.attachInterrupt(blinkLED);

  Serial.println(F("."));
}

void initSerialBridge() {
  Serial.begin(115200);

  Serial.println(F("Bridge"));
  Bridge.begin();
  delay(1000);

  Serial.println(F("YunServer"));
  server.listenOnLocalhost();
  server.begin();
  delay(1000);
}

//---------------------------------------------- loop
void loop(void) {
  // try to read a new NFC tag
  if ( shieldOK ) { //&& _status == STATUS_RESERVED && !reservation_active ) {
    readNFC();
    delay(100);
  }

  // accept connection from server that ask if a tag is present and respond with the current UID
  serveIncomingRequest();

  // periodically notify the server
  timer.run();

  ledStatus();
}

//---------------------------------------------- led handling

int ledState = LOW;
void blinkLED(void)
{
  if (ledState == LOW) {
    ledState = HIGH;
  } else {
    ledState = LOW;
  }
  digitalWrite(pinRed, ledState);
}

void ledStatus() {
  digitalWrite(pinRed, server_ok ? LOW : HIGH);
  
  if (_status == STATUS_NOT_RESERVED) {
    statusNotReserved();
  } else if (_status == STATUS_RESERVED) {
    statusReserved();
  } else if(_status == STATUS_RESERVED) {
    statusReservedEnd();
  }
}

void statusReservedEnd() {
  
}

void statusNotReserved() {
  analogWrite(pinGreen, 100);
  digitalWrite(pinYellow, LOW);
}

unsigned long green_blink_previousMillis = 0;
const long green_blink_interval = 500;
int green_blink_ledState = LOW;

void statusReserved() {
  unsigned long green_blink_currentMillis = millis();
  if (green_blink_currentMillis - green_blink_previousMillis >= green_blink_interval) {
    green_blink_previousMillis = green_blink_currentMillis;
    if (green_blink_ledState == LOW) green_blink_ledState = HIGH;
    else green_blink_ledState = LOW;
    digitalWrite(pinGreen, green_blink_ledState);
  }

  if (reservation_active) digitalWrite(pinYellow, HIGH);
  else digitalWrite(pinYellow, LOW);
}

void displayAccessDenied() {
  for(int i=0; i<3; i++) {
    digitalWrite(pinRed, LOW);
    delay(100);
    digitalWrite(pinRed, HIGH);
    delay(100);
  } digitalWrite(pinRed, LOW);
}

void displayTagOver() {
  for(int i=0; i<3; i++) {
    digitalWrite(pinYellow, LOW);
    delay(100);
    digitalWrite(pinYellow, HIGH);
    delay(100);
  } digitalWrite(pinYellow, LOW);
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
