package com.fpms.dto.response;

import com.fpms.entity.User;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String phoneNumber;
    private String fullName;
    private String status;
    private String roleName;

    public static UserResponse fromEntity(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .fullName(user.getFullName())
                .status(user.getStatus())
                .roleName(user.getRole() != null ? user.getRole().getRoleName() : null)
                .build();
    }
}
