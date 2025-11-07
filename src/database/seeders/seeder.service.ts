import { Injectable } from '@nestjs/common';
import { UserSeeder } from './user.seeder';

@Injectable()
export class SeederService {
  constructor(
    private readonly userSeeder: UserSeeder,
    // Adicione outros seeders aqui conforme forem criados
    // private readonly studentSeeder: StudentSeeder,
    // private readonly teacherSeeder: TeacherSeeder,
    // private readonly classSeeder: ClassSeeder,
  ) {}

  async seedAll() {
    console.log('🚀 Starting database seeding...\n');

    try {
      // Execute seeders em ordem sequencial
      await this.userSeeder.seed();
      // await this.studentSeeder.seed();
      // await this.teacherSeeder.seed();
      // await this.classSeeder.seed();

      console.log('🎉 All seeds completed successfully!\n');
    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }

  async dropAll() {
    console.log('🗑️  Starting database cleanup...\n');

    try {
      // Execute drops em ordem reversa para respeitar dependências
      // await this.classSeeder.drop();
      // await this.teacherSeeder.drop();
      // await this.studentSeeder.drop();
      await this.userSeeder.drop();

      console.log('🎉 All data dropped successfully!\n');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      throw error;
    }
  }

  async resetAll() {
    console.log('🔄 Resetting database...\n');
    await this.dropAll();
    await this.seedAll();
    console.log('🎉 Database reset completed!\n');
  }
}

