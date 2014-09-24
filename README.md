![MacDown logo](http://macdown.uranusjr.com/static/base/img/logo-160.png)

*Open the pod bay doors, please, HAL. Open the pod bay doors, please, HAL.*

## Open pod bay door

Pod bay door is an opensource access control system designed and developed at [wemake.cc](http://wemake.cc), a makerspace in Miland, Italy.

Even if it responds to specific needs of our organization and arrangement, and even if some parts are still in a rough development stage, we have decided to open source it. Maybe you want to build something like this, or maybe you're just courious. In any case, we're just curious to hear your voice! Just drop us an [email](hello@wemake.cc), fork this repository, or open an issue.

Control access system.. yeah we was talking about it. We are a makerspace, that is a place where you can come and rent machines for rapid prototype and digital fabbrication and have fun. As a way to access our space we're using NFC/RFID badge, that every users has to keep with himself. In front of every door and in front of every machines we have a card reader (we call the doors "gateway" and the machines "asset"). The card readers communicate to a database that keeps all users and reservations, and all additional data. There is also a web panel to interact with the database, add, modify or delete users, make reservation to a machine, etc. etc.

From the tech point of view, we have used some of the technology that are springing in the so called *internet of things*, and you will read about them in the next sesison.

Because of some too specific use case about how people interact with our organization, pay the membership and stuff like that, we have open sourced only a part of the system, and the web panel is meant to be used only from administrator. But you can still fork the repository, extends the existing codebase and adapt it to your needs.

## Architecture overview

As previously mentioned we have some reader modules in our space. We are using [Adafruit NFC reader](http://www.adafruit.com/products/789). Each of those readers are controlled by an [Arduino YUN](http://arduino.cc/en/Main/ArduinoBoardYun?from=Products.ArduinoYUN) and we think that this piece of hardware is an extremly usefull component in the Internet of Things world. It is a microcontroller with a microprocessor and an embdedded linux machine with ethernet and wifi interface on it. The microcontroller part can do the physical computation things (read the NFC, switch on/off the realys of electronic locks) while the linux part can handle the network protocol things.

All the modules communicate with a central server (that we are calling in italian "centalina") that keeps track of the users in a database. We chose Sqlite as a database because it is particularly good for embdedded computers, and you can choose a Raspberry PI or an Arduino Tre as the hardware for the server.

The server is build with node.js, that is gaining more and more popolarity the web application world. It handles the database, it respends to the NFC modules and it serve the web panel. The web panel is build with JQuery and Twitter Bootstrap.

The server-side code is splitted in two parts. The first one is called "service" and handle the incoming request from the nfc modules and it is protected only with a basic auth password (not encrypted!). The second handles the web server REST API, the AJAX calls and the rendered html views for the web panel. It is protected with a basic auth password plus HTTPS protocol and it runs in a different port. For security reasons we have put all the system in a separate network in a dedicated router. For instance the server is on a static ip, and all the modules are with DHCP and we are forwarding outside the HTTPS port to visit the web panel from home.

## Organization of this repository

This repository is organized as follow:

- `centralina`: a directory that contains the server in node.js.
- `nodounoARDU`: a model of the module with the Arduino code and some python scripts.
- `doc`: documents and images
- `CREDITS.txt`: credits and licences of the used libraries, plugins, addons, etc
- `README.md`: this document

You'll gonna find a README in (almost) each of the directory.

## Problems on the way and known bugs

Internet of things is about networked objects and during the development of this project the network represented a big issue, of course. We have to say that Arduino YUN, even if we are thinking that it is one of the best choices for such type of projects, is not bomb proof when you're talking about wirless connection stability. For debugging this problem we have implemented a **discovery/notification system** where the clients periodically pings the server. We have tried to use Bonjour/Zeroconf protocol, that is great for discovery but not as good for status notification so we choose to implement our own system.

Moreover, the web-dev is a very fast road and things are growing very fast. We are not updated to the latest technology ever. We are aware of this. If you want to collaborate with us forking the repository and try to add one of the new MVC frameworks so popular right now.. we are happy if someone wants to join us in the development!

## Greetings

...