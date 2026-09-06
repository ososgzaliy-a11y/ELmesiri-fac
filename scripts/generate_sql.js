const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let sql = `-- =========================================================================
-- AL-MESIRI FACTORY E-COMMERCE DATABASE (SQL)
-- Generated: ${new Date().toISOString()}
-- Compatible with: MySQL 5.7+, MySQL 8+, MariaDB, PostgreSQL, SQLite
-- =========================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------------------
-- 1. Table: products (المنتجات والمخزون)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`products\` (
  \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`category\` VARCHAR(100) NOT NULL,
  \`category_name\` VARCHAR(100) DEFAULT NULL,
  \`price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`original_price\` DECIMAL(10,2) DEFAULT NULL,
  \`stock\` INT NOT NULL DEFAULT 100,
  \`rating\` DECIMAL(3,2) DEFAULT 5.00,
  \`reviews_count\` INT DEFAULT 0,
  \`badge\` VARCHAR(100) DEFAULT NULL,
  \`image\` VARCHAR(500) DEFAULT NULL,
  \`fabric\` VARCHAR(255) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

// Products
if (db.products && db.products.length > 0) {
    sql += `-- Dumping data for table: products\n`;
    db.products.forEach(p => {
        const id = (p.id || '').replace(/'/g, "''");
        const name = (p.name || '').replace(/'/g, "''");
        const category = (p.category || 'boxers').replace(/'/g, "''");
        const categoryName = (p.categoryName || 'بوكسرات قطنية').replace(/'/g, "''");
        const price = Number(p.price) || 0;
        const origPrice = p.originalPrice ? Number(p.originalPrice) : 'NULL';
        const stock = Number(p.stock) || 100;
        const rating = Number(p.rating) || 5.0;
        const reviews = Number(p.reviewsCount) || 0;
        const badge = p.badge ? `'${p.badge.replace(/'/g, "''")}'` : 'NULL';
        const image = (p.image || '').replace(/'/g, "''");
        const fabric = (p.fabric || 'قطن مصري 100%').replace(/'/g, "''");

        sql += `INSERT INTO \`products\` (\`id\`, \`name\`, \`category\`, \`category_name\`, \`price\`, \`original_price\`, \`stock\`, \`rating\`, \`reviews_count\`, \`badge\`, \`image\`, \`fabric\`) VALUES ('${id}', '${name}', '${category}', '${categoryName}', ${price}, ${origPrice}, ${stock}, ${rating}, ${reviews}, ${badge}, '${image}', '${fabric}') ON DUPLICATE KEY UPDATE \`price\`=${price}, \`stock\`=${stock};\n`;
    });
    sql += '\n';
}

// 2. Customers
sql += `-- -------------------------------------------------------------------------
-- 2. Table: customers (قاعدة بيانات العملاء)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`customers\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`phone\` VARCHAR(50) NOT NULL UNIQUE,
  \`email\` VARCHAR(255) DEFAULT NULL,
  \`governorate\` VARCHAR(100) DEFAULT NULL,
  \`city\` VARCHAR(100) DEFAULT NULL,
  \`address\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

// 3. Orders
sql += `-- -------------------------------------------------------------------------
-- 3. Table: orders (طلبات الأفراد B2C)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`orders\` (
  \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
  \`order_date\` DATETIME NOT NULL,
  \`customer_name\` VARCHAR(255) NOT NULL,
  \`customer_phone\` VARCHAR(50) NOT NULL,
  \`customer_email\` VARCHAR(255) DEFAULT NULL,
  \`governorate\` VARCHAR(100) DEFAULT NULL,
  \`city\` VARCHAR(100) DEFAULT NULL,
  \`address\` TEXT DEFAULT NULL,
  \`payment_method\` VARCHAR(50) NOT NULL DEFAULT 'cod',
  \`txn_id\` VARCHAR(100) DEFAULT NULL,
  \`payment_status\` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  \`subtotal\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`shipping_cost\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`discount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`total_amount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`order_status\` VARCHAR(100) NOT NULL DEFAULT 'قيد التحضير',
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

// 4. Order Items
sql += `-- -------------------------------------------------------------------------
-- 4. Table: order_items (تفاصيل ومقاسات المنتجات بالطلب)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`order_items\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`order_id\` VARCHAR(100) NOT NULL,
  \`product_name\` VARCHAR(255) NOT NULL,
  \`size\` VARCHAR(50) DEFAULT NULL,
  \`color\` VARCHAR(50) DEFAULT NULL,
  \`quantity\` INT NOT NULL DEFAULT 1,
  \`unit_price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`total_price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

// 5. RFQs
sql += `-- -------------------------------------------------------------------------
-- 5. Table: b2b_rfqs (عقود وطلبات الجملة والتوريدات)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`b2b_rfqs\` (
  \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
  \`company_name\` VARCHAR(255) DEFAULT NULL,
  \`contact_name\` VARCHAR(255) DEFAULT NULL,
  \`phone\` VARCHAR(50) NOT NULL,
  \`email\` VARCHAR(255) DEFAULT NULL,
  \`product_name\` VARCHAR(255) DEFAULT NULL,
  \`quantity\` VARCHAR(100) DEFAULT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`status\` VARCHAR(50) DEFAULT 'جديد',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

// Populate Orders
if (db.orders && db.orders.length > 0) {
    sql += `-- Dumping data for table: orders and order_items\n`;
    db.orders.forEach(o => {
        const orderId = (o.id || '').replace(/'/g, "''");
        let orderDate = 'NOW()';
        try {
            orderDate = `'${new Date(o.date).toISOString().slice(0, 19).replace('T', ' ')}'`;
        } catch(e) {}
        const custName = (o.customer?.name || 'عميل').replace(/'/g, "''");
        const custPhone = (o.customer?.phone || '').replace(/'/g, "''");
        const custEmail = (o.customer?.email || '').replace(/'/g, "''");
        const gov = (o.customer?.governorate || o.customer?.gov || '').replace(/'/g, "''");
        const city = (o.customer?.city || '').replace(/'/g, "''");
        const addr = (o.customer?.address || '').replace(/'/g, "''");
        const payMethod = (o.paymentMethod || 'cod').replace(/'/g, "''");
        const txn = o.transaction?.transaction_id ? `'${o.transaction.transaction_id.replace(/'/g, "''")}'` : 'NULL';
        const isPaid = o.paymentStatus === 'PAID' || (o.status && o.status.includes('تم الدفع'));
        const payStatus = isPaid ? 'PAID' : 'PENDING';
        const subtotal = Number(o.summary?.subtotal) || 0;
        const shipping = Number(o.summary?.shipping) || 0;
        const discount = Number(o.summary?.discount) || 0;
        const total = Number(o.summary?.total) || 0;
        const status = (o.status || 'قيد التحضير').replace(/'/g, "''");
        const notes = (o.customer?.notes || '').replace(/'/g, "''");

        sql += `INSERT INTO \`orders\` (\`id\`, \`order_date\`, \`customer_name\`, \`customer_phone\`, \`customer_email\`, \`governorate\`, \`city\`, \`address\`, \`payment_method\`, \`txn_id\`, \`payment_status\`, \`subtotal\`, \`shipping_cost\`, \`discount\`, \`total_amount\`, \`order_status\`, \`notes\`) VALUES ('${orderId}', ${orderDate}, '${custName}', '${custPhone}', '${custEmail}', '${gov}', '${city}', '${addr}', '${payMethod}', ${txn}, '${payStatus}', ${subtotal}, ${shipping}, ${discount}, ${total}, '${status}', '${notes}') ON DUPLICATE KEY UPDATE \`order_status\`='${status}';\n`;

        if (o.items && o.items.length > 0) {
            o.items.forEach(item => {
                const prodName = (item.name || item.title || 'منتج').replace(/'/g, "''");
                const size = (item.size || '-').replace(/'/g, "''");
                const color = (item.color || '-').replace(/'/g, "''");
                const qty = Number(item.qty || item.quantity) || 1;
                const price = Number(item.price) || 0;
                const totalItem = price * qty;
                sql += `INSERT INTO \`order_items\` (\`order_id\`, \`product_name\`, \`size\`, \`color\`, \`quantity\`, \`unit_price\`, \`total_price\`) VALUES ('${orderId}', '${prodName}', '${size}', '${color}', ${qty}, ${price}, ${totalItem});\n`;
            });
        }
    });
    sql += '\n';
}

// Populate RFQs
if (db.rfqs && db.rfqs.length > 0) {
    sql += `-- Dumping data for table: b2b_rfqs\n`;
    db.rfqs.forEach(r => {
        const id = (r.id || 'RFQ-001').replace(/'/g, "''");
        const comp = (r.company || '').replace(/'/g, "''");
        const contact = (r.contactName || r.name || '').replace(/'/g, "''");
        const phone = (r.phone || '').replace(/'/g, "''");
        const email = (r.email || '').replace(/'/g, "''");
        const prod = (r.product || r.productName || '').replace(/'/g, "''");
        const qty = (r.qty || r.quantity || '').replace(/'/g, "''");
        const notes = (r.notes || '').replace(/'/g, "''");
        const status = (r.status || 'جديد').replace(/'/g, "''");

        sql += `INSERT INTO \`b2b_rfqs\` (\`id\`, \`company_name\`, \`contact_name\`, \`phone\`, \`email\`, \`product_name\`, \`quantity\`, \`notes\`, \`status\`) VALUES ('${id}', '${comp}', '${contact}', '${phone}', '${email}', '${prod}', '${qty}', '${notes}', '${status}');\n`;
    });
    sql += '\n';
}

sql += `SET FOREIGN_KEY_CHECKS = 1;\n-- ======================== END OF DATABASE DUMP =========================\n`;

const outPath = path.join(__dirname, '..', 'data', 'almesiri_database.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Generated SQL file at:', outPath, 'Bytes:', sql.length);
