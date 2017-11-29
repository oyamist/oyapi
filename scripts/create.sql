CREATE TABLE IF NOT EXISTS sensordata (
    vessel text NOT NULL,
    evt text NOT NULL,
    d text NOT NULL,
    t text NOT NULL,
    v real,
    primary key(vessel,evt,d,t)
) WITHOUT ROWID;
