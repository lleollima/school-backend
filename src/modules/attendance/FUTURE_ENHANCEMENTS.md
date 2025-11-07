# Attendance Module - Melhorias e Recursos Futuros 🚀

## 🎯 Melhorias Sugeridas

### 1. Notificações Automáticas 🔔

```typescript
// attendance.service.ts - Adicionar métodos

async checkAndNotifyLowAttendance(threshold: number = 75) {
  // Buscar alunos com frequência abaixo do limite
  const students = await this.userModel.find({ role: 'student' });
  
  for (const student of students) {
    const stats = await this.getStudentAttendanceStats(student._id.toString());
    
    if (stats.attendanceRate < threshold) {
      // Notificar pais, aluno e coordenação
      await this.notificationService.send({
        to: [student._id, ...student.parents, coordinator],
        type: 'LOW_ATTENDANCE_ALERT',
        priority: 'high',
        message: `Alerta: Frequência de ${student.name} está em ${stats.attendanceRate}%`,
        data: stats
      });
    }
  }
}

async notifyAbsence(attendance: Attendance) {
  if (attendance.status === 'absent') {
    const student = await this.userModel.findById(attendance.student);
    
    // Notificar pais imediatamente
    await this.notificationService.send({
      to: student.parents,
      type: 'STUDENT_ABSENT',
      message: `${student.name} foi marcado como ausente hoje`,
      data: attendance
    });
  }
}

async sendDailyReport(classId: string, date: string) {
  const stats = await this.getClassAttendanceStats(classId, date);
  const classInfo = await this.classModel.findById(classId).populate('teacher');
  
  // Enviar relatório diário para professor e coordenação
  await this.notificationService.send({
    to: [classInfo.teacher, coordinator],
    type: 'DAILY_ATTENDANCE_REPORT',
    message: `Resumo de presenças - ${classInfo.name}`,
    data: stats
  });
}
```

### 2. Integração com Calendário Escolar 📅

```typescript
// Criar novo schema para calendário
@Schema()
export class SchoolCalendar {
  @Prop({ required: true })
  date: Date;

  @Prop({ enum: ['school_day', 'holiday', 'weekend', 'exam', 'event'] })
  type: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  isSchoolDay: boolean;
}

// Service method
async isSchoolDay(date: Date): Promise<boolean> {
  const calendar = await this.calendarModel.findOne({
    date: date,
    isSchoolDay: false
  });
  
  return !calendar; // Se não encontrou, é dia letivo
}

async markAttendanceWithValidation(classId: string, dto: MarkAttendanceDto) {
  const date = new Date(dto.date);
  
  // Verificar se é dia letivo
  if (!(await this.isSchoolDay(date))) {
    throw new BadRequestException('Cannot mark attendance on non-school days');
  }
  
  return await this.markAttendance(classId, dto);
}

async getSchoolDaysInPeriod(startDate: Date, endDate: Date): Promise<number> {
  const days = await this.calendarModel.countDocuments({
    date: { $gte: startDate, $lte: endDate },
    isSchoolDay: true
  });
  
  return days;
}
```

### 3. QR Code para Check-in 📱

```typescript
import * as QRCode from 'qrcode';
import { randomBytes } from 'crypto';

// Gerar QR Code para a aula
async generateClassQRCode(classId: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
  
  // Salvar token no cache/redis
  await this.cacheService.set(
    `attendance-qr-${token}`,
    { classId, expiresAt },
    900 // 15 minutos em segundos
  );
  
  // Gerar QR Code
  const qrData = JSON.stringify({ token, classId, expiresAt });
  const qrCodeUrl = await QRCode.toDataURL(qrData);
  
  return qrCodeUrl;
}

// Marcar presença via QR Code
async markAttendanceByQRCode(
  studentId: string,
  token: string,
  location?: { latitude: number; longitude: number }
) {
  // Verificar token
  const qrData = await this.cacheService.get(`attendance-qr-${token}`);
  
  if (!qrData) {
    throw new BadRequestException('Invalid or expired QR code');
  }
  
  if (new Date() > new Date(qrData.expiresAt)) {
    throw new BadRequestException('QR code expired');
  }
  
  // Verificar localização se fornecida
  if (location) {
    const schoolLocation = { latitude: -23.5505, longitude: -46.6333 };
    const isValid = await this.verifyLocationAttendance(
      qrData.classId,
      location,
      schoolLocation
    );
    
    if (!isValid) {
      throw new BadRequestException('Location verification failed');
    }
  }
  
  // Marcar presença
  return await this.markAttendance(qrData.classId, {
    student: studentId,
    date: new Date().toISOString(),
    status: 'present',
    latitude: location?.latitude,
    longitude: location?.longitude,
    notes: 'Marked via QR Code'
  });
}
```

### 4. Reconhecimento Facial (Futuro) 📸

```typescript
import * as faceapi from 'face-api.js';

// Registrar foto do aluno
async registerStudentFace(studentId: string, photo: Buffer) {
  // Detectar face
  const detection = await faceapi
    .detectSingleFace(photo)
    .withFaceLandmarks()
    .withFaceDescriptor();
  
  if (!detection) {
    throw new BadRequestException('No face detected');
  }
  
  // Salvar descritor facial
  await this.studentFaceModel.create({
    student: studentId,
    descriptor: detection.descriptor,
    registeredAt: new Date()
  });
}

// Marcar presença via reconhecimento facial
async markAttendanceByFace(classId: string, photo: Buffer) {
  // Detectar face na foto
  const detection = await faceapi
    .detectSingleFace(photo)
    .withFaceLandmarks()
    .withFaceDescriptor();
  
  if (!detection) {
    throw new BadRequestException('No face detected');
  }
  
  // Buscar face correspondente no banco
  const registeredFaces = await this.studentFaceModel.find();
  let matchedStudent = null;
  let bestMatch = Infinity;
  
  for (const face of registeredFaces) {
    const distance = faceapi.euclideanDistance(
      detection.descriptor,
      face.descriptor
    );
    
    if (distance < bestMatch && distance < 0.6) { // Threshold
      bestMatch = distance;
      matchedStudent = face.student;
    }
  }
  
  if (!matchedStudent) {
    throw new BadRequestException('Face not recognized');
  }
  
  // Marcar presença
  return await this.markAttendance(classId, {
    student: matchedStudent,
    date: new Date().toISOString(),
    status: 'present',
    notes: `Marked by facial recognition (confidence: ${(1 - bestMatch) * 100}%)`
  });
}
```

### 5. Relatórios Avançados 📊

```typescript
// Exportar para Excel
import * as ExcelJS from 'exceljs';

async exportAttendanceToExcel(
  classId: string,
  startDate: string,
  endDate: string
): Promise<Buffer> {
  const attendance = await this.getClassAttendance(classId, {
    startDate,
    endDate
  });
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance');
  
  // Cabeçalhos
  worksheet.columns = [
    { header: 'Aluno', key: 'student', width: 30 },
    { header: 'Data', key: 'date', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Observações', key: 'notes', width: 40 }
  ];
  
  // Dados
  attendance.forEach(record => {
    worksheet.addRow({
      student: record.student.name,
      date: record.date.toLocaleDateString('pt-BR'),
      status: record.status,
      notes: record.notes || ''
    });
  });
  
  // Estilizar cabeçalho
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Retornar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as Buffer;
}

// Gerar PDF com gráficos
import PDFDocument from 'pdfkit';
import ChartJsNode from 'chartjs-node-canvas';

async generateAttendancePDF(studentId: string): Promise<Buffer> {
  const stats = await this.getStudentAttendanceStats(studentId);
  const student = await this.userModel.findById(studentId);
  
  // Criar PDF
  const doc = new PDFDocument();
  const chunks = [];
  
  doc.on('data', chunk => chunks.push(chunk));
  
  // Cabeçalho
  doc.fontSize(20).text('Relatório de Frequência', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Aluno: ${student.name}`);
  doc.fontSize(12).text(`Email: ${student.email}`);
  doc.moveDown();
  
  // Estatísticas
  doc.fontSize(14).text('Resumo', { underline: true });
  doc.fontSize(12);
  doc.text(`Total de registros: ${stats.total}`);
  doc.text(`Presenças: ${stats.present}`);
  doc.text(`Faltas: ${stats.absent}`);
  doc.text(`Atrasos: ${stats.late}`);
  doc.text(`Faltas justificadas: ${stats.excused}`);
  doc.text(`Taxa de frequência: ${stats.attendanceRate}%`);
  
  // Gerar gráfico
  const chartCanvas = new ChartJsNode({ width: 400, height: 300 });
  const chartImage = await chartCanvas.renderToBuffer({
    type: 'pie',
    data: {
      labels: ['Presente', 'Ausente', 'Atrasado', 'Justificado'],
      datasets: [{
        data: [stats.present, stats.absent, stats.late, stats.excused],
        backgroundColor: ['#4CAF50', '#F44336', '#FF9800', '#2196F3']
      }]
    }
  });
  
  doc.moveDown();
  doc.image(chartImage, { width: 400 });
  
  doc.end();
  
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
```

### 6. Geofencing Avançado 🗺️

```typescript
// Configuração de múltiplas localizações (para escolas com vários campus)
@Schema()
export class SchoolLocation {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ default: 100 })
  radius: number; // metros

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }] })
  classes: Class[];
}

async verifyStudentLocation(
  classId: string,
  studentLocation: { latitude: number; longitude: number }
): Promise<{ valid: boolean; distance: number; location: string }> {
  // Buscar localização da escola para esta turma
  const schoolLocation = await this.schoolLocationModel.findOne({
    classes: classId
  });
  
  if (!schoolLocation) {
    throw new NotFoundException('School location not configured for this class');
  }
  
  // Calcular distância
  const R = 6371e3;
  const φ1 = (studentLocation.latitude * Math.PI) / 180;
  const φ2 = (schoolLocation.latitude * Math.PI) / 180;
  const Δφ = ((schoolLocation.latitude - studentLocation.latitude) * Math.PI) / 180;
  const Δλ = ((schoolLocation.longitude - studentLocation.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  
  return {
    valid: distance <= schoolLocation.radius,
    distance: Math.round(distance),
    location: schoolLocation.name
  };
}
```

### 7. Integração com Biometria 👆

```typescript
// Schema para dados biométricos
@Schema()
export class BiometricData {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  student: User;

  @Prop()
  fingerprint: string; // Hash do template biométrico

  @Prop({ type: [String] })
  alternativeFingers: string[];

  @Prop({ default: Date.now })
  registeredAt: Date;
}

async markAttendanceByFingerprint(
  classId: string,
  fingerprintTemplate: string
): Promise<Attendance> {
  // Comparar com templates salvos
  const biometric = await this.biometricModel.findOne({
    $or: [
      { fingerprint: fingerprintTemplate },
      { alternativeFingers: fingerprintTemplate }
    ]
  });
  
  if (!biometric) {
    throw new UnauthorizedException('Fingerprint not recognized');
  }
  
  // Marcar presença
  return await this.markAttendance(classId, {
    student: biometric.student.toString(),
    date: new Date().toISOString(),
    status: 'present',
    notes: 'Marked by fingerprint scanner'
  });
}
```

### 8. Histórico e Auditoria Completa 📝

```typescript
@Schema()
export class AttendanceHistory {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' })
  attendance: Attendance;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  modifiedBy: User;

  @Prop()
  previousStatus: string;

  @Prop()
  newStatus: string;

  @Prop()
  reason: string;

  @Prop({ default: Date.now })
  modifiedAt: Date;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;
}

async updateAttendanceWithHistory(
  id: string,
  newStatus: string,
  userId: string,
  reason: string,
  metadata?: { ipAddress: string; userAgent: string }
): Promise<Attendance> {
  const attendance = await this.attendanceModel.findById(id);
  
  if (!attendance) {
    throw new NotFoundException('Attendance not found');
  }
  
  // Criar registro de histórico
  await this.attendanceHistoryModel.create({
    attendance: id,
    modifiedBy: userId,
    previousStatus: attendance.status,
    newStatus: newStatus,
    reason: reason,
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent
  });
  
  // Atualizar presença
  attendance.status = newStatus;
  return await attendance.save();
}
```

### 9. Dashboard e Analytics 📈

```typescript
// Métricas avançadas
async getClassAnalytics(classId: string, period: 'week' | 'month' | 'year') {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }
  
  const analytics = await this.attendanceModel.aggregate([
    {
      $match: {
        class: new Types.ObjectId(classId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return analytics;
}

// Identificar padrões de ausência
async detectAbsencePatterns(studentId: string) {
  const absences = await this.attendanceModel.find({
    student: studentId,
    status: 'absent',
    date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // últimos 90 dias
  }).sort({ date: 1 });
  
  // Analisar padrões
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
  absences.forEach(absence => {
    const dayOfWeek = new Date(absence.date).getDay();
    dayOfWeekCounts[dayOfWeek]++;
  });
  
  const mostAbsentDay = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts));
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  return {
    totalAbsences: absences.length,
    mostAbsentDay: days[mostAbsentDay],
    absencesByDay: dayOfWeekCounts,
    consecutiveAbsences: this.findConsecutiveAbsences(absences),
    recommendation: this.generateRecommendation(absences.length, mostAbsentDay)
  };
}
```

## 🛣️ Novas Rotas Sugeridas

```typescript
// Controller
@Post('qr-code/generate/:classId')
@Roles('teacher', 'admin')
async generateQRCode(@Param('classId') classId: string) {
  return await this.attendanceService.generateClassQRCode(classId);
}

@Post('qr-code/scan')
@Roles('student')
async scanQRCode(
  @Body() data: { token: string; location?: { latitude: number; longitude: number } },
  @CurrentUser() user: any
) {
  return await this.attendanceService.markAttendanceByQRCode(
    user.userId,
    data.token,
    data.location
  );
}

@Get('analytics/:classId')
@Roles('teacher', 'admin')
async getAnalytics(
  @Param('classId') classId: string,
  @Query('period') period: 'week' | 'month' | 'year'
) {
  return await this.attendanceService.getClassAnalytics(classId, period);
}

@Get('export/excel/:classId')
@Roles('teacher', 'admin')
async exportExcel(
  @Param('classId') classId: string,
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
  @Res() res: Response
) {
  const buffer = await this.attendanceService.exportAttendanceToExcel(
    classId,
    startDate,
    endDate
  );
  
  res.set({
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename=attendance-${classId}.xlsx`
  });
  
  res.send(buffer);
}
```

## 📦 Pacotes NPM Úteis

```bash
# Para QR Code
npm install qrcode @types/qrcode

# Para reconhecimento facial
npm install face-api.js canvas

# Para Excel
npm install exceljs

# Para PDF
npm install pdfkit @types/pdfkit

# Para gráficos
npm install chartjs-node-canvas

# Para cache (Redis)
npm install @nestjs/cache-manager cache-manager

# Para biometria (se necessário)
npm install fingerprintjs2
```

## 🎯 Prioridades de Implementação

### Alta Prioridade 🔴
1. Notificações automáticas para baixa frequência
2. Integração com calendário escolar
3. Exportação para Excel/PDF
4. Dashboard com analytics

### Média Prioridade 🟡
1. QR Code para check-in
2. Geofencing avançado
3. Histórico de alterações
4. Detecção de padrões de ausência

### Baixa Prioridade 🟢
1. Reconhecimento facial
2. Biometria (impressão digital)
3. Integração com RFID
4. App mobile dedicado

---

**Nota**: Estas são sugestões de melhorias. Implemente conforme a necessidade e infraestrutura disponível! 🚀

