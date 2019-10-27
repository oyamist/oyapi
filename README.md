# oyapi
OyaPi is Raspberry Pi 3 software for monitoring and controlling aeroponics systems.
With OyaPi you can schedule grow tent lighting cycles as well as pump misting cycles.
OyaPi automatically logs sensor data and provides you with live measurements
as well as historical charts.

<a href="https://raw.githubusercontent.com/oyamist/oyapi/master/static/img/oyapi.png">
    <img src="https://raw.githubusercontent.com/oyamist/oyapi/master/static/img/oyapi.png" height=400px>
</a>

### Sensors
The following sensors are currently supported:

| Sensor | Measurement | Immersible | Protocol | Calibration |
| :---- | :----: | :----: | :----: | :----: |
| [DS18B20](https://www.adafruit.com/product/381) | Temperature | Yes | 1-Wire | -- |
| [Atlas Scientific EZO EC K1](https://www.atlas-scientific.com/conductivity.html) | Conductivity (EC) | Yes | I2C | Neural Net |
| [AM2315](https://www.adafruit.com/product/1293) | Temperature/Humidity | No | I2C | -- |
| [SHT31-DIS](https://www.adafruit.com/product/2857) | Temperature/Humidity | No | I2C | -- |

Some probes (e.g., EC probes) require calibration for temperature compensation.
OyaPi uses an internal neural network for temperature compensation. The OyaPi
neural network is more accurate than linear (i.e., 1- or 2-point) 
approximations commonly used in industry.

### Network Dashboard
OyaPi displays summary status of all active OyaPi devices on the local subnet.
<a href="https://raw.githubusercontent.com/oyamist/oyapi/master/static/img/oyapi-network.png">
    <img src="https://raw.githubusercontent.com/oyamist/oyapi/master/static/img/oyapi-network.png" height=400px>
</a>

### Other
* Software: NodeJS, Vue, Vuetify, SQlite3

# Installation

#### Set up the Raspberry Pi 3 operating system:

1. Install Rasbpian using [Noobs or Noobs Lite](https://www.raspberrypi.org/downloads/noobs/) on a 16GB Micro SD card (use larger capacity cards if you intend to use a camera). Choose a [fast SD card](http://www.pidramble.com/wiki/benchmarks/microsd-cards)
1. From a terminal window or console, use `sudo raspi-config` to configure the following:
    * Change password _(for your safety!)_
    * Network Options: Change hostname _(e.g., bioreactor1)_
    * Boot Options: Desktop / CLI : Console _(recommended)_
    * Localization Options: Change Timezone: _(set timezone for scheduling)_
    * Interfacing Options: Camera _(optional)_
    * Interfacing Options: SSH _(for remote access)_
    * Interfacing Options: I2C _(for sensors)_
    * Interfacing Options: 1-Wire _(for sensors)_
    * Finish and Reboot

#### Install OyaPi

Use `ssh` to login to your new Raspberry Pi 3 and enter the following commands
to install OyaPi (this will take several minutes):

```bash
mkdir github
cd github
git clone https://github.com/oyamist/oyapi
cd oyapi
./scripts/oyapi-install.sh
```
Reboot your Raspberry Pi and use a Chrome browser to access OyaPi using the hostname
you configured above (e.g., http://bioreactor1)

#### Recommended Hardware
OyaPi was developed and tested on a Raspberry Pi 3B+. 
It will probably work on other Raspberry Pi's.

One of the issues you will need to deal with is safety.
Farming requires water and water around electricity is dangerous.
The USA electrical code is quite strict about outdoor voltages.
Any voltage exceeding 20V has very strong code requirements.
This means that 24V pumps would require installation by licensed
electritian. Generally speaking, if you design your system around 12V
power and backup you will be fine. 

The Raspberry Pi doesn't take 12V. It needs 5V.
To get 5V from 12V, just use an LM2596 buck converter available on Amazon.

A very fun project is to set up your grow lights using OyaPi.
The AdaFruit https://www.adafruit.com/product/2935 controllable
power supply is ideal for this.


