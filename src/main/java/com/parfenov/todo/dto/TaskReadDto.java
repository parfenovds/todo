package com.parfenov.todo.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TaskReadDto {
    Long nodeId;
    Long userId;
    Long parentId;
    String name;
    String text;
    String type;
    Boolean done;
}
