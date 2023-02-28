package com.parfenov.todo.dto;

import lombok.Builder;
import lombok.Value;
import lombok.experimental.FieldNameConstants;

import java.util.Objects;
@Value
@FieldNameConstants
@Builder
public class UserReadDto {
    Long id;
    String username;
}
