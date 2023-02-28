drop table task;


INSERT INTO users (username, password, role)
VALUES ('MrPotter', '{noop}123', 'USER');
INSERT INTO node_type (type)
VALUES ('DIR');
INSERT INTO node_type (type)
VALUES ('TASK');

INSERT INTO task (user_id, parent_id, name, text, type, done)
VALUES (1, NULL, 'A = first', 'a text', 'DIR', false);
INSERT INTO task (user_id, parent_id, name, text, type, done)
VALUES (1, 1, 'B - second', 'b text', 'DIR', false);
INSERT INTO task (user_id, parent_id, name, text, type, done)
VALUES (1, 2, 'E - fifth', 'e text', 'DIR', false);
INSERT INTO task (user_id, parent_id, name, text, type, done)
VALUES (1, 2, 'F - sixth', 'f text', 'DIR', false);
INSERT INTO task (user_id, parent_id, name, text, type, done)
VALUES (1, 1, 'C - third', 'c text', 'DIR', false);
INSERT INTO task (user_id, parent_id, name, text, type, done)
VALUES (1, 1, 'D - fourth', 'd text', 'DIR', false);
INSERT INTO task (user_id, parent_id, name, text, type, done)
VALUES (1, 6, 'G - seventh', 'g text', 'DIR', false);
INSERT INTO task (user_id, parent_id, name, text, type, done)
VALUES (1, 6, 'H - eighth', 'h text', 'TASK', false);
INSERT INTO task (user_id, parent_id, name, text, type, done)
VALUES (1, 6, 'I - ninth', 'i text', 'TASK', false);