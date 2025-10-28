# SkyTrack Test Data Setup Guide

This guide provides all the JSON payloads needed to set up test data for the MongoDB sensor readings migration.

## Overview

Based on the MongoDB sensor readings, we have:
- **8 unique weather stations** (identified by MAC addresses)
- **4 sensor types**: Temperature, Humidity, Rain, Pressure
- **20 sensor readings** from timestamp 1726270800 to 1726279000

## Step 1: Create Stations

Create each station by calling `POST /api/stations` with the following payloads:

### Station 1: Downtown Station
```json
{
  "name": "Downtown Weather Station",
  "macAddress": "24:6F:28:AE:52:7C",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "address": "Downtown Area - São Paulo",
  "description": "Primary weather station - monitors temperature and humidity",
  "status": "ACTIVE"
}
```
**Sensors:** temperatura, umidade
**📝 Save Response ID as:** `STATION_1_ID`

---

### Station 2: Coastal Station
```json
{
  "name": "Coastal Weather Station",
  "macAddress": "A4:CF:12:B3:8A:91",
  "latitude": -23.9618,
  "longitude": -46.3322,
  "address": "Coastal Region - Santos",
  "description": "Coastal monitoring station - temperature and humidity tracking",
  "status": "ACTIVE"
}
```
**Sensors:** temperatura, umidade
**📝 Save Response ID as:** `STATION_2_ID`

---

### Station 3: Mountain Station
```json
{
  "name": "Mountain Weather Station",
  "macAddress": "EC:FA:BC:45:D2:18",
  "latitude": -22.7311,
  "longitude": -45.5897,
  "address": "Serra da Mantiqueira",
  "description": "Mountain region monitoring - temperature and humidity",
  "status": "ACTIVE"
}
```
**Sensors:** temperatura, umidade
**📝 Save Response ID as:** `STATION_3_ID`

---

### Station 4: Agricultural Station
```json
{
  "name": "Agricultural Weather Station",
  "macAddress": "30:AE:A4:15:C9:48",
  "latitude": -22.9099,
  "longitude": -47.0626,
  "address": "Rural Area - Campinas",
  "description": "Complete weather station for agricultural monitoring",
  "status": "ACTIVE"
}
```
**Sensors:** chuva, pressao, temperatura, umidade
**📝 Save Response ID as:** `STATION_4_ID`

---

### Station 5: Industrial Station
```json
{
  "name": "Industrial Weather Station",
  "macAddress": "94:B9:7E:15:43:E6",
  "latitude": -23.1893,
  "longitude": -46.8800,
  "address": "Industrial District - Jundiaí",
  "description": "Industrial area monitoring with full sensor suite",
  "status": "ACTIVE"
}
```
**Sensors:** chuva, pressao, temperatura, umidade
**📝 Save Response ID as:** `STATION_5_ID`

---

### Station 6: Rain Monitoring Station
```json
{
  "name": "Rain Monitoring Station",
  "macAddress": "B0:A7:B9:4E:65:D1",
  "latitude": -23.6821,
  "longitude": -46.8755,
  "address": "Reservoir Area - Guarulhos",
  "description": "Specialized rain monitoring station",
  "status": "ACTIVE"
}
```
**Sensors:** chuva
**📝 Save Response ID as:** `STATION_6_ID`

---

### Station 7: Pressure Monitoring Station
```json
{
  "name": "Pressure Monitoring Station",
  "macAddress": "CC:50:E3:92:1B:A7",
  "latitude": -23.4209,
  "longitude": -46.7819,
  "address": "Airport Area - Guarulhos",
  "description": "Atmospheric pressure and temperature monitoring",
  "status": "ACTIVE"
}
```
**Sensors:** pressao, temperatura
**📝 Save Response ID as:** `STATION_7_ID`

---

### Station 8: Urban Station
```json
{
  "name": "Urban Weather Station",
  "macAddress": "48:3F:DA:6C:B8:29",
  "latitude": -23.6273,
  "longitude": -46.6563,
  "address": "Urban Center - São Bernardo",
  "description": "Urban climate monitoring - temperature and humidity",
  "status": "ACTIVE"
}
```
**Sensors:** temperatura, umidade
**📝 Save Response ID as:** `STATION_8_ID`

---

### Station 9: Precipitation Station
```json
{
  "name": "Precipitation Monitoring Station",
  "macAddress": "DC:A6:32:B1:F4:85",
  "latitude": -23.4851,
  "longitude": -46.5197,
  "address": "Water Treatment Area - São Paulo",
  "description": "Dedicated precipitation monitoring",
  "status": "ACTIVE"
}
```
**Sensors:** chuva
**📝 Save Response ID as:** `STATION_9_ID`

---

## Step 2: Create Parameter Types (TipoParametro)

Create each parameter type by calling `POST /api/tipo-parametro`:

### Temperature Parameter Type
```json
{
  "jsonId": "temperatura",
  "nome": "Temperature",
  "metrica": "°C",
  "polinomio": "a0 + a1*temperatura",
  "coeficiente": [0.0, 1.0],
  "leitura": {
    "temperatura": {
      "offset": 0,
      "factor": 1.0
    }
  }
}
```
**📝 Save Response ID as:** `TIPO_TEMPERATURA_ID`

---

### Humidity Parameter Type
```json
{
  "jsonId": "umidade",
  "nome": "Humidity",
  "metrica": "%",
  "polinomio": "a0 + a1*umidade",
  "coeficiente": [0.0, 1.0],
  "leitura": {
    "umidade": {
      "offset": 0,
      "factor": 1.0
    }
  }
}
```
**📝 Save Response ID as:** `TIPO_UMIDADE_ID`

---

### Rain Parameter Type
```json
{
  "jsonId": "chuva",
  "nome": "Rainfall",
  "metrica": "mm",
  "polinomio": "a0 + a1*chuva",
  "coeficiente": [0.0, 1.0],
  "leitura": {
    "chuva": {
      "offset": 0,
      "factor": 1.0
    }
  }
}
```
**📝 Save Response ID as:** `TIPO_CHUVA_ID`

---

### Pressure Parameter Type
```json
{
  "jsonId": "pressao",
  "nome": "Atmospheric Pressure",
  "metrica": "hPa",
  "polinomio": "a0 + a1*pressao",
  "coeficiente": [0.0, 1.0],
  "leitura": {
    "pressao": {
      "offset": 0,
      "factor": 1.0
    }
  }
}
```
**📝 Save Response ID as:** `TIPO_PRESSAO_ID`

---

## Step 3: Link Parameters to Stations

Create parameters by calling `POST /api/parameters` with the saved IDs from Steps 1 and 2:

### Station 1 Parameters (Downtown)
```json
{
  "stationId": "STATION_1_ID",
  "tipoParametroId": "TIPO_TEMPERATURA_ID"
}
```
```json
{
  "stationId": "STATION_1_ID",
  "tipoParametroId": "TIPO_UMIDADE_ID"
}
```

---

### Station 2 Parameters (Coastal)
```json
{
  "stationId": "STATION_2_ID",
  "tipoParametroId": "TIPO_TEMPERATURA_ID"
}
```
```json
{
  "stationId": "STATION_2_ID",
  "tipoParametroId": "TIPO_UMIDADE_ID"
}
```

---

### Station 3 Parameters (Mountain)
```json
{
  "stationId": "STATION_3_ID",
  "tipoParametroId": "TIPO_TEMPERATURA_ID"
}
```
```json
{
  "stationId": "STATION_3_ID",
  "tipoParametroId": "TIPO_UMIDADE_ID"
}
```

---

### Station 4 Parameters (Agricultural)
```json
{
  "stationId": "STATION_4_ID",
  "tipoParametroId": "TIPO_CHUVA_ID"
}
```
```json
{
  "stationId": "STATION_4_ID",
  "tipoParametroId": "TIPO_PRESSAO_ID"
}
```
```json
{
  "stationId": "STATION_4_ID",
  "tipoParametroId": "TIPO_TEMPERATURA_ID"
}
```
```json
{
  "stationId": "STATION_4_ID",
  "tipoParametroId": "TIPO_UMIDADE_ID"
}
```

---

### Station 5 Parameters (Industrial)
```json
{
  "stationId": "STATION_5_ID",
  "tipoParametroId": "TIPO_CHUVA_ID"
}
```
```json
{
  "stationId": "STATION_5_ID",
  "tipoParametroId": "TIPO_PRESSAO_ID"
}
```
```json
{
  "stationId": "STATION_5_ID",
  "tipoParametroId": "TIPO_TEMPERATURA_ID"
}
```
```json
{
  "stationId": "STATION_5_ID",
  "tipoParametroId": "TIPO_UMIDADE_ID"
}
```

---

### Station 6 Parameters (Rain Monitoring)
```json
{
  "stationId": "STATION_6_ID",
  "tipoParametroId": "TIPO_CHUVA_ID"
}
```

---

### Station 7 Parameters (Pressure Monitoring)
```json
{
  "stationId": "STATION_7_ID",
  "tipoParametroId": "TIPO_PRESSAO_ID"
}
```
```json
{
  "stationId": "STATION_7_ID",
  "tipoParametroId": "TIPO_TEMPERATURA_ID"
}
```

---

### Station 8 Parameters (Urban)
```json
{
  "stationId": "STATION_8_ID",
  "tipoParametroId": "TIPO_TEMPERATURA_ID"
}
```
```json
{
  "stationId": "STATION_8_ID",
  "tipoParametroId": "TIPO_UMIDADE_ID"
}
```

---

### Station 9 Parameters (Precipitation)
```json
{
  "stationId": "STATION_9_ID",
  "tipoParametroId": "TIPO_CHUVA_ID"
}
```

---

## Step 4: Verify Setup

After creating all stations, parameter types, and parameters, verify the setup:

### Check All Stations
```
GET /api/stations
```

### Check All Parameter Types
```
GET /api/tipo-parametro
```

### Check All Parameters
```
GET /api/parameters
```

### Check Specific Station Parameters
```
GET /api/parameters/mac/24:6F:28:AE:52:7C
```

---

## Step 5: Test Migration

Once all data is set up, trigger the migration:

```
POST /api/migration/trigger
```

Then check migration status:
```
GET /api/migration/status
```

---

## MongoDB Data Reference

The test data corresponds to these MongoDB readings:

| MAC Address | Unixtime Range | Sensors Available |
|------------|----------------|-------------------|
| `24:6F:28:AE:52:7C` | 1726270800 - 1726277800 | temperatura, umidade |
| `A4:CF:12:B3:8A:91` | 1726270890 - 1726276000 | temperatura, umidade |
| `EC:FA:BC:45:D2:18` | 1726271480 - 1726279000 | temperatura, umidade |
| `30:AE:A4:15:C9:48` | 1726271500 - 1726276400 | chuva, pressao, temperatura, umidade |
| `94:B9:7E:15:43:E6` | 1726272100 - 1726277600 | chuva, pressao, temperatura, umidade |
| `B0:A7:B9:4E:65:D1` | 1726273200 - 1726276100 | chuva |
| `CC:50:E3:92:1B:A7` | 1726273300 - 1726275000 | pressao, temperatura |
| `48:3F:DA:6C:B8:29` | 1726273400 | temperatura, umidade |
| `DC:A6:32:B1:F4:85` | 1726274300 - 1726278400 | chuva |

**Time Range:** September 13-14, 2024 (Unix timestamps 1726270800 - 1726279000)

---

## Expected Migration Results

After migration completes, you should see:
- **20 sensor readings** migrated from MongoDB to PostgreSQL
- **Sensor readings** properly linked to their corresponding stations via MAC address
- **Parameter values** calculated using the polynomial formulas
- **Timestamps** converted from Unix time to proper DateTime format

To verify migration worked:
```
GET /api/sensor-readings?limit=100
```

Check specific station readings:
```
GET /api/sensor-readings?macAddress=24:6F:28:AE:52:7C
```

---

## Quick Copy-Paste Summary

**Total API Calls Needed:**
- 9 stations (POST /api/stations)
- 4 parameter types (POST /api/tipo-parametro)
- 21 parameters (POST /api/parameters)

**Total: 34 API calls to set up complete test environment**

---

## Troubleshooting

### Issue: MAC address already exists
**Solution:** Check if station was already created with `GET /api/stations/mac/{macAddress}`

### Issue: stationId not found
**Solution:** Verify you saved the correct UUID from the station creation response

### Issue: Duplicate parameter for station
**Solution:** Each (stationId, tipoParametroId) pair must be unique. Check existing parameters first.

### Issue: Migration shows 0 records
**Solution:**
1. Verify MongoDB contains the test data with matching MAC addresses
2. Check that station MAC addresses match exactly (case-sensitive)
3. Ensure `unixtime` in MongoDB is within the migration time range
