void blinkCardReceived(void) {
  if (ledState1 == LOW) {
    ledState1 = HIGH;
    blinkCount1 = blinkCount1 + 1;  // increase when LED turns on
  } else {
    ledState1 = LOW;
  }

  if (blinkCount1 > 3) {
    blinkCount1 = 0;
    ledState1 = LOW;
    Timer3.detachInterrupt();
  }

  digitalWrite(pinYellow, ledState1);
}


void blinkReservedUsage(void) {
  if (ledState1 == LOW) {
    ledState1 = HIGH;
  } else {
    ledState1 = LOW;
  }
  
  digitalWrite(pinGreen, ledState1);
}

void blinkReservedAlarm(void) {
  if (ledState1 == LOW) {
    ledState1 = HIGH;
  } else {
    ledState1 = LOW;
  }
  
  digitalWrite(pinYellow, ledState1);
}

void ledStatus() {
  digitalWrite(pinRed, server_ok ? LOW : HIGH);

  if (_status == STATUS_NOT_RESERVED) {
    statusNotReserved();
  } else if (_status == STATUS_RESERVED) {
    statusReserved();
  } else if (_status == STATUS_RESERVED_USE) {
    statusReservedUse();
  } else if (_status == STATUS_RESERVED_ALARM) {
    statusReservedEnd();
  }
}

void statusNotReserved() {
  digitalWrite(pinGreen, HIGH);
  digitalWrite(pinYellow, LOW);
}

void statusReserved() {
  digitalWrite(pinGreen, LOW);
  digitalWrite(pinYellow, HIGH);
}

void statusReservedUse() {
  // done by the Timer3 interrup callback
}

void statusReservedEnd() {
  // done by the Timer3 interrup callback
}

void displayAccessNegate() {
  Serial.println("access negate");
  digitalWrite(pinRed, HIGH);
  delay(500);
  digitalWrite(pinRed, LOW);
}
