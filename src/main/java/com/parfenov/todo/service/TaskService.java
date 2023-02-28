package com.parfenov.todo.service;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.parfenov.todo.dto.TaskCreateEditDto;
import com.parfenov.todo.dto.TaskReadDto;
import com.parfenov.todo.entity.NodeType;
import com.parfenov.todo.entity.Task;
import com.parfenov.todo.mapper.TaskMapper;
import com.parfenov.todo.mapper.TaskReadMapper;
import com.parfenov.todo.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final TaskReadMapper taskReadMapper;

    @Transactional
    public ObjectNode getJson(Long id) {
        JsonNodeFactory factory = new JsonNodeFactory(false);
        List<Task> tasks = taskRepository.getAllTasksByUserId(id);
        ListIterator<Task> iterator = tasks.listIterator();
        return DFS(factory, iterator, iterator.next());
    }

    private ObjectNode DFS(JsonNodeFactory factory, ListIterator<Task> iterator, Task task) {
        ArrayNode children = factory.arrayNode();
        ObjectNode jsonNode = factory.objectNode();
        nodeInfill(task, jsonNode);
        while (iterator.hasNext()) {
            Task nextTask = iterator.next();
            if (nextTask.getParent().getId().equals(task.getId())) {
                children.add(DFS(factory, iterator, nextTask));
            } else {
                iterator.previous();
                break;
            }
        }
        jsonNode.set("children", children);
        return jsonNode;
    }

    private static void nodeInfill(Task task, ObjectNode jsonNode) {
        Long parentId = (task.getParent() == null) ? 0L : task.getParent().getId();
        jsonNode
                .put("nodeId", String.valueOf(task.getId()))
                .put("userId", task.getUser().getId())
                .put("parentId", String.valueOf(parentId))
                .put("name", task.getName())
                .put("text", task.getText())
                .put("type", task.getType().name())
                .put("done", task.getDone())
                .put("changed", false);
    }

    @Transactional
    public void saveAll(TaskCreateEditDto task) {
        List<Task> entities = extractChanged(task);
        Map<Long, Long> oldIdToNewId = new HashMap<>();
        for (Task entity : entities) {
            Long foundParentId = entity.getParent().getId();
            if (foundParentId < 0L) {
                Long idFromDb = oldIdToNewId.get(foundParentId);
                entity.setParent(taskRepository.findById(idFromDb).get());
            }
            Long id = entity.getId();
            Task savedTask = taskRepository.save(entity);
            if (!Objects.equals(id, savedTask.getId())) {
                oldIdToNewId.put(id, savedTask.getId());
            }
        }
    }

    public List<Task> extractChanged(TaskCreateEditDto task) {
        List<Task> result = new ArrayList<>();
        getAll(task, result);
        return result;
    }

    private void getAll(TaskCreateEditDto task, List<Task> result) {
        if (task.getChanged()) {
            result.add(taskMapper.map(task));
        }
        Set<TaskCreateEditDto> children = task.getChildren();
        children.forEach(c -> {
            if (c.getChanged()) {
                result.add(taskMapper.map(c));
            }
            Set<TaskCreateEditDto> children1 = c.getChildren();
            children1.forEach(c1 -> getAll(c1, result));
        });
    }

    public Task create(TaskCreateEditDto task) {
        return taskRepository.save(taskMapper.map(task));
    }

    public void delete(Long id) {
        taskRepository.deleteById(id);
    }

    public TaskReadDto partialUpdate(Map<String, Object> updates, Long id) {
        Task task = taskRepository.findById(id).get();
        Field[] postFields = Task.class.getDeclaredFields();
        for (Field postField : postFields) {
            updates.forEach((key, value) -> {
                if (key.equalsIgnoreCase(postField.getName())) {
                    try {
                        if(key.equals("type")) value = NodeType.valueOf(value.toString());
                        final Field declaredField = Task.class.getDeclaredField(key);
                        declaredField.setAccessible(true);
                        declaredField.set(task, value);
                    } catch (IllegalAccessException | NoSuchFieldException e) {
                        throw new RuntimeException(e);
                    }
                }
            });
        }
        return taskReadMapper.map(taskRepository.save(task));
    }
}
