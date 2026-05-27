import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('super123', 10);

  const school = await prisma.school.create({
    data: {
      name: 'StudyFlow Admin',
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      fullName: 'Super Admin',
      email: 'super@studyflow.com',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      schoolId: school.id,
      accountStatus: 'ACTIVE',
    },
  });

  console.log('Super admin created: super@studyflow.com / super123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());