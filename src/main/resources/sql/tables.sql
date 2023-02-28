create table if not exists node_type
(
    type varchar(8) not null primary key
);

create table if not exists users
(
    id       bigserial primary key,
    username varchar(64)  not null unique,
    password varchar(128) not null default '{noop}123',
    role     varchar(8)   not null
);

create table if not exists task
(
    id        bigserial primary key,
    user_id   bigint     not null references users on delete cascade,
--     parent_id bigint,
    parent_id bigint references task on delete cascade,
    name      text,
    text      text,
    type      varchar(8) not null references node_type,
    done      bool
);
