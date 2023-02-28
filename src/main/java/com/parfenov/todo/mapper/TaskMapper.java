package com.parfenov.todo.mapper;

import com.parfenov.todo.dto.TaskCreateEditDto;
import com.parfenov.todo.entity.Task;
import com.parfenov.todo.entity.User;
import com.parfenov.todo.repository.TaskRepository;
import com.parfenov.todo.repository.UserRepository;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper implements Mapper<TaskCreateEditDto, Task> {
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public TaskMapper(UserRepository userRepository, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public Task map(TaskCreateEditDto object) {
        User user = userRepository.findById(object.getUserId()).get();
        Task parentTask = getRealParentOrMakeDummy(object);
        Task task = new Task();
        task.setId(object.getNodeId());
        task.setUser(user);
        task.setParent(parentTask);
        task.setName(object.getName());
        task.setText(object.getText());
        task.setType(object.getType());
        task.setDone(object.getDone());
        return task;
    }

    private Task getRealParentOrMakeDummy(TaskCreateEditDto object) {
        if(object.getNodeId() == 0) return null;
        return taskRepository.findById(object.getParentId())
                .orElse(Task.builder()
                        .id(object.getParentId())
                        .build());
    }
}
