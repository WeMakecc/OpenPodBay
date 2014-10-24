#define PASSWORD "wemake"
int pinRed = 8;
int pinGreen = 9;
int pinYellow = 10;

#define STATUS_NOT_RESERVED 0
#define STATUS_RESERVED 1
#define STATUS_RESERVED_USE 2
#define STATUS_RESERVED_ALARM 3

int _status = STATUS_NOT_RESERVED;

int ledState1 = LOW;
volatile unsigned long blinkCount1 = 0;

//---------------------------------------------- setup

void setupCustom() {
  pinMode(pinRed, OUTPUT);
  pinMode(pinGreen, OUTPUT);
  pinMode(pinYellow, OUTPUT);
}

//---------------------------------------------- loop

void loopCustom() {
  // accept connection from server that ask if a tag is present and respond with the current UID
  serveIncomingRequest();

  ledStatus();
}

//---------------------------------------------- serve request
void serveIncomingRequest() {
  YunClient client = server.accept();
  if (client) {
    String url = client.readString();
    String command = getTrimValue(url, '/', 0);
    Serial.println(F("incoming connection"));
    Serial.println(command);
    command.trim();

    // command to move the arduino in STATUS_RESERVED mode
    if (command == "reserved") {
      if (_status == STATUS_RESERVED || _status == STATUS_RESERVED_ALARM) {
        // this is a double check.. it can happen when the server crashed inside a reservation
        cleanInterrupt();
      }

      _status = STATUS_RESERVED;
    }

    // command to move the arduino in STATUS_RESERVED_ALARM mode
    if (command == "reservedalarm") {
      Serial.println(_status);
      if (_status == STATUS_RESERVED_USE) {
        _status = STATUS_RESERVED_ALARM;
        setStatusReservedEnd();
      }
    }

    // command to move the arduino back in NOT_STATUS_RESERVED mode
    if (command == "reservedend") {
      _status = STATUS_NOT_RESERVED;
      cleanInterrupt();
      setNotUse();
    }

    client.stop();
    Serial.println(F("connection closed"));
    delay(15);
  }
}

//---------------------------------------------- ask permission

void askPermission() {
  if (_status == STATUS_RESERVED_USE || _status == STATUS_RESERVED_ALARM) {
    Serial.println("machine in use, stop");
    return;
  }

  Timer3.initialize(100000);
  Timer3.attachInterrupt(blinkCardReceived);

  askPermissionProcess.begin(F("python"));
  askPermissionProcess.addParameter(F("/root/callserver.py"));
  askPermissionProcess.addParameter(F("2"));
  askPermissionProcess.addParameter(uidString);
  askPermissionProcess.run();

  const int COMMAND_NONE = 0;
  const int COMMAND_N = 1;
  const int COMMAND_Y = 2;

  int command = COMMAND_NONE;
  int d = 0;
  String timeString = "";

  Serial.println("answer:");
  while (askPermissionProcess.available() > 0) {
    char c = askPermissionProcess.read();

    if (command == COMMAND_N) {
      // just debug
      Serial.print(c);
    } else if (command == COMMAND_Y) {
      timeString += c;
    }

    if (command == COMMAND_NONE && c == 'n') {
      Serial.println("N");
      command = COMMAND_N;
      displayAccessNegate();
    } else if (command == COMMAND_NONE && c == 'y') {
      Serial.println("Y");
      command = COMMAND_Y;
    }
  }

  if (command == COMMAND_Y) {
    setStateUse();
  }

  Serial.flush();
  Serial.println();
}

void setStateUse() {
  _status = STATUS_RESERVED_USE;

  ledState1 = LOW;
  Timer3.initialize(500000);
  Timer3.attachInterrupt(blinkReservedUsage);

  Serial.println("I have to do the login into the lenovo");
}

void setStatusReservedEnd() {
  Timer3.detachInterrupt();
  digitalWrite(pinGreen, LOW);

  ledState1 = LOW;
  Timer3.initialize(100000);
  Timer3.attachInterrupt(blinkReservedAlarm);
}

void cleanInterrupt() {
  Timer3.detachInterrupt();
  digitalWrite(pinGreen, LOW);
  digitalWrite(pinYellow, LOW);
  ledState1 = LOW;
}

void setNotUse() {
  Serial.println("I have to do the logout into the lenovo");
}
