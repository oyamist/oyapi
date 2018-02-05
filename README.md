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


### Network Management
OyaPi displays summary status of all active OyaPi devices on the local subnet.
<a href="https://raw.githubusercontent.com/oyamist/oyapi/master/static/img/oyapi.png">
    <img src="https://raw.githubusercontent.com/oyamist/oyapi/master/static/img/oyapi.png" height=400px>
</a>

### Other
* Software: NodeJS, Vue, Vuetify, SQlite3

