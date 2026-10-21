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
    user_otp VARCHAR(255) NULL,
    user_expiration_otp DATETIME NULL,
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