create table if not exists users
(
    id       bigserial primary key,
    login    varchar(64) not null unique,
    password varchar(64) not null
);

create table if not exists task
(
    notebook_id bigint      not null,
    user_id     bigint      not null references users on delete cascade,
    name        varchar(64) not null,
    parent_id   bigint,
    primary key (notebook_id, user_id)
);

create table if not exists task
(
    task_id     bigint not null,
    user_id     bigint not null,
    notebook_id bigint not null,
    text        text,
--     plan_date   timestamp,
--     fact_date   timestamp,
--     notes       text,
    done        bool,
    constraint pk primary key (task_id, user_id),
    foreign key (notebook_id, user_id)
        references task (notebook_id, user_id) on delete cascade
);

-- create table if not exists subtask
-- (
--     subtask_id bigint,
--     text       text,
-- --     plan_date  timestamp,
-- --     fact_date  timestamp,
--     done       bool,
--     task_id    bigint not null references task on delete cascade,
--     primary key (subtask_id, task_id)
-- );
