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
VALUES (1, 6, 'H - eighth', 'h text', 'DIR', false);
INSERT INTO task (user_id, parent_id, name, text, type, done)
VALUES (1, 6, 'I - ninth', 'i text', 'DIR', false);

truncate table task;

WITH RECURSIVE children AS (SELECT id, parent_id, text, 1 AS level
                            FROM task
                            WHERE parent_id IS NULL
                              AND user_id = 1
                            UNION ALL
                            (SELECT parent.id, parent.parent_id, parent.text, children.level + 1
                             FROM task parent
                                      JOIN children ON children.id = parent.parent_id
                             ORDER BY level, id, parent_id))
SELECT children.id, children.parent_id, children.text, children.level
FROM children;
-- ORDER BY children.id;


WITH RECURSIVE search_tree(id, parent_id, text, path) AS (
SELECT t.id, t.parent_id, t.text, ARRAY [t.id]
                                                          FROM task t
--                             WHERE parent_id IS NULL
--                               AND user_id = 1
                                                          UNION ALL
                                                          SELECT t.id, t.parent_id, t.text, path || t.id
                                                          FROM task t,
                                                               search_tree st
                                                          WHERE t.id = st.parent_id
--                                       JOIN children ON children.id = parent.parent_id
--                              ORDER BY parent_id, id
)
SELECT search_tree.id, search_tree.parent_id, search_tree.text
FROM search_tree
ORDER BY path;


WITH RECURSIVE children AS (SELECT id, parent_id, text
                            FROM task
                            WHERE parent_id IS NULL
                              AND user_id = 1
                            UNION ALL
                            SELECT parent.id, parent.parent_id, parent.text
                            FROM task parent
                                     JOIN children ON children.id = parent.parent_id)
                   SEARCH DEPTH FIRST BY id SET ordercol
SELECT id, parent_id, text
FROM children
ORDER BY ordercol;