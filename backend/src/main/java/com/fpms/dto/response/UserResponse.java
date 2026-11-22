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
    private Long roleId;
    private String roleName;
    private String roleDescription;

    public static UserResponse fromEntity(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .fullName(user.getFullName())
                .status(user.getStatus())
                .roleId(user.getRole() != null ? user.getRole().getId() : null)
                .roleName(user.getRole() != null ? user.getRole().getRoleName() : null)
                .roleDescription(user.getRole() != null ? user.getRole().getDescription() : null)
                .build();
    }
}
