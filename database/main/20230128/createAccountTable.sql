CREATE TABLE IF NOT EXISTS `accounts` (
    `id` BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `username` VARCHAR(16) NOT NULL UNIQUE,
    `key` TEXT NOT NULL
) DEFAULT CHARSET=utf8