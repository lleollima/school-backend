import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { YourEntity, YourEntityDocument } from '../../modules/your-module/schemas/your-entity.schema';

/**
 * Template para criar novos seeders
 *
 * 1. Copie este arquivo
 * 2. Renomeie para o nome da entidade (ex: student.seeder.ts)
 * 3. Substitua os comentários pelo código real
 * 4. Registre no seeder.module.ts
 * 5. Adicione ao seeder.service.ts (na ordem correta)
 */

@Injectable()
export class TemplateSeeder {
  constructor(
    // @InjectModel(YourEntity.name) private model: Model<YourEntityDocument>,
  ) {}

  async seed() {
    console.log('🌱 Seeding [your-entities]...');

    const data = [
      {
        // Dados do primeiro registro
        name: 'Example 1',
        // ... outros campos
      },
      {
        // Dados do segundo registro
        name: 'Example 2',
        // ... outros campos
      },
      {
        // Dados do terceiro registro
        name: 'Example 3',
        // ... outros campos
      },
    ];

    for (const item of data) {
      // Verificar se já existe (use um campo único como critério)
      // const existing = await this.model.findOne({ name: item.name });

      // if (!existing) {
      //   await this.model.create(item);
      //   console.log(`✅ Created: ${item.name}`);
      // } else {
      //   console.log(`⏭️  Already exists: ${item.name}`);
      // }
    }

    console.log('✅ [Your entities] seeded successfully\n');
  }

  async drop() {
    console.log('🗑️  Dropping [your-entities]...');
    // await this.model.deleteMany({});
    console.log('✅ [Your entities] dropped successfully\n');
  }
}

