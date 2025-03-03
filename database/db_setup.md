1. Install mariadb-server on server.
2. Setup database and user:
    - CREATE DATABASE IF NOT EXISTS ocd_lib;
    - CREATE USER 'ratbat'@'localhost' IDENTIFIED BY 'LabRat123';
    - GRANT ALL PRIVILEGES ON ocd_lib.* TO 'ratbat'@'localhost';
    - FLUSH PRIVILEGES;
3. Add tables using django:
    - makemigrations/migrate
4. Run load_metadata command.