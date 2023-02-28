package com.parfenov.todo.repository;

import com.parfenov.todo.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    @Transactional(readOnly = true)
    @Query(value = "WITH RECURSIVE children AS (SELECT id, user_id, parent_id, name, text, type, done " +
                   "                            FROM task " +
                   "                            WHERE parent_id IS NULL " +
                   "                              AND user_id = :userId " +
                   "                            UNION ALL " +
                   "                            SELECT parent.id, parent.user_id, parent.parent_id, parent.name, parent.text, parent.type, parent.done " +
                   "                            FROM task parent " +
                   "                                     JOIN children ON children.id = parent.parent_id " +
                   "                            ) " +
                   " SEARCH DEPTH FIRST BY id SET ordercol " +
                   "SELECT id, user_id, parent_id, name, text, type, done " +
                   "FROM children ORDER BY ordercol;",
            nativeQuery = true)
    List<Task> getAllTasksByUserId(@Param("userId") Long userId);
}
