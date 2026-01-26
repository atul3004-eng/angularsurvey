# Makefile for fullstack app

.PHONY: install-frontend start-frontend clean-backend install-backend test-backend run-backend build-frontend build-and-run

# 1. Install frontend dependencies
install-frontend:
	cd frontend-angular && npm install

# 2. Start frontend dev server
start-frontend:
	cd frontend-angular && npm run start

# 3. Clean backend
clean-backend:
	cd backend-spring-boot && ./mvnw clean

# 4. Install backend dependencies
install-backend:
	cd backend-spring-boot && ./mvnw install

# 5. Run backend tests
test-backend:
	cd backend-spring-boot && ./mvnw test

# 6. Run backend server
run-backend:
	cd backend-spring-boot && ./mvnw spring-boot:run

# 7. Build frontend production
build-frontend:
	cd frontend-angular && npm run build -- --configuration=production

# 8. Build frontend and run backend
build-and-run:
	cd frontend-angular && npm run build -- --configuration=production
	cd backend-spring-boot && ./mvnw spring-boot:run