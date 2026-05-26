package com.driveease;

import com.driveease.enums.AccountStatus;
import com.driveease.enums.UserRole;
import com.driveease.model.AppUser;
import com.driveease.repository.AppUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        appUserRepository.findByEmail("admin@driveease.com").ifPresentOrElse(existingAdmin -> {
            if (!isBcryptHash(existingAdmin.getPasswordHash())) {
                existingAdmin.setPasswordHash(passwordEncoder.encode("admin123"));
                existingAdmin.setRole(UserRole.ADMIN);
                existingAdmin.setStatus(AccountStatus.ACTIVE);
                appUserRepository.save(existingAdmin);
                System.out.println("Admin user password repaired: admin@driveease.com / admin123");
            }
        }, () -> {
            AppUser admin = AppUser.builder()
                    .fullName("System Admin")
                    .email("admin@driveease.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(UserRole.ADMIN)
                    .status(AccountStatus.ACTIVE)
                    .build();
            appUserRepository.save(admin);
            System.out.println("Admin user seeded: admin@driveease.com / admin123");
        });
    }

    private boolean isBcryptHash(String passwordHash) {
        return passwordHash != null && passwordHash.matches("^\\$2[aby]\\$\\d{2}\\$.{53}$");
    }
}
