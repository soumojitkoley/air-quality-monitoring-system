#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <Servo.h>

const char* ssid = "your-wifi-ssid";
const char* password = "your-wifi-password";
const char* serverAddress = "your-server-address";
const int serverPort = 443;
const int ledPin = D5; 
const int greenLedPin = D6;
const int servoPin = D7;
const int yellowLedPin = D8;

const int MQ135Pin = A0;

LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo myServo;

void setup() {
  Serial.begin(9600);
  WiFi.begin(ssid, password);
  
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  pinMode(D4, OUTPUT);
  digitalWrite(D4, HIGH);
  pinMode(D6, OUTPUT);
  pinMode(D8, OUTPUT);
  pinMode(ledPin, OUTPUT);

  lcd.init();                      
  lcd.backlight();     

  myServo.attach(servoPin);
  myServo.write(0);

  lcd.setCursor(0, 0);
  lcd.print("WELCOME TO AQMS");
  lcd.setCursor(0, 1);
  lcd.print(" MADE BY ABKSW ");
  delay(3000);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("     MENTOR:    ");
  lcd.setCursor(0, 1);
  lcd.print("AMIT KUMAR NANDI");
  delay(3000);
  lcd.clear();
  lcd.print(" WIFI CONNECTED");
  delay(2000);
  lcd.clear();
}

void loop() {
  int sensorValue = analogRead(MQ135Pin);
  sendAirQualityData(sensorValue);
  Serial.print("  Air Quality - ");
  Serial.println(sensorValue);
  lcd.setCursor(0, 0);
  lcd.print("  AIR QUALITY - ");
  lcd.setCursor(6, 1);
  lcd.print(sensorValue);
  delay(1500);
  lcd.clear();

  if(sensorValue < 100){
    lcd.setCursor(0,0);
    lcd.print("               ");
    delay(1000); 
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("  AIR QUALITY - ");
    lcd.setCursor(0,1);
    lcd.print("      GOOD      ");
    blinkGreenLED();
    delay(1000);
    lcd.clear();
    Serial.println("GOOD AIR QUALITY");
  }

  if (sensorValue > 100 && sensorValue < 300) {
    lcd.setCursor(0,0);
    lcd.print("               ");
    delay(1000); 
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("  AIR QUALITY - ");
    lcd.setCursor(0,1);
    lcd.print("     STABLE    ");
    blinkYellowLED();
    delay(1000);
    lcd.clear();
    Serial.println("STABLE AIR QUALITY");
  }

  if(sensorValue > 300 && sensorValue < 400)
  {
    lcd.setCursor(0,0);
    lcd.print("               ");
    delay(1000); 
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("  AIR QUALITY - "); 
    lcd.setCursor(0,1); 
    lcd.print("      BAD      ");
    blinkLED();
    delay(500);
    lcd.clear();
    Serial.println("BAD AIR QUALITY");
  }

  if(sensorValue > 400)
  {
    lcd.setCursor(0,0);
    lcd.print("               ");
    delay(1000); 
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("   EMERGENCY   ");
    delay(1000);
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("  AIR QUALITY - ");
    lcd.setCursor(0,1);
    lcd.print("    VERY BAD    ");
    blinkLED();
    delay(1000);
    lcd.clear();
    Serial.println("EMERGENCY \nVERY BAD AIR QUALITY");
  }

  if (sensorValue > 600) {
    openDoor();
  } else {
    closeDoor();
  }
}

void blinkLED() {
  digitalWrite(ledPin, HIGH);
  delay(1000);
  digitalWrite(ledPin, LOW);
}

void blinkGreenLED() {
  digitalWrite(greenLedPin, HIGH);
  delay(1000);
  digitalWrite(greenLedPin, LOW);
}

void blinkYellowLED() {
  digitalWrite(yellowLedPin, HIGH);
  delay(1000);
  digitalWrite(yellowLedPin, LOW);
}

void openDoor() {
  myServo.write(180); 
}

void closeDoor() {
  myServo.write(0);
}

void sendAirQualityData(int airQualityValue) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    std::unique_ptr<BearSSL::WiFiClientSecure>client(new BearSSL::WiFiClientSecure);
    client->setInsecure();
    
    String url = "https://" + String(serverAddress) + "your-server-data-path";
    Serial.print("Connecting to: ");
    Serial.println(url);

    http.begin(*client, url);

    http.addHeader("Content-Type", "application/json");

    
    String jsonPayload = "{\"airQuality\":" + String(airQualityValue) + "}";
    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response code: " + String(httpResponseCode));
      Serial.println(response);
    } else {
      Serial.print("Error sending POST request. Error code: ");
      Serial.println(httpResponseCode);
      Serial.println(http.errorToString(httpResponseCode));
    }

    http.end();
  } else {
    Serial.println("WiFi not connected");
  }
}
