# Database Seeders

Sistema automatizado de seeds para popular o banco de dados com dados de teste.

## 🚀 Comandos Disponíveis

```bash
# Executar todos os seeders
pnpm seed

# Limpar todos os dados seeded
pnpm seed:drop

# Reset completo (limpar e popular novamente)
pnpm seed:reset
```

## 📁 Estrutura

```
src/database/
├── seeders/
│   ├── user.seeder.ts          # Seeder de usuários
│   ├── seeder.service.ts       # Orquestrador dos seeders
│   └── seeder.module.ts        # Módulo dos seeders
└── seed.ts                     # Script principal
```

## ✅ Seeders Disponíveis

### 1. UserSeeder
Cria 3 usuários de teste:
- **Admin**: admin@school.com / admin123
- **Teacher**: teacher@school.com / teacher123
- **Student**: student@school.com / student123

## 📝 Como Adicionar um Novo Seeder

### Passo 1: Criar o arquivo do seeder

Crie um arquivo em `src/database/seeders/`, por exemplo `student.seeder.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from '../../modules/students/schemas/student.schema';

@Injectable()
export class StudentSeeder {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async seed() {
    console.log('🌱 Seeding students...');

    const students = [
      {
        name: 'Student One',
        email: 'student1@school.com',
        enrollmentNumber: 'STU001',
        // ... outros campos
      },
      {
        name: 'Student Two',
        email: 'student2@school.com',
        enrollmentNumber: 'STU002',
      },
      {
        name: 'Student Three',
        email: 'student3@school.com',
        enrollmentNumber: 'STU003',
      },
    ];

    for (const studentData of students) {
      const existing = await this.studentModel.findOne({ 
        email: studentData.email 
      });
      
      if (!existing) {
        await this.studentModel.create(studentData);
        console.log(`✅ Student created: ${studentData.email}`);
      } else {
        console.log(`⏭️  Student already exists: ${studentData.email}`);
      }
    }

    console.log('✅ Students seeded successfully\n');
  }

  async drop() {
    console.log('🗑️  Dropping students...');
    await this.studentModel.deleteMany({});
    console.log('✅ Students dropped successfully\n');
  }
}
```

### Passo 2: Registrar no SeederModule

Adicione em `seeder.module.ts`:

```typescript
import { StudentSeeder } from './student.seeder';
import { Student, StudentSchema } from '../../modules/students/schemas/student.schema';

@Module({
  imports: [
    // ...existing imports...
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Student.name, schema: StudentSchema }, // ← Adicionar
    ]),
  ],
  providers: [
    SeederService,
    UserSeeder,
    StudentSeeder, // ← Adicionar
  ],
  exports: [SeederService],
})
export class SeederModule {}
```

### Passo 3: Adicionar ao SeederService

Atualize `seeder.service.ts`:

```typescript
@Injectable()
export class SeederService {
  constructor(
    private readonly userSeeder: UserSeeder,
    private readonly studentSeeder: StudentSeeder, // ← Adicionar
  ) {}

  async seedAll() {
    console.log('🚀 Starting database seeding...\n');

    try {
      await this.userSeeder.seed();
      await this.studentSeeder.seed(); // ← Adicionar (ordem importa!)
      
      console.log('🎉 All seeds completed successfully!\n');
    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }

  async dropAll() {
    console.log('🗑️  Starting database cleanup...\n');

    try {
      // Ordem reversa para respeitar dependências
      await this.studentSeeder.drop(); // ← Adicionar
      await this.userSeeder.drop();
      
      console.log('🎉 All data dropped successfully!\n');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      throw error;
    }
  }
}
```

## 🔄 Ordem de Execução

Os seeders são executados **sequencialmente** na ordem definida em `seedAll()`:

1. UserSeeder (primeiro - dependência base)
2. StudentSeeder
3. TeacherSeeder
4. ClassSeeder
5. etc...

⚠️ **Importante**: A ordem de `dropAll()` deve ser **reversa** para respeitar dependências.

## 💡 Dicas

### Usar dados relacionados

```typescript
async seed() {
  // Buscar usuários existentes
  const adminUser = await this.userModel.findOne({ role: 'admin' });
  
  const students = [
    {
      name: 'Student One',
      userId: adminUser._id, // Usar relacionamento
      // ...
    },
  ];
  
  // ...
}
```

### Evitar duplicatas

```typescript
// Por email
const existing = await this.model.findOne({ email: data.email });

// Por campo único
const existing = await this.model.findOne({ enrollmentNumber: data.enrollmentNumber });

// Por múltiplos campos
const existing = await this.model.findOne({ 
  name: data.name, 
  email: data.email 
});
```

## 🧪 Testando

```bash
# 1. Executar seeds
pnpm seed

# 2. Verificar no MongoDB
mongosh
> use school-db
> db.users.find()

# 3. Testar na aplicação
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"admin123"}'

# 4. Resetar tudo
pnpm seed:reset
```

## ⚠️ Avisos

- **Não use em produção!** Seeds são apenas para desenvolvimento/testes
- As senhas são simples para facilitar testes
- Execute `seed:reset` para começar do zero
- Seeders são idempotentes (podem ser executados múltiplas vezes)

## 📊 Exemplo de Saída

```
🚀 Starting database seeding...

🌱 Seeding users...
✅ User created: admin@school.com
✅ User created: teacher@school.com
✅ User created: student@school.com
✅ Users seeded successfully

🌱 Seeding students...
✅ Student created: student1@school.com
✅ Student created: student2@school.com
✅ Student created: student3@school.com
✅ Students seeded successfully

🎉 All seeds completed successfully!
```

