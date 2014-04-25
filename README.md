Beep Assistance Client Backend
==============================

Part of the beep assistance client application, which deals with the hardware (barcode scanners) handling and data fetching from beep-core-web-api to instantly emit it to the beep-assistance-client-web-ui.

Pre-Install
-----------

In order to install this application you must have its dependencies:
* Nodejs 	>= 0.10.25
* MongoDB >= 2.2.4
* At least one wired barcode scanner

Install
-------

* Make working directory: 	$ mkdir -p ~/workspace/www/beep_assistance_backend && cd $_
* Clone this repository : 	$ git clone https://github.com/IglekidsDev/beep-assistance-client-backend.git
* Install all dependencies: $ npm install

** If you have some trouble with the last step should be a problem with node-hid module please check its [repo](https://github.com/node-hid/node-hid). **

Exec
----

This software has been build and tested with Honeywell barcode scanners (Model: Voyager 1250), you must update the vendorID and productID in beep_assistance.js if you have a different device.

* Plug in the barcode scanners
* Exec: $ node ~/workspace/www/beep_assistance_backend/beep_assistance.js \<location_id\>