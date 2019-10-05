# Sample configuration
```

// Complex Washing machine. Group acts as an umbrella and each group item has separate traits and allows you to control multiple options by having just single device on Google Home
Group Washer       "Washer"               {google="action.devices.types.WASHER"}
String Washer_Cycle       "Cycle" (Washer) {google="action.devices.traits.Modes" [ mode="Cycle=cycle", settings="Low=low,Medium=medium,High=high", commandMap="Low=1,Medium=1,High=2", lang="en", ordered=false ]}
String Washer_Temperature "Temperature" (Washer) {google="action.devices.traits.Modes" [ mode="Water Temperature=water Temperature", settings="Tap Cold=tap cold,Cold Warm=cold warm,Hot=hot,Extra Hot=extra hot", commandMap="Tap Cold=30,Cold Warm=40,Hot=60,Extra Hot=90", lang="en", ordered=true ]}
Switch Washer_Power       "Power"       (Washer) {google="action.devices.traits.OnOff"}

// All items are the same in group, and all are of type `Switch`
Switch Light_Outdoor_All "All Outdoor Lights" {google="action.devices.types.SWITCH" [groupType="Switch"]}

// Lock/Unlock with custom commands
String Door  "Door" {google="action.devices.types.DOOR" [trait="action.devices.traits.LockUnlock", lockCommand="LOCK", unlockCommand="UNLOCK"]} 

// control fan speed by saying `set Blower speed to default`
String Blower "Blower" { synonyms="Ventilation", google="action.devices.types.FAN" [lang="en", speeds="ventilation_level_0=away:zero,ventilation_level_1=default:standard:one,ventilation_level_2=high:two,ventilation_level_3=max:turbo:three", ordered="true"] }

// Simple lamp on off
Switch Lamp  "Main Lamp"    {google="action.devices.types.SWITCH"}

// Lamp with brightness controll
Dimmer BathroomLight  "Bathroom Lamp"    {google="action.devices.types.LIGHT"}
```

# Supported Devices

Devices allow you to have icons and certain synonyms in your google Home. Each device has a default [trait](https://developers.google.com/actions/smarthome/traits) (read: action) assigned, but you can easily mix and match and change them.


Device | Default Trait
------------ | -------------
[action.devices.types.GATE](https://developers.google.com/actions/smarthome/guides/gate) | [action.devices.traits.OpenClose](https://developers.google.com/actions/smarthome/traits/openclose)
[aaction.devices.types.SWITCH](https://developers.google.com/actions/smarthome/guides/switch) | [action.devices.traits.OnOff](https://developers.google.com/actions/smarthome/traits/onoff)
[action.devices.types.GARAGE](https://developers.google.com/actions/smarthome/guides/garage) | [action.devices.traits.OpenClose](https://developers.google.com/actions/smarthome/traits/openclose)
[action.devices.types.DOOR](https://developers.google.com/actions/smarthome/guides/door) | [action.devices.traits.OpenClose](https://developers.google.com/actions/smarthome/traits/openclose)
[action.devices.types.LOCK](https://developers.google.com/actions/smarthome/guides/lock) | [action.devices.traits.LockUnlock](https://developers.google.com/actions/smarthome/traits/lockunlock)
[action.devices.types.FAN](https://developers.google.com/actions/smarthome/guides/fan) | [action.devices.traits.FanSpeed](https://developers.google.com/actions/smarthome/traits/fanspeed)
[action.devices.types.WASHER](https://developers.google.com/actions/smarthome/guides/washer) | [action.devices.traits.OnOff](https://developers.google.com/actions/smarthome/traits/onoff)
[action.devices.types.BLINDS](https://developers.google.com/actions/smarthome/guides/blinds) | [action.devices.traits.OpenClose](https://developers.google.com/actions/smarthome/traits/openclose)
[action.devices.types.LIGHT](https://developers.google.com/actions/smarthome/guides/light) | [action.devices.traits.OnOff](https://developers.google.com/actions/smarthome/traits/onoff), [action.devices.traits.Brightness](https://developers.google.com/actions/smarthome/traits/brightness)
  
    

# Supported Traits

Traits are actual make the device work. Each of them allows you say things like `Unlock main door` or `Set Bedroom fan speed to low`  

Each trait maps onto specific one more openhab item types.

Each device must have at least one trait, but you can more than one, if Openhab item that handles this trait does support that  


Trait | Sample command
------------ | -------------
[action.devices.traits.OpenClose](https://developers.google.com/actions/smarthome/traits/openclose) | `Open the garage door`
[action.devices.traits.OnOff](https://developers.google.com/actions/smarthome/traits/onoff) | `Turn on the bedroom light`
[action.devices.traits.LockUnlock](https://developers.google.com/actions/smarthome/traits/lockunlock) | `Lock the front door`
[action.devices.traits.FanSpeed](https://developers.google.com/actions/smarthome/traits/fanspeed) | `Set the fan to low`
[action.devices.traits.Modes](https://developers.google.com/actions/smarthome/traits/modes) | `Set the dryer to permanent press.`
[action.devices.traits.StartStop](https://developers.google.com/actions/smarthome/traits/startstop) | `Stop the washer`
[action.devices.traits.Brightness](https://developers.google.com/actions/smarthome/traits/brightness) | `Set light brightness to 55%`

  
### Trait `action.devices.traits.OpenClose`

### Examples
```
// device GATE defaults to OpenClose trait
Switch Gate  "Gate"         {google="action.devices.types.GATE"} 
 
// Use OpenClase with SWITCH device instead of OnOff
Switch Lamp  "Main Lamp"    {google="action.devices.types.SWITCH" [trait="action.devices.traits.OpenClose"]}

// Inverted blinds. So "open to 30 percent" will actually send 70 percent to Openhab. And Open will send DOWN
Rollershutter Blinds  "Blinds"    {google="action.devices.types.BLINDS" [inverted=true]} 

// Custom direction mapping. Only supported on String type
String Blinds  "Blinds"    {google="action.devices.types.BLINDS" [directionMap=UP=UP_100,DOWN=DOWN_100]} 
```

### Supported configuration options
 * **inverted**=[true] - Inverts percentage and command `Open` will send `Off`, 30 percent will send 70 percent, etc.
 * **directionMap**=[command=alias,command1=alias] - Allows to specify custom commands that would be sent . Eg. ` directionMap=UP=UP_100,DOWN=DOWN_100"`. This would send `UP_100` instead of `UP` for `Open blinds`. Only if Openhab item is type of String


Supported Openhab item |  notes
------------ | -------------
Rollershutter | If percentage is given, will send percentage.  In case of `'UP','LEFT', 'IN'` will send `UP` else `DOWN`
String | Will send command or percentage as is. If percentage and command is provided will send both separated by space e.g. `ON 50`
Dimmer | If percentage is given, will send percentage.  In case of `'UP','LEFT', 'IN'` will send `ON` else `OFF`
Switch | In case of `'UP','LEFT', 'IN'` will send `ON` else `OFF`

  
### Trait `action.devices.traits.OnOff`

### Examples
```
// device Washer defaults to OnOff trait
Switch Washer_Power "Power"  {google="action.devices.types.WASHER"}
 
// device Switch defaults to OnOff trait
Switch Lamp  "Main Lamp"    {google="action.devices.types.SWITCH"}

// will send POWERON when turned on, POWEROFF when turned off
String Computer  "Computer" {google="action.devices.types.SWITCH" [onCommand="POWERON", offCommand="POWEROFF"]} 

// Use OnOff with a fan
Switch Fan  "Fan"    {google="action.devices.types.FAN" [trait="action.devices.traits.OnOff"]}
```

### Supported configuration options
 * **onCommand**=[command] - what to send when turning on. Only if Openhab item is type of String
 * **offCommand**=[command] - what to send when turning off. Only if Openhab item is type of String


Supported Openhab item |  notes
------------ | -------------
Rollershutter | In case of `on` will send `UP` else `DOWN`
String |  In case of `on` will send `ON` else `OFF` unless `onCommand` or `offCommand` configuration is given
Dimmer | In case of `on` will send `ON` else `OFF`
Switch | In case of `on` will send `ON` else `OFF`


### Trait `action.devices.traits.LockUnlock`

### Examples
```
// device Lock defaults to LockUnlock trait
Switch Lock "Lock"  {google="action.devices.types.LOCK"}
 
// will send UNLOCK when unlocking or LOCK when locking
String Door  "Door" {google="action.devices.types.DOOR" [trait="action.devices.traits.LockUnlock", lockCommand="LOCK", unlockCommand="UNLOCK"]} 

// Use LockUnlock with a door
Switch Fan  "Fan"    {google="action.devices.types.DOOR"  trait="action.devices.traits.LockUnlock"}
```

### Supported configuration options
 * **lockCommand**=[command] - what to send when locking. Only if Openhab item is type of String
 * **unlockCommand**=[command] - what to send when unlocking, Only if Openhab item is type of String


Supported Openhab item |  notes
------------ | -------------
String |  In case of lock will send `ON` else `OFF` unless `lockCommand` or `unlockCommand` configuration is given
Switch |  In case of lock will send`ON` else `OFF`


### Trait `action.devices.traits.FanSpeed`

### Examples
```
// FAN device defaults to action.devices.traits.FanSpeed
// Blower supports three speed commands: level_0, level_1, level_2, which are named
// - level_0 away or zero
// - level_1 default or standard or one
// - level_2 high or two
String Blower "Blower" { synonyms="Ventilation", google="action.devices.types.FAN" [lang="en", speeds="level_0=away:zero,level_1=default:standard:one,level_2=high:two", ordered="true"] }
```

### Supported configuration options
 * **speeds**=[speedCommand1=name:alias1:alias2,speedCommand2=name2:otheralias] - supported fan speed commands (separated with `,`) with their names (supports multiple aliases separated by `:`)
 * **ordered**=[true] - if true means that defined speeds are in increasing order and you can use commands like `increase fan speed`
 * **lang**=[lang] - language code in which speed names are defined. Defaults to 'en' (English)

Supported Openhab item |  notes
------------ | -------------
String |  will send command defined in speeds
Number |  will send command defined in speeds. Note that it mus be numeric, e.g.` speeds="0=zero,50=half`
Dimmer |  will send command defined in speeds. Note that it mus be numeric, e.g.` speeds="0=zero,50=half`

### Trait `action.devices.traits.Modes`

This one is really tricky. It allows you to specify modes that device supports and control them, e.g. `set wash Water Temperature to High`. The problem that the mode (`Water Temperature`) and it's value (`High`) **[can only have values that google supports](https://developers.google.com/actions/smarthome/reference/traits/modes)** (with exact casing) Otherwise google will sync the device but will not execute any command

### Examples
```
String Booster   "Booster" { google="action.devices.types.FAN" [ traits="action.devices.traits.Modes",  mode="Level=level", settings="Low=low,Medium=medium,High=high", commandMap="Low=level_1,Medium=level_2", lang="en", ordered=false]}
```

### Supported configuration options
 * **mode**=[mode=alias] - mode  and name_synonym for the device. **[can only have values that google supports, see `Mode names`](https://developers.google.com/actions/smarthome/reference/traits/modes#mode-names_1)** 
 * **settings**=[setting1=name1,setting1=name2:alias2] - supported mode values.  **[can only have values that google supports, see `Mode settings`](https://developers.google.com/actions/smarthome/reference/traits/modes#mode-settings)** 
 * **lang**=[lang] - language code in which mode names are defined. Defaults to 'en' (English)
 * **commandMap**=[setting1=command1,setting2=command2] - since google is very strinct about supported settings, you can remap those into command values that will be sent to openhab items

Supported Openhab item |  notes
------------ | -------------
String |  will send mode setting, or command defined in commandMap
Number |  will send command from commandMap based on setting. commandMap is required and key must be numeric, e.g. `Low=0,Medium=1`

### Trait `action.devices.traits.StartStop`

### Examples
```
Switch Washer       "Washer"  { google="action.devices.types.WASHER" [trait="action.devices.traits.StartStop" ] }
```

### Supported configuration options
 * **pausable**=[true] - can the device be paused


Supported Openhab item |  notes
------------ | -------------
String |  In case of `start` will send `START` else `STOP`. If pausable is enabled for pause will send `PAUSE` and for resume `RESUME`
Switch | In case of `start` will send `ON` else `OFF`. Does not support pause


### Trait `action.devices.traits.Brightness`

### Examples
```
// device Light defaults to Brightness and OnOff traits
Dimmer BathroomLight  "Bathroom Lamp"    {google="action.devices.types.LIGHT"}

// Light
  can be split  into separate items with Brightness ans Switch
Group ComplexLight              "ComplexLight"               {google="action.devices.types.LIGHT"}
Number ComplexLight_Brightness  "Brightness" (ComplexLight)  {google="action.devices.traits.Brightness"}
Switch ComplexLight_OnOff       "Power"      (ComplexLight)  {google="action.devices.traits.OnOff"}

```

### Supported configuration options
 * none


Supported Openhab item |  notes
------------ | -------------
String |  Will send percentage as is
Switch |   Will send percentage as is
Dimmer |   Will send percentage as is
