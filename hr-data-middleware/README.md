# 🚀 HR Data Integration Middleware

## 📋 Overview
Cloud-based middleware system for HR data integration with built-in **Business Rules Engine** for data validation and quality control. Processes CSV files, validates employee data, and maintains comprehensive audit trails.

---

## 🎯 Key Features

✅ **CSV Data Ingestion** - Automated file upload and parsing  
✅ **Business Rules Engine** - Real-time validation (salary, email, dates)  
✅ **Dual Storage System** - Separate collections for valid/invalid data  
✅ **Audit Trail** - Complete tracking of failed records  
✅ **RESTful API** - Clean integration endpoints  
✅ **MongoDB Atlas** - Secure cloud database  
✅ **Metrics & Analytics** - Success/failure statistics  

---

## 🏗️ Architecture

```
CSV Upload → Multer → CSV Parser → Validation Engine → MongoDB
                                    ↓
                          ✅ Valid → Employee Collection
                          ❌ Invalid → AuditLog Collection
```

---

## 📂 Project Structure

```
hr-data-middleware/
├── .env                  # Environment configuration
├── .gitignore
├── package.json
├── README.md
├── server.js             # Application entry point
│
├── src/
│   ├── config/
│   │   └── db.js         # MongoDB connection
│   │
│   ├── controllers/
│   │   ├── uploadController.js   # CSV upload logic
│   │   └── statsController.js    # Analytics endpoint
│   │
│   ├── middleware/
│   │   ├── fileUpload.js         # Multer configuration
│   │   └── dataValidator.js      # Business rules engine
│   │
│   ├── models/
│   │   ├── Employee.js           # Valid data schema
│   │   └── AuditLog.js           # Invalid data schema
│   │
│   ├── routes/
│   │   └── integrationRoutes.js  # API routes
│   │
│   └── utils/
│       └── csvParser.js          # CSV processing utility
│
└── uploads/              # Temporary file storage
```

---

## 🚀 Quick Start

### 1️⃣ Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Git

### 2️⃣ Installation

```bash
# Clone repository
git clone <repository-url>
cd hr-data-middleware

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI
```

### 3️⃣ Environment Configuration

Create `.env` file:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hrDataDB
PORT=5000
NODE_ENV=development
MAX_FILE_SIZE=10485760
```

### 4️⃣ Run Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

---

## 📡 API Endpoints

### 1. Upload CSV File
```http
POST /api/upload
Content-Type: multipart/form-data

Body: file (CSV)
```

**Response:**
```json
{
  "success": true,
  "message": "CSV processed successfully",
  "batchId": "uuid-here",
  "stats": {
    "totalRecords": 100,
    "validRecords": 95,
    "invalidRecords": 5
  }
}
```

### 2. Get Statistics
```http
GET /api/stats?batchId=uuid-here
```

**Response:**
```json
{
  "success": true,
  "batchId": "uuid-here",
  "totalRecords": 100,
  "successCount": 95,
  "failureCount": 5,
  "failureReasons": {
    "INVALID_EMAIL": 3,
    "INVALID_SALARY": 2
  }
}
```

---

## ✅ Business Rules Validation

### **Salary Validation**
- Must be a positive number
- Cannot be negative or zero
- Must be a valid numeric format

### **Email Validation**
- Must follow standard email format (xxx@xxx.xxx)
- Case-insensitive
- Unique per employee

### **Date Validation**
- Joining date must be a valid date
- Must be in the past (not future dates)
- Format: YYYY-MM-DD, DD/MM/YYYY, or ISO 8601

### **Required Fields**
- employeeId (unique)
- name
- email
- department
- salary
- joiningDate

---

## 🗄️ Database Schema

### Employee Collection (Valid Data)
```javascript
{
  employeeId: String,
  name: String,
  email: String,
  department: String,
  salary: Number,
  joiningDate: Date,
  status: String,
  uploadedAt: Date
}
```

### AuditLog Collection (Invalid Data)
```javascript
{
  rowNumber: Number,
  rawData: Object,
  validationErrors: Array,
  failureReason: String,
  uploadBatch: String,
  fileName: String,
  processedAt: Date
}
```

---

## 🔒 Security Best Practices

✅ Environment variables for sensitive data  
✅ .gitignore for .env files  
✅ File size limits (10MB default)  
✅ CORS configuration  
✅ Input sanitization  
✅ MongoDB injection prevention  

---

## 📊 CSV File Format

```csv
employeeId,name,email,department,salary,joiningDate
EMP001,John Doe,john@example.com,Engineering,75000,2023-01-15
EMP002,Jane Smith,jane@example.com,Marketing,65000,2023-02-20
```

---

## 🧪 Testing

```bash
# Using cURL
curl -X POST http://localhost:5000/api/upload \
  -F "file=@employees.csv"

# Check stats
curl http://localhost:5000/api/stats?batchId=<batch-id>
```

---

## 🛠️ Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Cloud)
- **File Processing:** Multer, CSV-Parser
- **Validation:** Custom Business Rules Engine
- **Utils:** UUID, Dotenv

---

## 📈 Future Enhancements

- [ ] Email notifications for failed records
- [ ] Bulk update support
- [ ] Advanced filtering and search
- [ ] Export audit logs to Excel
- [ ] Rate limiting
- [ ] Authentication & Authorization (JWT)
- [ ] Webhook support for third-party systems

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

**Your Name**  
Email: your.email@example.com  
LinkedIn: [Your Profile]

---

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Email: support@example.com

---

**⭐ If this project helped you, please give it a star!**
