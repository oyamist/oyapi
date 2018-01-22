#!/bin/bash
sqlite3 oyamist.db <<HEREIS
select
    substr(utc, 0, 15) t,
    evt,
    avg(v)
from sensordata 
where
    utc>'2018-01-21 00'
    and
    (evt='sense: temp-internal' or evt='sense: ec-internal')
group by 1,2
order by 2,1
HEREIS
