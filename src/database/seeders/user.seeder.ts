import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../modules/auth/schemas/user.schema';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async seed() {
    console.log('🌱 Seeding users...');

    const users = [
      {
        name: 'Admin User',
        email: 'admin@school.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
      },
      {
        name: 'Teacher User',
        email: 'teacher@school.com',
        password: await bcrypt.hash('teacher123', 10),
        role: 'teacher',
      },
      {
        name: 'Student User',
        email: 'student@school.com',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
      },
    ];

    for (const userData of users) {
      const existingUser = await this.userModel.findOne({ email: userData.email });

      if (!existingUser) {
        await this.userModel.create(userData);
        console.log(`✅ User created: ${userData.email}`);
      } else {
        console.log(`⏭️  User already exists: ${userData.email}`);
      }
    }

    console.log('✅ Users seeded successfully\n');
  }

  async drop() {
    console.log('🗑️  Dropping users...');
    await this.userModel.deleteMany({});
    console.log('✅ Users dropped successfully\n');
  }
}

