// Seed script — run with: node prisma/seed.mjs
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@elirama.ac.ke' },
        update: {},
        create: { name: 'Admin User', email: 'admin@elirama.ac.ke', password: hashedPassword, role: 'Super Admin' },
    });
    console.log('✅ Admin user created');

    // Create teacher user
    await prisma.user.upsert({
        where: { email: 'teacher@elirama.ac.ke' },
        update: {},
        create: { name: 'Teacher User', email: 'teacher@elirama.ac.ke', password: await bcrypt.hash('teacher123', 10), role: 'Teacher' },
    });
    console.log('✅ Teacher user created');

    // Create students
    const students = [
        { admissionNumber: 'ELR-100', firstName: 'Zion', lastName: 'Elirama', gender: 'Male', grade: 'Play Group', dateOfBirth: '2022-05-10', parentName: 'John Elirama', parentPhone: '0700123456', parentEmail: 'john@elirama.ac.ke', address: 'Nairobi', status: 'Active', enrollmentDate: '2025-01-10', totalFees: 12000, paidFees: 5000, feeBalance: 7000 },
        { admissionNumber: 'ELR-101', firstName: 'Serah', lastName: 'Njeri', gender: 'Female', grade: 'PP1', dateOfBirth: '2021-03-15', parentName: 'Mary Njeri', parentPhone: '0711123456', parentEmail: 'mary@gmail.com', address: 'Kiambu', status: 'Active', enrollmentDate: '2025-01-10', totalFees: 12500, paidFees: 12500, feeBalance: 0 },
        { admissionNumber: 'ELR-102', firstName: 'Liam', lastName: 'Kiptoo', gender: 'Male', grade: 'PP2', dateOfBirth: '2020-07-22', parentName: 'James Kiptoo', parentPhone: '0722123456', parentEmail: 'james@gmail.com', address: 'Nairobi West', status: 'Active', enrollmentDate: '2025-01-10', totalFees: 13000, paidFees: 10000, feeBalance: 3000 },
        { admissionNumber: 'ELR-001', firstName: 'Amara', lastName: 'Ochieng', gender: 'Female', grade: 'Grade 1', dateOfBirth: '2019-03-15', parentName: 'James Ochieng', parentPhone: '0712345678', parentEmail: 'james@gmail.com', address: 'Nairobi', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 15000, feeBalance: 0 },
        { admissionNumber: 'ELR-002', firstName: 'Brian', lastName: 'Kamau', gender: 'Male', grade: 'Grade 2', dateOfBirth: '2018-07-22', parentName: 'Mary Kamau', parentPhone: '0723456789', parentEmail: 'mary@gmail.com', address: 'Westlands', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 10000, feeBalance: 5000 },
        { admissionNumber: 'ELR-003', firstName: 'Cynthia', lastName: 'Wanjiku', gender: 'Female', grade: 'Grade 3', dateOfBirth: '2017-11-08', parentName: 'Peter Wanjiku', parentPhone: '0734567890', parentEmail: 'peter@gmail.com', address: 'Kilimani', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 5000, feeBalance: 10000 },
        { admissionNumber: 'ELR-004', firstName: 'David', lastName: 'Mwangi', gender: 'Male', grade: 'Grade 4', dateOfBirth: '2016-05-30', parentName: 'Grace Mwangi', parentPhone: '0745678901', parentEmail: 'grace@gmail.com', address: 'Karen', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 18000, paidFees: 18000, feeBalance: 0 },
        { admissionNumber: 'ELR-005', firstName: 'Esther', lastName: 'Njoroge', gender: 'Female', grade: 'Grade 5', dateOfBirth: '2015-09-12', parentName: 'John Njoroge', parentPhone: '0756789012', parentEmail: 'john@gmail.com', address: 'Lavington', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 18000, paidFees: 9000, feeBalance: 9000 },
        { admissionNumber: 'ELR-006', firstName: 'Felix', lastName: 'Otieno', gender: 'Male', grade: 'Grade 6', dateOfBirth: '2014-02-18', parentName: 'Rose Otieno', parentPhone: '0767890123', parentEmail: 'rose@gmail.com', address: 'Parklands', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 18000, paidFees: 18000, feeBalance: 0 },
        { admissionNumber: 'ELR-009', firstName: 'Irene', lastName: 'Wambua', gender: 'Female', grade: 'Grade 1', dateOfBirth: '2019-01-14', parentName: 'Paul Wambua', parentPhone: '0790123456', parentEmail: 'paul@gmail.com', address: 'Embakasi', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 7500, feeBalance: 7500 },
    ];
    for (const s of students) {
        await prisma.student.upsert({ where: { admissionNumber: s.admissionNumber }, update: {}, create: s });
    }
    console.log(`✅ ${students.length} students created`);

    // Create teachers
    const teachers = [
        { firstName: 'Alice', lastName: 'Kariuki', email: 'alice@elirama.ac.ke', phone: '0711111111', qualification: 'B.Ed Mathematics', subjects: ['Mathematics', 'Physics'], grades: ['Grade 5', 'Grade 6'], status: 'Active', joinDate: '2020-01-15' },
        { firstName: 'Bob', lastName: 'Omondi', email: 'bob@elirama.ac.ke', phone: '0722222222', qualification: 'B.Ed English', subjects: ['English', 'Literature'], grades: ['Grade 3', 'Grade 4'], status: 'Active', joinDate: '2019-03-01' },
        { firstName: 'Carol', lastName: "Ndung'u", email: 'carol@elirama.ac.ke', phone: '0733333333', qualification: 'B.Ed Science', subjects: ['Science', 'Biology'], grades: ['PP1', 'PP2'], status: 'Active', joinDate: '2021-08-20' },
        { firstName: 'Daniel', lastName: 'Cheruiyot', email: 'daniel@elirama.ac.ke', phone: '0744444444', qualification: 'B.Ed Social Studies', subjects: ['Social Studies', 'History'], grades: ['Play Group', 'Grade 1'], status: 'Active', joinDate: '2022-01-10' },
        { firstName: 'Eunice', lastName: 'Waweru', email: 'eunice@elirama.ac.ke', phone: '0755555555', qualification: 'B.Ed Kiswahili', subjects: ['Kiswahili', 'CRE'], grades: ['Grade 2', 'Grade 6'], status: 'Active', joinDate: '2021-05-15' },
    ];
    for (const t of teachers) {
        await prisma.teacher.upsert({ where: { email: t.email }, update: {}, create: t });
    }
    console.log(`✅ ${teachers.length} teachers created`);

    // Create settings
    await prisma.settings.upsert({
        where: { id: 'default' },
        update: {},
        create: { id: 'default', schoolName: 'ELIRAMA SCHOOL', motto: 'Excellence in Education', phone: '+254 700 000 000', email: 'info@elirama.ac.ke', address: 'Nairobi, Kenya', currentTerm: 'Term 1', currentYear: 2026 },
    });
    console.log('✅ Settings created');

    // Create sync status
    await prisma.syncStatus.upsert({ where: { id: 'global' }, update: {}, create: { id: 'global' } });
    console.log('✅ Sync status created');

    console.log('🌱 Seeding complete!');
}

main()
    .catch((e) => { console.error('Seeding failed:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
