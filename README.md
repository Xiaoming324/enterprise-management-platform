# Enterprise Management Platform

An enterprise management platform with a Spring Boot backend and a Vue 3 + Element Plus admin console.  
It supports management of departments, employees, classes, students, and core business data.

---

## Tech Stack

- **Backend:** Spring Boot, MyBatis, PageHelper, Spring Transaction, JWT, AOP, Lombok
- **Admin Frontend:** Vue 3, Element Plus, Axios
- **Database:** MySQL
- **Cloud Storage:** Aliyun OSS

---

## Main Features

- Admin console to manage departments, employees, classes, students, and related business data  
- JWT-based authentication with Interceptor and role-based access control  
- Paginated queries and dynamic filtering for list pages using MyBatis PageHelper  
- Aliyun OSS integration for secure, cloud-based profile image storage  
- AOP-based logging for operations and logins, recording execution details and method performance  
- Transaction management and Lombok to ensure data consistency and improve maintainability

---

## Quick Start

### Backend (Spring Boot)

1. Open the Spring Boot project in your IDE.
2. Create a MySQL database and configure the connection (URL, username, password) in `application.yml` / `application.properties`.
3. Configure any required Aliyun OSS and JWT settings.
4. Run the Spring Boot application from your IDE or with Maven/Gradle.

### Admin Frontend (Vue 3 + Element Plus)

1. Open the Vue 3 admin project directory in your terminal.
2. Install dependencies:

   ```bash
   npm install
