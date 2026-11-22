package com.fpms.repository;

import com.fpms.entity.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    List<PasswordReset> findByEmail(String email);
}
