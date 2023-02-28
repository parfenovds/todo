package com.parfenov.todo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Value;
import lombok.experimental.FieldNameConstants;
import org.hibernate.validator.constraints.Length;

@Value
@FieldNameConstants
public class UserCreateEditDto {
    @NotBlank
    @Length(min = 3, max = 10)
    String username;
    @NotBlank
    @Length(min = 5, max = 20)
    String rawPassword;
    String role;

}
