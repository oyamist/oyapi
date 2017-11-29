create keyspace if not exists oyamist with 
    replication={'class':'SimpleStrategy', 'replication_factor':1};
use oyamist;
create table if not exists sensor (
    host text,
    evt text,
    d date,
    t time,
    v double,
    primary key((host,evt,d), t)
);
