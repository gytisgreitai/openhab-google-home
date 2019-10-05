#!/bin/sh
curl  -XPOST localhost:3000/smarthome \
-H 'content-type: application/json' \
--data '{ "inputs": [ { "intent": "action.devices.SYNC" } ], "requestId": "1743137045053083479" }' \
-H  "authorization: Bearer $OPENHAB_LIVE_TEST_TOKEN"