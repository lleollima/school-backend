# Grades Module - Melhorias e Recursos Futuros 🚀

## 🎯 Melhorias Sugeridas

### 1. Estatísticas e Análises 📊
```typescript
// grades.service.ts - Métodos adicionais

// Calcular média geral do estudante
async getStudentAverage(studentId: string): Promise<number> {
  const grades = await this.gradeModel.find({ student: studentId });
  if (grades.length === 0) return 0;
  const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
  return sum / grades.length;
}

// Calcular média por matéria
async getStudentAverageBySubject(studentId: string): Promise<any[]> {
  return await this.gradeModel.aggregate([
    { $match: { student: new Types.ObjectId(studentId) } },
    {
      $group: {
        _id: '$subject',
        average: { $avg: '$score' },
        count: { $sum: 1 },
        highest: { $max: '$score' },
        lowest: { $min: '$score' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
}

// Média da turma por matéria
async getClassAverageBySubject(classId: string): Promise<any[]> {
  return await this.gradeModel.aggregate([
    { $match: { class: new Types.ObjectId(classId) } },
    {
      $group: {
        _id: '$subject',
        average: { $avg: '$score' },
        studentsCount: { $addToSet: '$student' },
        totalGrades: { $sum: 1 }
      }
    }
  ]);
}
```

### 2. Relatórios 📑
```typescript
// Boletim completo do estudante
async getStudentReportCard(studentId: string, term?: string) {
  const query: any = { student: studentId };
  if (term) query.term = term;
  
  const grades = await this.gradeModel.find(query)
    .populate('class', 'name year')
    .sort({ subject: 1 });
    
  const average = await this.getStudentAverage(studentId);
  
  return {
    student: await this.userModel.findById(studentId),
    grades,
    average,
    term: term || 'All terms',
    generatedAt: new Date()
  };
}

// Ranking da turma
async getClassRanking(classId: string, subject?: string) {
  const matchStage: any = { class: new Types.ObjectId(classId) };
  if (subject) matchStage.subject = subject;
  
  return await this.gradeModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$student',
        average: { $avg: '$score' },
        totalGrades: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'studentInfo'
      }
    },
    { $unwind: '$studentInfo' },
    { $sort: { average: -1 } },
    {
      $project: {
        student: {
          _id: '$studentInfo._id',
          name: '$studentInfo.name'
        },
        average: 1,
        totalGrades: 1
      }
    }
  ]);
}
```

### 3. Filtros Avançados 🔍
```typescript
// DTO para filtros
export class FilterGradesDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  term?: string;

  @IsOptional()
  @IsNumber()
  minScore?: number;

  @IsOptional()
  @IsNumber()
  maxScore?: number;

  @IsOptional()
  @IsString()
  sortBy?: 'score' | 'subject' | 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

// Service method
async getGradesWithFilters(
  classId: string,
  filters: FilterGradesDto
): Promise<Grade[]> {
  const query: any = { class: classId };
  
  if (filters.subject) query.subject = filters.subject;
  if (filters.term) query.term = filters.term;
  if (filters.minScore !== undefined) {
    query.score = { ...query.score, $gte: filters.minScore };
  }
  if (filters.maxScore !== undefined) {
    query.score = { ...query.score, $lte: filters.maxScore };
  }

  const sortField = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

  return await this.gradeModel
    .find(query)
    .populate('student', 'name email')
    .populate('class', 'name year')
    .sort({ [sortField]: sortOrder })
    .exec();
}
```

### 4. Histórico de Alterações 📝
```typescript
// Adicionar ao schema
@Schema()
export class GradeHistory {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Grade' })
  gradeId: Grade;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  modifiedBy: User;

  @Prop()
  previousScore: number;

  @Prop()
  newScore: number;

  @Prop()
  reason: string;

  @Prop({ default: Date.now })
  modifiedAt: Date;
}

// Método para registrar alteração
async updateGradeWithHistory(
  id: string,
  dto: UpdateGradeDto,
  userId: string,
  reason?: string
): Promise<Grade> {
  const oldGrade = await this.gradeModel.findById(id);
  
  if (dto.score && dto.score !== oldGrade.score) {
    await this.gradeHistoryModel.create({
      gradeId: id,
      modifiedBy: userId,
      previousScore: oldGrade.score,
      newScore: dto.score,
      reason: reason || 'Grade update'
    });
  }
  
  return await this.updateGrade(id, dto);
}
```

### 5. Notificações 🔔
```typescript
// Notificar estudante/pais sobre nova nota
async addGradeWithNotification(classId: string, dto: CreateGradeDto) {
  const grade = await this.addGrade(classId, dto);
  
  // Enviar notificação
  await this.notificationService.send({
    to: dto.student,
    type: 'NEW_GRADE',
    message: `Nova nota em ${dto.subject}: ${dto.score}`,
    data: grade
  });
  
  return grade;
}

// Notificar sobre notas baixas
async checkLowGradesAndNotify(threshold: number = 60) {
  const lowGrades = await this.gradeModel
    .find({ score: { $lt: threshold } })
    .populate('student')
    .exec();
    
  for (const grade of lowGrades) {
    await this.notificationService.send({
      to: grade.student,
      type: 'LOW_GRADE_ALERT',
      message: `Atenção: Nota baixa em ${grade.subject}`,
      data: grade
    });
  }
}
```

### 6. Exportação de Dados 📥
```typescript
// Exportar notas em CSV
async exportGradesToCSV(classId: string): Promise<string> {
  const grades = await this.getGradesByClass(classId);
  
  const csv = grades.map(g => 
    `${g.student.name},${g.subject},${g.score},${g.term || 'N/A'}`
  ).join('\n');
  
  return `Student,Subject,Score,Term\n${csv}`;
}

// Exportar relatório em PDF (usando biblioteca como pdfkit)
async exportReportCardToPDF(studentId: string) {
  const reportCard = await this.getStudentReportCard(studentId);
  // Implementar geração de PDF
}
```

### 7. IA e OCR 🤖
```typescript
// Upload de imagem com OCR
import * as Tesseract from 'tesseract.js';

async processGradeSheet(
  file: Express.Multer.File,
  classId: string
): Promise<Grade[]> {
  // 1. Processar imagem com OCR
  const { data: { text } } = await Tesseract.recognize(file.path, 'por');
  
  // 2. Extrair dados estruturados (usar IA/regex)
  const extractedGrades = this.parseGradeText(text);
  
  // 3. Criar grades no banco
  const grades = [];
  for (const gradeData of extractedGrades) {
    const grade = await this.addGrade(classId, gradeData);
    grades.push(grade);
  }
  
  return grades;
}

// Parser inteligente usando IA
private parseGradeText(text: string): CreateGradeDto[] {
  // Implementar parsing com regex ou IA (OpenAI, etc)
  // Exemplo: "João - Matemática: 85"
}
```

### 8. Validações Adicionais ✅
```typescript
// Verificar se estudante está na turma antes de adicionar nota
async addGrade(classId: string, dto: CreateGradeDto): Promise<Grade> {
  // Verificar se estudante existe na turma
  const classDoc = await this.classModel.findById(classId);
  const isStudentInClass = classDoc.students.some(
    s => s.toString() === dto.student
  );
  
  if (!isStudentInClass) {
    throw new BadRequestException(
      'Student is not enrolled in this class'
    );
  }
  
  // Verificar duplicatas (mesma matéria, mesmo período)
  const existingGrade = await this.gradeModel.findOne({
    class: classId,
    student: dto.student,
    subject: dto.subject,
    term: dto.term
  });
  
  if (existingGrade) {
    throw new BadRequestException(
      'Grade already exists for this subject and term'
    );
  }
  
  return await this.gradeModel.create({
    ...dto,
    class: classId
  });
}
```

### 9. Paginação 📄
```typescript
async getGradesByStudentPaginated(
  studentId: string,
  page: number = 1,
  limit: number = 10
) {
  const skip = (page - 1) * limit;
  
  const [grades, total] = await Promise.all([
    this.gradeModel
      .find({ student: studentId })
      .populate('class', 'name year')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec(),
    this.gradeModel.countDocuments({ student: studentId })
  ]);
  
  return {
    data: grades,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

### 10. Comentários e Feedback 💬
```typescript
// Adicionar ao schema
@Schema()
export class Grade {
  // ...campos existentes...
  
  @Prop()
  teacherComments?: string;
  
  @Prop()
  feedback?: string;
  
  @Prop()
  attachments?: string[]; // URLs de arquivos anexos
}

// Método para adicionar comentário
async addTeacherComment(
  gradeId: string,
  comment: string,
  teacherId: string
): Promise<Grade> {
  return await this.gradeModel.findByIdAndUpdate(
    gradeId,
    { 
      teacherComments: comment,
      lastModifiedBy: teacherId,
      lastModifiedAt: new Date()
    },
    { new: true }
  );
}
```

## 🛣️ Novas Rotas Sugeridas

```typescript
// Controller adicional
@Get('student/:studentId/average')
async getStudentAverage(@Param('studentId') studentId: string) {
  return await this.gradesService.getStudentAverage(studentId);
}

@Get('student/:studentId/report-card')
async getReportCard(
  @Param('studentId') studentId: string,
  @Query('term') term?: string
) {
  return await this.gradesService.getStudentReportCard(studentId, term);
}

@Get('class/:classId/ranking')
async getClassRanking(
  @Param('classId') classId: string,
  @Query('subject') subject?: string
) {
  return await this.gradesService.getClassRanking(classId, subject);
}

@Get('class/:classId/export/csv')
async exportCSV(@Param('classId') classId: string) {
  const csv = await this.gradesService.exportGradesToCSV(classId);
  return { data: csv, mimeType: 'text/csv' };
}

@Post('ai-upload')
@UseInterceptors(FileInterceptor('file'))
async aiUpload(
  @UploadedFile() file: Express.Multer.File,
  @Body('classId') classId: string
) {
  return await this.gradesService.processGradeSheet(file, classId);
}
```

## 📦 Pacotes NPM Úteis

```bash
# Para OCR
npm install tesseract.js

# Para geração de PDF
npm install pdfkit @types/pdfkit

# Para Excel
npm install exceljs

# Para gráficos
npm install chart.js canvas

# Para envio de emails
npm install @nestjs-modules/mailer nodemailer

# Para processamento de imagens
npm install sharp

# Para IA (OpenAI)
npm install openai
```

## 🎯 Prioridades de Implementação

1. **Alta Prioridade** 🔴
   - Estatísticas básicas (média)
   - Validação de estudante na turma
   - Histórico de alterações

2. **Média Prioridade** 🟡
   - Filtros avançados
   - Paginação
   - Exportação CSV/Excel
   - Comentários do professor

3. **Baixa Prioridade** 🟢
   - IA e OCR
   - Notificações automáticas
   - Ranking da turma
   - Geração de PDF

---

**Nota**: Essas são sugestões de melhorias. Implemente conforme a necessidade do projeto! 🚀

