-- Tabla principal de usuarios
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_first_name VARCHAR(150) NOT NULL,
    user_email VARCHAR(150) NOT NULL UNIQUE,
    user_role ENUM('ADMIN', 'USUARIO') NOT NULL DEFAULT 'USUARIO',
    user_password VARCHAR(255) NOT NULL,
    user_oauth ENUM('MANUAL', 'GOOGLE') NOT NULL DEFAULT 'MANUAL',
    user_status ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    user_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_avatar VARCHAR(255) DEFAULT '',
    user_token_version INT NOT NULL DEFAULT 1,
    user_two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_user_email (user_email),
    INDEX idx_user_status (user_status),
    INDEX idx_user_role (user_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de tokens revocados (Blacklist)
CREATE TABLE IF NOT EXISTS invalid_tokens (
    inv_token_id INT AUTO_INCREMENT PRIMARY KEY,
    inv_token_payload VARCHAR(500) NOT NULL,
    inv_token_expiration DATETIME NOT NULL,
    INDEX idx_inv_token_payload (inv_token_payload),
    INDEX idx_inv_token_expiration (inv_token_expiration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de desafíos de autenticación (2FA y Recuperación de Contraseña)
CREATE TABLE IF NOT EXISTS auth_challenges (
    challenge_id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_code VARCHAR(255) NOT NULL,
    challenge_type ENUM('LOGIN_2FA', 'PASSWORD_RECOVERY') NOT NULL,
    challenge_attempts TINYINT NOT NULL DEFAULT 0,
    challenge_expires_at DATETIME NOT NULL,
    challenge_used_at DATETIME NULL,
    challenge_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_challenge_user_type (user_id, challenge_type),
    INDEX idx_challenge_expires (challenge_expires_at),
    CONSTRAINT fk_challenge_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de pistas de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    audit_resource VARCHAR(100) NOT NULL,
    audit_resource_id VARCHAR(100) NOT NULL,
    audit_action VARCHAR(100) NOT NULL,
    audit_actor_id INT NULL,
    audit_before_state JSON NULL,
    audit_after_state JSON NULL,
    audit_ip VARCHAR(50) NOT NULL DEFAULT '',
    audit_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_resource (audit_resource, audit_resource_id),
    INDEX idx_audit_actor (audit_actor_id),
    INDEX idx_audit_created_at (audit_created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
