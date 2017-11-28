create keyspace if not exists oyamist with 
    replication={'class':'SimpleStrategy', 'replication_factor':1};
use oyamist;
create table if not exists sensor (
    d date,
    loc text,
    t time,
    u text,
    v double,
    primary key((d,loc), t, u)
);
