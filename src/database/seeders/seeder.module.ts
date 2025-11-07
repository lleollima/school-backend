import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SeederService } from './seeder.service';
import { UserSeeder } from './user.seeder';
import { AdminSeeder } from './admin.seeder';
import { User, UserSchema } from '../../modules/auth/schemas/user.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      // Adicione outros schemas conforme necessário
      // { name: Student.name, schema: StudentSchema },
      // { name: Teacher.name, schema: TeacherSchema },
      // { name: Class.name, schema: ClassSchema },
    ]),
  ],
  providers: [
    SeederService,
    UserSeeder,
    AdminSeeder,
    // Adicione outros seeders aqui
    // StudentSeeder,
    // TeacherSeeder,
    // ClassSeeder,
  ],
  exports: [SeederService],
})
export class SeederModule {}

