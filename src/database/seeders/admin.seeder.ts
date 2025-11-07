import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../modules/auth/schemas/user.schema';

@Injectable()
export class AdminSeeder {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async seed() {
    console.log('🌱 Seeding admin user...');

    // Verificar se já existe um admin
    const existingAdmin = await this.userModel.findOne({ email: 'admin@school.com' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Skipping...');
      return;
    }

    // Criar senha criptografada
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Criar usuário admin
    const admin = new this.userModel({
      name: 'Administrator',
      email: 'admin@school.com',
      password: hashedPassword,
      role: 'admin',
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@school.com');
    console.log('🔑 Password: admin123');
  }

  async drop() {
    console.log('🗑️  Dropping admin user...');

    const result = await this.userModel.deleteOne({ email: 'admin@school.com' });

    if (result.deletedCount > 0) {
      console.log('✅ Admin user dropped successfully!');
    } else {
      console.log('⚠️  Admin user not found.');
    }
  }
}

