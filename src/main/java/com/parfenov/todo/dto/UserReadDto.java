package com.parfenov.todo.dto;

import lombok.Builder;
import lombok.Value;
import lombok.experimental.FieldNameConstants;

@Value
@FieldNameConstants
@Builder
public class UserReadDto {
    Long id;
    String username;
}
