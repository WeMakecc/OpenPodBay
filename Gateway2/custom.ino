int tickled = 5;

int pinRed = 10;
int pinGreen = 9;
int pinYellow = 8;

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

  // if the door has to be opened tick the relay
  tickTheDoor();

  ledStatus();
}

bool tick = false;
unsigned long tick_prevMillis = 0;
const long tick_interval = 1000;

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

//---------------------------------------------- serve request
void serveIncomingRequest() {
  YunClient client = server.accept();
  if (client) {
    String url = client.readString();
    String command = getTrimValue(url, '/', 0);
    Serial.println(F("incoming connection"));
    Serial.println(command);
    command.trim();
    if (command == "doortick") {
      doTheCheckIn();
      client.println(F("Status:200"));
    }
    client.stop();
    Serial.println(F("connection closed"));
  }
  delay(50);
}

//---------------------------------------------- ask permission

void askPermission() {
  Timer3.initialize(100000);
  Timer3.attachInterrupt(blinkYellowLED);

  askPermissionProcess.begin(F("python"));
  askPermissionProcess.addParameter(F("/root/askPermission.py"));
  askPermissionProcess.addParameter(uidString);
  askPermissionProcess.run();

  bool askPermissionResult = false;

  Serial.println(F("askPermission: "));
  while (askPermissionProcess.available() > 0) {
    char c = askPermissionProcess.read();
    Serial.print(c);

    if (c == 'y') {
      doTheCheckIn();
      askPermissionResult = true;
      break;
    } else {
      
    }
  }
  
  if(!askPermissionResult) {
    displayAccessNegate();
  }
  
  Serial.flush();
  Serial.println();
}

void doTheCheckIn() {
  tick = true;
  tick_prevMillis = millis();
}

