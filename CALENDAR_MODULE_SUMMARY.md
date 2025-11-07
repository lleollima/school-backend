# Módulo de Calendário (Calendar Module) - Resumo de Implementação

## ✅ Status: Concluído

## 📁 Estrutura Criada

```
src/modules/calendar/
├── calendar.controller.ts      # Controlador com rotas REST
├── calendar.service.ts          # Lógica de negócio
├── calendar.module.ts           # Módulo NestJS
├── README.md                    # Documentação completa
├── schemas/
│   └── event.schema.ts         # Schema MongoDB
└── dto/
    ├── create-event.dto.ts     # DTO para criação
    ├── update-event.dto.ts     # DTO para atualização
    └── filter-event.dto.ts     # DTO para filtros

calendar.http                    # Arquivo de testes HTTP (raiz do projeto)
```

## 📊 Schema - Event

```typescript
@Schema({ timestamps: true })
export class Event {
  title: string                           // Título do evento
  type: enum                              // Tipo de evento
  description: string (opcional)          // Descrição
  date: Date                              // Data do evento
  endDate: Date (opcional)                // Data final (eventos múltiplos dias)
  startTime: string (opcional)            // Hora início (HH:mm)
  endTime: string (opcional)              // Hora fim (HH:mm)
  location: string (opcional)             // Local
  priority: enum (opcional)               // Prioridade (low, medium, high)
  createdBy: ObjectId (ref: User)        // Criador
  participants: ObjectId[] (ref: User)   // Participantes
  classes: ObjectId[] (ref: Class)       // Turmas relacionadas
  allDay: boolean                         // Evento dia inteiro
  isRecurring: boolean                    // Evento recorrente
  recurrencePattern: enum (opcional)      // Padrão de recorrência
  recurrenceEndDate: Date (opcional)      // Fim da recorrência
  color: string (opcional)                // Cor (hex code)
  notificationSent: boolean               // Notificação enviada
  reminderMinutes: number (opcional)      // Lembrete (minutos antes)
}

// Índices para performance
- date
- type
- (date, type)
```

### Tipos de Evento:
- 📅 `meeting` - Reuniões
- 📝 `exam` - Provas/Exames
- 🎉 `holiday` - Feriados
- 📚 `class` - Aulas
- 🎯 `event` - Eventos escolares
- ⏰ `deadline` - Prazos
- ➕ `other` - Outros

### Níveis de Prioridade:
- 🟢 `low` - Baixa
- 🟡 `medium` - Média (padrão)
- 🔴 `high` - Alta

### Padrões de Recorrência:
- 📆 `daily` - Diário
- 📅 `weekly` - Semanal
- 📊 `monthly` - Mensal
- 🗓️ `yearly` - Anual

## 🔧 Métodos do Service

### ✅ Implementados (16 métodos):
1. **createEvent(dto, userId)** - Criar evento
2. **getEvents(filters)** - Listar eventos com filtros
3. **getEventById(id)** - Buscar evento específico
4. **getEventsByMonth(year, month)** - Eventos por mês
5. **getEventsByDateRange(start, end)** - Por intervalo de datas
6. **getUpcomingEvents(limit)** - Próximos eventos
7. **getEventsByType(type)** - Por tipo
8. **updateEvent(id, dto)** - Atualizar evento
9. **deleteEvent(id)** - Deletar evento
10. **getEventsForClass(classId)** - Eventos de uma turma
11. **getEventsForUser(userId)** - Eventos de um usuário
12. **getHolidays(year)** - Feriados
13. **getExams(classId)** - Provas
14. **checkConflicts(...)** - Verificar conflitos de horário
15. **getEventStats(...)** - Estatísticas de eventos
16. **generateRecurringEvents(...)** - Gerar eventos recorrentes

## 🛣️ Rotas da API

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/calendar` | All | Listar eventos |
| POST | `/calendar` | Admin, Teacher | Criar evento |
| GET | `/calendar/upcoming` | All | Próximos eventos |
| GET | `/calendar/month/:year/:month` | All | Eventos do mês |
| GET | `/calendar/type/:type` | All | Por tipo |
| GET | `/calendar/holidays` | All | Feriados |
| GET | `/calendar/exams` | All | Provas |
| GET | `/calendar/class/:classId` | All | Por turma |
| GET | `/calendar/user/:userId` | All | Por usuário |
| GET | `/calendar/stats` | Admin, Teacher | Estatísticas |
| GET | `/calendar/:id` | All | Evento específico |
| PATCH | `/calendar/:id` | Admin, Teacher | Atualizar |
| DELETE | `/calendar/:id` | Admin | Deletar |
| POST | `/calendar/recurring` | Admin, Teacher | Gerar recorrentes |
| POST | `/calendar/check-conflicts` | Admin, Teacher | Verificar conflitos |

## 🔐 Controle de Acesso (RBAC)

| Ação | Student | Teacher | Parent | Admin |
|------|---------|---------|--------|-------|
| Ver Eventos | ✅ | ✅ | ✅ | ✅ |
| Criar Evento | ❌ | ✅ | ❌ | ✅ |
| Atualizar Evento | ❌ | ✅ | ❌ | ✅ |
| Deletar Evento | ❌ | ❌ | ❌ | ✅ |
| Ver Estatísticas | ❌ | ✅ | ❌ | ✅ |

## ✅ Validações Implementadas

### CreateEventDto:
- ✅ `title`: Required, string
- ✅ `type`: Required, enum (7 tipos)
- ✅ `description`: Optional, string
- ✅ `date`: Required, ISO date string
- ✅ `endDate`: Optional, ISO date string (>= date)
- ✅ `startTime`: Optional, formato HH:mm (regex validation)
- ✅ `endTime`: Optional, formato HH:mm (regex validation)
- ✅ `location`: Optional, string
- ✅ `priority`: Optional, enum (low, medium, high)
- ✅ `participants`: Optional, array de MongoIds
- ✅ `classes`: Optional, array de MongoIds
- ✅ `allDay`: Optional, boolean
- ✅ `isRecurring`: Optional, boolean
- ✅ `recurrencePattern`: Optional, enum (4 padrões)
- ✅ `recurrenceEndDate`: Optional, ISO date string
- ✅ `color`: Optional, hex code (regex #RRGGBB)
- ✅ `reminderMinutes`: Optional, integer >= 0

### UpdateEventDto:
- Todos os campos opcionais, mesmas validações

### FilterEventDto:
- ✅ `type`: Optional, enum
- ✅ `startDate`: Optional, ISO date string
- ✅ `endDate`: Optional, ISO date string
- ✅ `classId`: Optional, MongoId
- ✅ `userId`: Optional, MongoId
- ✅ `priority`: Optional, enum
- ✅ `sortBy`: Optional, enum (date, title, type, priority)
- ✅ `sortOrder`: Optional, 'asc' ou 'desc'

## 🔗 Integrações

- ✅ Integrado com **AuthModule** (JWT + Guards)
- ✅ Integrado com **User Schema** (createdBy, participants)
- ✅ Integrado com **Class Schema** (classes)
- ✅ Registrado no **AppModule**

## 📝 Recursos Especiais

### 1. Eventos Recorrentes 🔄
```typescript
{
  "isRecurring": true,
  "recurrencePattern": "weekly",
  "recurrenceEndDate": "2024-12-31"
}

// Gera múltiplas ocorrências automaticamente
generateRecurringEvents(event, 50);
```

### 2. Eventos Multi-Dia 📅
```typescript
{
  "date": "2024-07-10",
  "endDate": "2024-07-12",
  "allDay": true
}
```

### 3. Detecção de Conflitos ⚠️
```typescript
checkConflicts(date, "09:00", "11:00");
// Retorna eventos que conflitam com o horário
```

### 4. Participantes e Turmas 👥
```typescript
{
  "participants": ["userId1", "userId2"],
  "classes": ["classId1", "classId2"]
}
```

### 5. Cores Personalizadas 🎨
```typescript
{
  "color": "#FF5733" // Hex color code
}
```

### 6. Lembretes ⏰
```typescript
{
  "reminderMinutes": 60 // 1 hora antes
}
```

### 7. Estatísticas 📊
```json
{
  "total": 50,
  "meeting": 10,
  "exam": 15,
  "holiday": 8,
  "class": 12,
  "event": 3,
  "deadline": 2,
  "other": 0
}
```

## 📋 Exemplos de Uso

### 1. Criar Prova:
```http
POST http://localhost:3000/calendar
Authorization: Bearer {token}

{
  "title": "Prova de Matemática",
  "type": "exam",
  "date": "2024-06-15",
  "startTime": "09:00",
  "endTime": "11:00",
  "classes": ["classId"],
  "priority": "high",
  "color": "#3498db"
}
```

### 2. Criar Evento Recorrente:
```http
POST http://localhost:3000/calendar/recurring

{
  "event": {
    "title": "Reunião Semanal",
    "type": "meeting",
    "date": "2024-01-08",
    "startTime": "10:00",
    "endTime": "11:00",
    "isRecurring": true,
    "recurrencePattern": "weekly",
    "recurrenceEndDate": "2024-12-31"
  },
  "occurrences": 50
}
```

### 3. Ver Próximos Eventos:
```http
GET http://localhost:3000/calendar/upcoming?limit=5
Authorization: Bearer {token}
```

### 4. Ver Calendário do Mês:
```http
GET http://localhost:3000/calendar/month/2024/6
Authorization: Bearer {token}
```

### 5. Verificar Conflitos:
```http
POST http://localhost:3000/calendar/check-conflicts

{
  "date": "2024-06-15",
  "startTime": "09:00",
  "endTime": "11:00"
}
```

## 🧪 Testes

Arquivo de testes HTTP criado: `calendar.http`

**Inclui 45 cenários de teste:**
- ✅ Criar eventos (todos os tipos)
- ✅ Eventos recorrentes
- ✅ Eventos multi-dia
- ✅ Filtros avançados
- ✅ Consultas por mês
- ✅ Consultas por tipo
- ✅ Feriados e provas
- ✅ Estatísticas
- ✅ Detecção de conflitos
- ✅ Participantes e turmas
- ✅ Cenários de erro
- ✅ Validações

## 🎯 Casos de Uso Práticos

### Caso 1: Calendário Acadêmico
```typescript
// Criar feriados do ano
const holidays = [
  { title: 'Ano Novo', date: '2024-01-01' },
  { title: 'Carnaval', date: '2024-02-13' },
  { title: 'Natal', date: '2024-12-25' }
];

for (const holiday of holidays) {
  await calendarService.createEvent({
    ...holiday,
    type: 'holiday',
    allDay: true,
    color: '#e74c3c'
  });
}
```

### Caso 2: Agendar Provas
```typescript
// Criar prova para turma
await calendarService.createEvent({
  title: 'Prova Final - Matemática',
  type: 'exam',
  date: '2024-06-15',
  startTime: '09:00',
  endTime: '11:00',
  classes: [classId],
  priority: 'high',
  reminderMinutes: 1440 // 24 horas antes
});
```

### Caso 3: Reuniões Recorrentes
```typescript
// Gerar reuniões semanais
await calendarService.generateRecurringEvents({
  title: 'Reunião de Coordenação',
  type: 'meeting',
  date: '2024-01-08',
  startTime: '10:00',
  endTime: '11:00',
  isRecurring: true,
  recurrencePattern: 'weekly',
  recurrenceEndDate: '2024-12-31'
}, 50);
```

### Caso 4: Dashboard de Eventos
```typescript
// Próximos eventos
const upcoming = await calendarService.getUpcomingEvents(10);

// Estatísticas do mês
const stats = await calendarService.getEventStats(
  new Date('2024-06-01'),
  new Date('2024-06-30')
);

// Eventos da semana
const thisWeek = await calendarService.getEventsByDateRange(
  startOfWeek,
  endOfWeek
);
```

## 📊 Métricas Disponíveis

O módulo permite visualizar:
- ✅ Total de eventos por tipo
- ✅ Eventos por período
- ✅ Próximos eventos
- ✅ Eventos por turma
- ✅ Eventos por usuário
- ✅ Feriados e provas
- ✅ Conflitos de horário

## 🔒 Segurança

1. **Autenticação obrigatória** - Todas as rotas protegidas por JWT
2. **Autorização por role** - Controle de acesso por tipo de usuário
3. **Validação de dados** - DTOs com class-validator
4. **Validação de datas** - End date >= start date
5. **Validação de horários** - Formato HH:mm com regex
6. **Validação de cores** - Hex code com regex

## 💡 Melhorias Futuras Sugeridas

1. **Notificações automáticas** 🔔
   - Email antes do evento
   - SMS/WhatsApp para eventos importantes
   - Push notifications no app

2. **Integração com Google Calendar** 📅
   - Sincronização bidirecional
   - Import/export de eventos
   - iCal format support

3. **Visualizações avançadas** 📊
   - Calendário mensal interativo
   - Timeline view
   - Agenda view
   - Gantt chart para projetos

4. **Recursos colaborativos** 👥
   - RSVP para eventos
   - Comentários em eventos
   - Anexos e documentos
   - Votação de horários

5. **Automação** 🤖
   - Geração automática de eventos acadêmicos
   - Sugestão de horários sem conflitos
   - Templates de eventos
   - Bulk import via CSV/Excel

## 📚 Documentação

- ✅ README.md completo em `src/modules/calendar/README.md`
- ✅ Resumo técnico neste arquivo
- ✅ Arquivo de testes em `calendar.http`
- ✅ Comentários JSDoc em todas as rotas

---

## ✨ Destaques da Implementação

1. **Schema completo** com 20+ campos
2. **7 tipos de eventos** diferentes
3. **Eventos recorrentes** com 4 padrões
4. **Detecção de conflitos** de horário
5. **Eventos multi-dia** suportados
6. **Participantes e turmas** vinculados
7. **Cores personalizadas** para visualização
8. **Lembretes configuráveis**
9. **Filtros avançados** flexíveis
10. **Estatísticas em tempo real**
11. **Validação robusta** (regex para horários e cores)
12. **Índices otimizados** para performance

---

**Módulo implementado com sucesso! 🎉**

Todos os requisitos foram atendidos:
- Schema EventSchema ✅
- Rotas da API (GET, POST, PATCH, DELETE) ✅
- Tipos de evento (meeting, exam, holiday) ✅
- Métodos do Service ✅
- Controle de acesso (RBAC) ✅
- Validações ✅
- Recursos extras (recorrência, conflitos, etc.) ✅
- Documentação ✅

