
//---------------------------------------------------------------------------- setup the shield
void setupNFC() {
  
  delay(1000);
  Serial.println("Setup nfc..");

  nfc.begin();
  uint32_t versiondata = nfc.getFirmwareVersion();
  if (! versiondata) {
    Serial.println("Didn't find PN53x board");
    shieldOK = false;
  } else {
    shieldOK = true;
    Serial.print("Found chip PN5"); Serial.println((versiondata>>24) & 0xFF, HEX); 
    Serial.print("Firmware ver. "); Serial.print((versiondata>>16) & 0xFF, DEC); 
    Serial.print('.'); Serial.println((versiondata>>8) & 0xFF, DEC);
    // configure board to read RFID tags
    nfc.SAMConfig();  
    nfc.setPassiveActivationRetries(5);
    Serial.println("Waiting for an ISO14443A Card ...");
  }
}

//---------------------------------------------------------------------------- read NFC tag each `readNFC_interval` seconds
unsigned long readNFC_prevMillis = 0;
const long readNFC_interval = 1000;

void readNFC() {
  unsigned long readNFC_currentMillis = millis();
  if(readNFC_currentMillis - readNFC_prevMillis >= readNFC_interval) {
    readNFC_prevMillis = readNFC_currentMillis;
    
    readNFC_uid();
    
    if(uidString_last != uidString) {
      if(uidLength <= 0) {
        Serial.println("tag removed..");
        //Bridge.put("uidLength", String(""));
        //Bridge.put("uidString", String(""));
      } else {
        printUID();
        askPermission();
        Bridge.put("uidLength", String(uidLength));
        Bridge.put("uidString", String(uidString));
      }
    }
  }
}

//---------------------------------------------------------------------------- read and pring UID
void readNFC_uid() {
  //Serial.println("reading the nfc..");
  uint8_t success;  

  // zero the buffer
  uidString_last = uidString;
  uidLength = 0;
  memset(uid, 0, 7);
  uidString = "";

  // Wait for an ISO14443A type cards. uidLength will indicate if the uid is 4 bytes (Mifare Classic) or 7 bytes (Mifare Ultralight)
  success = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength);
  if (success) {
    if(uidLength!=NOT_FOUND) {
      // fill uidString with the uid
      uid_array2string2(uidString, uid, uidLength);
    }
  }
}

void printUID() {
  Serial.println("\n>--------------------");
  
  Serial.println("Found an ISO14443A card");
  Serial.print("  UID Length: ");Serial.print(uidLength, DEC);Serial.println(" bytes");
  Serial.print("  UID Value: ");
  nfc.PrintHex(uid, uidLength); 
  
  switch(uidLength) {
    case MIFARE_CLASSIC: Serial.println("MiFare classic"); break;
    case MIFARE_ULTRA: Serial.println("MiFare ultralight"); break;
  }
  Serial.println(uidString);
    
  Serial.println("--------------------<");
}
