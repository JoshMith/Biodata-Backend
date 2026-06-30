-- ============================================================
-- 10. NEW TABLE – AUDIT LOG
-- ============================================================
CREATE TABLE audit_log (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    action ENUM(
        'CREATE',
        'UPDATE',
        'DELETE'
    ) NOT NULL,
    actor_email VARCHAR(255) NOT NULL,
    actor_id VARCHAR(100) NOT NULL,
    actor_role VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    detail LONGTEXT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NULL,
    ip_address VARCHAR(45) NULL,
    PRIMARY KEY (id),
    INDEX idx_action (action),
    INDEX idx_actor (actor_id),
    INDEX idx_created (created_at),
    INDEX idx_entity (entity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- ============================================================
-- 1. PARISHES – add location, email, phone_number
-- ============================================================
ALTER TABLE parishes
ADD COLUMN location VARCHAR(255) NULL AFTER deanery,
ADD COLUMN email VARCHAR(150) NULL AFTER location,
ADD COLUMN phone_number VARCHAR(30) NULL AFTER email,
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER
phone_number,
ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
-- ============================================================
-- 2. USERS – add gender, age, status
-- ============================================================
ALTER TABLE users
ADD COLUMN gender ENUM('male', 'female', 'other') NULL AFTER birth_date,
ADD COLUMN age TINYINT UNSIGNED NULL AFTER gender,
ADD COLUMN status ENUM('active', 'inactive', 'deceased')
NOT NULL DEFAULT 'active' AFTER age;
-- ============================================================
-- 3. NEW TABLE – SCCS
-- ============================================================
CREATE TABLE sccs (
scc_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
scc_name VARCHAR(150) NOT NULL,
scc_description TEXT NULL,
scc_leader_id INT NULL,
parish_id INT NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (scc_id),
CONSTRAINT fk_sccs_parish
FOREIGN KEY (parish_id)
REFERENCES parishes(parish_id)
ON UPDATE RESTRICT
ON DELETE RESTRICT,
CONSTRAINT fk_sccs_leader
FOREIGN KEY (scc_leader_id)
REFERENCES users(id)
ON UPDATE RESTRICT
ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- ============================================================
-- 4. NEW TABLE – SCC MEMBERS
-- ============================================================
CREATE TABLE scc_members (
scc_member_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
scc_id INT UNSIGNED NOT NULL,
user_id INT NOT NULL,
joined_at DATE NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (scc_member_id),
UNIQUE KEY uq_scc_member (scc_id, user_id),
CONSTRAINT fk_sccm_scc
FOREIGN KEY (scc_id)
REFERENCES sccs(scc_id)
ON DELETE CASCADE,
CONSTRAINT fk_sccm_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- ============================================================
-- 5. NEW TABLE – FAMILIES
-- ============================================================
CREATE TABLE families (
family_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
family_name VARCHAR(150) NOT NULL,
family_head_id INT NULL,
parish_id INT NULL,
notes TEXT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (family_id),
CONSTRAINT fk_families_head
FOREIGN KEY (family_head_id)
REFERENCES users(id)
ON DELETE SET NULL,
CONSTRAINT fk_families_parish
FOREIGN KEY (parish_id)
REFERENCES parishes(parish_id)
ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- ============================================================
-- 6. NEW TABLE – FAMILY MEMBERS
-- ============================================================
CREATE TABLE family_members (
family_member_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
family_id INT UNSIGNED NOT NULL,
user_id INT NOT NULL,
role_in_family ENUM(
'father',
'mother',
'child',
'guardian',
'other'
) NOT NULL DEFAULT 'other',
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (family_member_id),
UNIQUE KEY uq_family_user (family_id, user_id),
CONSTRAINT fk_fm_family
FOREIGN KEY (family_id)
REFERENCES families(family_id)
ON DELETE CASCADE,
CONSTRAINT fk_fm_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- ============================================================
-- 7. NEW TABLE – LEADERSHIP ROLES
-- ============================================================
CREATE TABLE leadership_roles (
leadership_role_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
role_name ENUM(
'parish_priest',
'parish_coordinator',
'vice_parish_coordinator',
'secretary',
'vice_secretary',
'treasurer',
'scc_leader',
'association_leader',
'other'
) NOT NULL,
user_id INT NOT NULL,
parish_id INT NULL,
scc_id INT UNSIGNED NULL,
start_date DATE NULL,
end_date DATE NULL,
notes TEXT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (leadership_role_id),
CONSTRAINT fk_lr_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE,
CONSTRAINT fk_lr_parish
FOREIGN KEY (parish_id)
REFERENCES parishes(parish_id),
CONSTRAINT fk_lr_scc
FOREIGN KEY (scc_id)
REFERENCES sccs(scc_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- ============================================================
-- 8. NEW TABLE – ASSOCIATIONS
-- ============================================================
CREATE TABLE associations (
association_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
association_name VARCHAR(150) NOT NULL,
description TEXT NULL,
parish_id INT NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (association_id),
CONSTRAINT fk_assoc_parish
FOREIGN KEY (parish_id)
REFERENCES parishes(parish_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- ============================================================
-- 9. NEW TABLE – ASSOCIATION MEMBERS
-- ============================================================
CREATE TABLE association_members (
assoc_member_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
association_id INT UNSIGNED NOT NULL,
user_id INT NOT NULL,
role_in_assoc VARCHAR(100) NULL,
joined_at DATE NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (assoc_member_id),
UNIQUE KEY uq_assoc_member (association_id, user_id),
CONSTRAINT fk_am_assoc
FOREIGN KEY (association_id)
REFERENCES associations(association_id)
ON DELETE CASCADE,
CONSTRAINT fk_am_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;