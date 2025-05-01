1. Install mariadb-server
2. Setup database and user:
    - `CREATE DATABASE IF NOT EXISTS ocd_lib;`
    - `CREATE USER 'ratbat'@'localhost' IDENTIFIED BY 'LabRat123';`
    - `GRANT ALL PRIVILEGES ON ocd_lib.* TO 'ratbat'@'localhost';`
    - `FLUSH PRIVILEGES;`
3. Update config options:
    - `sudo nano etc/mysql/mariadb.cnf`
    - Add `max_allowed_packet=32M` under `[mysqld]` 
4. Add tables and populate using django: (from main project directory)
    - `python3 backend/manage.py makemigrations`
    - `python3 backend/manage.py migrate`
    - `python3 backend/manage.py load_metadata`