# AURIS Deployment Guide

## Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- Your API keys (Groq, Fast2SMS)

## Environment Variables Required
```
GROQ_API_KEY=your-groq-api-key
FAST2SMS_API_KEY=your-fast2sms-api-key
```

## Local Development Setup

1. **Clone and navigate to project**
   ```bash
   git clone https://github.com/RakshitRao2712/AURIS.git
   cd AURIS
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

3. **Run Backend (Spring Boot)**
   ```bash
   cd Auris
   ./mvnw spring-boot:run
   ```

4. **Run Frontend (Next.js)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Deployment Platforms

### Heroku Deployment

1. **Install Heroku CLI and login**
2. **Create Heroku apps**
   ```bash
   # For backend
   heroku create auris-backend
   
   # For frontend  
   heroku create auris-frontend
   ```

3. **Set environment variables**
   ```bash
   heroku config:set GROQ_API_KEY=your-key --app auris-backend
   heroku config:set FAST2SMS_API_KEY=your-key --app auris-backend
   ```

4. **Deploy**
   ```bash
   git subtree push --prefix=Auris heroku main
   ```

### Vercel Deployment (Frontend)

1. **Connect GitHub repo to Vercel**
2. **Set build settings:**
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/.next`
3. **Add environment variables in dashboard**

### Railway Deployment

1. **Connect GitHub repo**
2. **Set environment variables:**
   ```bash
   railway variables set GROQ_API_KEY=your-key
   railway variables set FAST2SMS_API_KEY=your-key
   ```

### Docker Deployment

1. **Create Dockerfile for backend (Auris directory)**
   ```dockerfile
   FROM openjdk:17-jdk-slim
   COPY target/*.jar app.jar
   EXPOSE 8080
   ENTRYPOINT ["java","-jar","/app.jar"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./Auris
       ports:
         - "8080:8080"
       environment:
         - GROQ_API_KEY=${GROQ_API_KEY}
         - FAST2SMS_API_KEY=${FAST2SMS_API_KEY}
     
     frontend:
       build: ./frontend
       ports:
         - "3000:3000"
       depends_on:
         - backend
   ```

## Database Configuration

The application uses H2 database by default. For production:

1. **PostgreSQL**
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/auris
   spring.datasource.username=${DB_USERNAME}
   spring.datasource.password=${DB_PASSWORD}
   spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
   ```

2. **MySQL**
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/auris
   spring.datasource.username=${DB_USERNAME}
   spring.datasource.password=${DB_PASSWORD}
   spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
   ```

## Production Checklist

- [ ] Set all environment variables
- [ ] Configure production database
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS for frontend-backend communication
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test file upload limits
- [ ] Verify API rate limits

## Troubleshooting

1. **API Key Issues**: Verify environment variables are set correctly
2. **Database Connection**: Check database URL and credentials
3. **CORS Errors**: Update CORS configuration in WebConfig.java
4. **File Upload**: Verify multipart configuration in application.properties

## Support

For issues, please check:
1. Application logs
2. Environment variable configuration
3. Database connectivity
4. API key validity
