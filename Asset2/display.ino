int ledState = LOW;

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

