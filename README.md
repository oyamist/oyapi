# oyapi
OyaPi is Raspberry Pi 3 software for monitoring and controlling aeroponics systems.
With OyaPi you can schedule grow tent lighting cycles as well as pump misting cycles.

<a href="https://raw.githubusercontent.com/oyamist/oyapi/master/static/img/oyapi.png">
    <img src="https://raw.githubusercontent.com/oyamist/oyapi/master/static/img/oyapi.png" height=400px>
</a>

### Sensors
The following sensors are currently supported:

    | Sensor | Measurement | Immersible| Protocol |
    | :----: | :----: | :----: |
    | DS18B20 | Temperature | Yes | I2C |
    | Atlas Scientific EZO EC K1 | Conductivity (EC) | Yes | I2C |
    | AM2315 | Temperature/Humidity | No | I2C |
    | SHT31-DIS | Temperature/Humidity | No | I2C |

### Other
* Software: NodeJS, Vue, Vuetify, SQlite3

